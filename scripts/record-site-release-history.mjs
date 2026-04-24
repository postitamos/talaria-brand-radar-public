import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseReleaseManifest } from './verify-site-release-manifest.mjs';

const entryPath = fileURLToPath(import.meta.url);
const repoRoot = process.cwd();

const defaults = {
  manifestPath: path.join(repoRoot, 'public', 'data', 'site_release.latest.json'),
  historyPath: path.join(repoRoot, 'public', 'data', 'site_release_history.json'),
};

export function parseArgs(argv) {
  const manifestIndex = argv.indexOf('--manifest');
  const historyIndex = argv.indexOf('--history');
  const commitIndex = argv.indexOf('--commit-sha');
  const deployedAtIndex = argv.indexOf('--deployed-at');

  return {
    manifestPath: manifestIndex >= 0 ? argv[manifestIndex + 1] : defaults.manifestPath,
    historyPath: historyIndex >= 0 ? argv[historyIndex + 1] : defaults.historyPath,
    commitSha: commitIndex >= 0 ? argv[commitIndex + 1] : process.env.GITHUB_SHA,
    deployedAt: deployedAtIndex >= 0 ? argv[deployedAtIndex + 1] : new Date().toISOString(),
  };
}

function resolveCommitSha(explicitCommitSha) {
  if (explicitCommitSha && explicitCommitSha.trim()) {
    return explicitCommitSha.trim();
  }

  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf-8',
  }).trim();
}

export function createEmptyHistory() {
  return {
    artifact_kind: 'site_release_history',
    artifact_version: 'site-release-history-v1',
    generated_at: null,
    releases: [],
  };
}

export function parseHistory(raw) {
  const history = JSON.parse(raw);

  if (history.artifact_kind !== 'site_release_history') {
    throw new Error(`Unexpected history artifact_kind: ${history.artifact_kind}`);
  }

  if (!Array.isArray(history.releases)) {
    throw new Error('Release history is missing the releases array.');
  }

  return history;
}

export function buildHistoryEntry({ manifest, commitSha, deployedAt }) {
  return {
    release_id: `${manifest.snapshot_captured_at}::${commitSha}`,
    deployed_at: deployedAt,
    public_repo_commit_sha: commitSha,
    source_snapshot_captured_at: manifest.snapshot_captured_at,
    score_version: manifest.score_version,
    visible_ranked_rows: manifest.release_summary.visible_ranked_rows,
    publishable_rows: manifest.release_summary.publishable_rows,
    limited_rows: manifest.release_summary.limited_rows,
    newsletter_default_candidates: manifest.release_summary.newsletter_default_candidates,
    public_base_url: manifest.verification_baseline.expected_live_base_url,
  };
}

export function appendReleaseHistory({ history, entry, generatedAt }) {
  const alreadyRecorded = history.releases.some(
    (existing) =>
      existing.public_repo_commit_sha === entry.public_repo_commit_sha &&
      existing.source_snapshot_captured_at === entry.source_snapshot_captured_at,
  );

  if (alreadyRecorded) {
    return {
      history,
      changed: false,
    };
  }

  return {
    history: {
      artifact_kind: 'site_release_history',
      artifact_version: 'site-release-history-v1',
      generated_at: generatedAt,
      releases: [...history.releases, entry],
    },
    changed: true,
  };
}

export async function recordReleaseHistory({
  manifestPath,
  historyPath,
  commitSha,
  deployedAt,
}) {
  const resolvedManifestPath = path.resolve(repoRoot, manifestPath);
  const resolvedHistoryPath = path.resolve(repoRoot, historyPath);
  const releaseCommitSha = resolveCommitSha(commitSha);

  const manifestRaw = await fs.readFile(resolvedManifestPath, 'utf-8');
  const manifest = parseReleaseManifest(manifestRaw);

  let history = createEmptyHistory();
  try {
    history = parseHistory(await fs.readFile(resolvedHistoryPath, 'utf-8'));
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') {
      throw error;
    }
  }

  const entry = buildHistoryEntry({
    manifest,
    commitSha: releaseCommitSha,
    deployedAt,
  });

  const { history: nextHistory, changed } = appendReleaseHistory({
    history,
    entry,
    generatedAt: deployedAt,
  });

  if (changed) {
    await fs.writeFile(resolvedHistoryPath, JSON.stringify(nextHistory, null, 2));
  }

  return {
    ok: true,
    changed,
    release_id: entry.release_id,
    public_repo_commit_sha: releaseCommitSha,
    source_snapshot_captured_at: manifest.snapshot_captured_at,
    total_recorded_releases: nextHistory.releases.length,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const result = await recordReleaseHistory(args);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === entryPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
