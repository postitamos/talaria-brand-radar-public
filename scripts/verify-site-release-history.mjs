import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const entryPath = fileURLToPath(import.meta.url);
const repoRoot = process.cwd();

const defaultHistoryPath = path.join(repoRoot, 'public', 'data', 'site_release_history.json');

export function parseArgs(argv) {
  const historyIndex = argv.indexOf('--history');
  return {
    historyPath: historyIndex >= 0 ? argv[historyIndex + 1] : defaultHistoryPath,
  };
}

export function parseHistory(raw) {
  const history = JSON.parse(raw);

  if (history.artifact_kind !== 'site_release_history') {
    throw new Error(`Unexpected artifact_kind: ${history.artifact_kind}`);
  }

  if (history.artifact_version !== 'site-release-history-v1') {
    throw new Error(`Unexpected artifact_version: ${history.artifact_version}`);
  }

  if (!Array.isArray(history.releases)) {
    throw new Error('Release history must contain a releases array.');
  }

  return history;
}

export function verifyHistory(history) {
  const seenReleaseIds = new Set();
  let previousTimestamp = null;

  for (const entry of history.releases) {
    if (
      !entry.release_id ||
      !entry.deployed_at ||
      !entry.public_repo_commit_sha ||
      !entry.source_snapshot_captured_at ||
      !entry.score_version
    ) {
      throw new Error('Release history entry is missing a required field.');
    }

    if (seenReleaseIds.has(entry.release_id)) {
      throw new Error(`Duplicate release_id in history: ${entry.release_id}`);
    }
    seenReleaseIds.add(entry.release_id);

    const currentTimestamp = new Date(entry.deployed_at).toISOString();
    if (previousTimestamp && currentTimestamp < previousTimestamp) {
      throw new Error('Release history must remain append-only in deployment order.');
    }
    previousTimestamp = currentTimestamp;
  }

  return {
    ok: true,
    total_recorded_releases: history.releases.length,
    latest_release_id: history.releases.at(-1)?.release_id ?? null,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const raw = await fs.readFile(path.resolve(repoRoot, args.historyPath), 'utf-8');
  const result = verifyHistory(parseHistory(raw));
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === entryPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
