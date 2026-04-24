import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = process.cwd();
const defaultArtifactPath = path.resolve(
  repoRoot,
  'public',
  'data',
  'public_brand_rankings.latest.json',
);
const defaultMetadataPath = path.resolve(
  repoRoot,
  'public',
  'data',
  'public_brand_rankings.metadata.json',
);
const entryPath = fileURLToPath(import.meta.url);

export function parseArgs(argv) {
  const artifactIndex = argv.indexOf('--artifact');
  const metadataIndex = argv.indexOf('--metadata');

  return {
    artifactPath: artifactIndex >= 0 ? argv[artifactIndex + 1] : defaultArtifactPath,
    metadataPath: metadataIndex >= 0 ? argv[metadataIndex + 1] : defaultMetadataPath,
  };
}

export function parseRankingsArtifact(raw) {
  const artifact = JSON.parse(raw);

  if (artifact.artifact_kind !== 'public_rankings') {
    throw new Error(`Unexpected artifact_kind: ${artifact.artifact_kind}`);
  }

  if (!artifact.snapshot_captured_at || !artifact.score_version || !Array.isArray(artifact.ranked_brands)) {
    throw new Error('Artifact is missing required public rankings fields.');
  }

  return artifact;
}

export function parseMetadata(raw) {
  const metadata = JSON.parse(raw);

  if (!metadata.snapshot_captured_at || !metadata.snapshot_filename || !metadata.latest_alias) {
    throw new Error('Metadata is missing required fields.');
  }

  return metadata;
}

export function verifyRankingsArtifact(artifact, metadata) {
  const statuses = new Set(['publishable', 'limited']);
  const blockedRows = artifact.ranked_brands.filter((brand) => brand.publication_status === 'blocked');

  if (blockedRows.length > 0) {
    throw new Error('Blocked rows are present in the public rankings artifact.');
  }

  const unexpectedStatuses = artifact.ranked_brands.filter(
    (brand) => !statuses.has(brand.publication_status),
  );
  if (unexpectedStatuses.length > 0) {
    throw new Error('Unexpected publication_status found in the public rankings artifact.');
  }

  if (artifact.summary.included_rows !== artifact.ranked_brands.length) {
    throw new Error('Artifact summary.included_rows does not match ranked_brands length.');
  }

  if (artifact.summary.publishable_rows + artifact.summary.limited_rows !== artifact.summary.included_rows) {
    throw new Error('Artifact summary publishable + limited does not match included_rows.');
  }

  if (artifact.snapshot_captured_at !== metadata.snapshot_captured_at) {
    throw new Error('Artifact snapshot_captured_at does not match metadata.');
  }

  return {
    ok: true,
    snapshot_captured_at: artifact.snapshot_captured_at,
    included_rows: artifact.summary.included_rows,
    publishable_rows: artifact.summary.publishable_rows,
    limited_rows: artifact.summary.limited_rows,
    latest_alias: metadata.latest_alias,
    snapshot_filename: metadata.snapshot_filename,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const { artifactPath, metadataPath } = parseArgs(argv);
  const [artifactRaw, metadataRaw] = await Promise.all([
    fs.readFile(path.resolve(repoRoot, artifactPath), 'utf-8'),
    fs.readFile(path.resolve(repoRoot, metadataPath), 'utf-8'),
  ]);

  const result = verifyRankingsArtifact(parseRankingsArtifact(artifactRaw), parseMetadata(metadataRaw));
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === entryPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
