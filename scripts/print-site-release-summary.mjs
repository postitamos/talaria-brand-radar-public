import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseReleaseManifest } from './verify-site-release-manifest.mjs';

const entryPath = fileURLToPath(import.meta.url);
const repoRoot = process.cwd();

const defaultManifestPath = path.join(repoRoot, 'public', 'data', 'site_release.latest.json');

export function parseArgs(argv) {
  const manifestIndex = argv.indexOf('--manifest');
  return {
    manifestPath: manifestIndex >= 0 ? argv[manifestIndex + 1] : defaultManifestPath,
  };
}

export function buildReleaseSummary(manifest) {
  return {
    snapshot_captured_at: manifest.snapshot_captured_at,
    score_version: manifest.score_version,
    visible_ranked_rows: manifest.release_summary.visible_ranked_rows,
    publishable_rows: manifest.release_summary.publishable_rows,
    limited_rows: manifest.release_summary.limited_rows,
    newsletter_default_candidates: manifest.release_summary.newsletter_default_candidates,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const raw = await fs.readFile(path.resolve(repoRoot, args.manifestPath), 'utf-8');
  const manifest = parseReleaseManifest(raw);
  console.log(JSON.stringify(buildReleaseSummary(manifest), null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === entryPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
