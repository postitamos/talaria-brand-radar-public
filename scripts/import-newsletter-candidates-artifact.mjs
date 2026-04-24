import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = process.cwd();
const defaultSource = path.resolve(
  repoRoot,
  '..',
  'talaria-brand-radar',
  'temp',
  'public_scores',
  'newsletter_candidate_brands.latest.json',
);
const entryPath = fileURLToPath(import.meta.url);

export function parseArgs(argv) {
  const sourceIndex = argv.indexOf('--source');
  return {
    source: sourceIndex >= 0 ? argv[sourceIndex + 1] : defaultSource,
  };
}

export function snapshotSlug(snapshotCapturedAt) {
  return snapshotCapturedAt.replace(/:/g, '-');
}

export function parseArtifact(raw) {
  const artifact = JSON.parse(raw);

  if (artifact.artifact_kind !== 'newsletter_candidates') {
    throw new Error(`Unexpected artifact_kind: ${artifact.artifact_kind}`);
  }

  if (!artifact.snapshot_captured_at || !artifact.score_version) {
    throw new Error('Artifact is missing snapshot_captured_at or score_version.');
  }

  return artifact;
}

export async function importArtifact({ source, root = repoRoot }) {
  const sourcePath = path.resolve(root, source);
  const raw = await fs.readFile(sourcePath, 'utf-8');
  const artifact = parseArtifact(raw);

  const dataDir = path.join(root, 'public', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  const slug = snapshotSlug(artifact.snapshot_captured_at);
  const snapshotFilename = `newsletter_candidate_brands.${slug}.json`;
  const latestFilename = 'newsletter_candidate_brands.latest.json';
  const metadataFilename = 'newsletter_candidate_brands.metadata.json';

  const metadata = {
    artifact_kind: artifact.artifact_kind,
    artifact_version: artifact.artifact_version,
    snapshot_captured_at: artifact.snapshot_captured_at,
    score_version: artifact.score_version,
    source_path: path.relative(root, sourcePath),
    latest_alias: latestFilename,
    snapshot_filename: snapshotFilename,
  };

  await fs.writeFile(path.join(dataDir, snapshotFilename), JSON.stringify(artifact, null, 2));
  await fs.writeFile(path.join(dataDir, latestFilename), JSON.stringify(artifact, null, 2));
  await fs.writeFile(path.join(dataDir, metadataFilename), JSON.stringify(metadata, null, 2));

  return {
    imported: true,
    source: sourcePath,
    snapshot_filename: snapshotFilename,
    latest_alias: latestFilename,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const { source } = parseArgs(argv);
  const result = await importArtifact({ source });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === entryPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
