import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = process.cwd();
const defaultArtifactPath = path.resolve(
  repoRoot,
  'public',
  'data',
  'newsletter_candidate_brands.latest.json',
);
const defaultMetadataPath = path.resolve(
  repoRoot,
  'public',
  'data',
  'newsletter_candidate_brands.metadata.json',
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

export function parseNewsletterArtifact(raw) {
  const artifact = JSON.parse(raw);

  if (artifact.artifact_kind !== 'newsletter_candidates') {
    throw new Error(`Unexpected artifact_kind: ${artifact.artifact_kind}`);
  }

  if (!artifact.snapshot_captured_at || !artifact.score_version || !Array.isArray(artifact.candidate_brands)) {
    throw new Error('Artifact is missing required newsletter candidate fields.');
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

export function verifyNewsletterArtifact(artifact, metadata) {
  const blockedRows = artifact.candidate_brands.filter((brand) => brand.publication_status === 'blocked');
  if (blockedRows.length > 0) {
    throw new Error('Blocked rows are present in the newsletter candidate artifact.');
  }

  const limitedRows = artifact.candidate_brands.filter((brand) => brand.publication_status === 'limited');
  const hasLimitedOverrideEvidence =
    Array.isArray(artifact.selection_policy?.limited_override_brand_ids) &&
    artifact.selection_policy.limited_override_brand_ids.length > 0;

  if (limitedRows.length > 0 && !hasLimitedOverrideEvidence) {
    throw new Error('Limited newsletter candidates require an explicit override list.');
  }

  if (artifact.summary.total_candidates !== artifact.candidate_brands.length) {
    throw new Error('Artifact summary.total_candidates does not match candidate_brands length.');
  }

  if (artifact.snapshot_captured_at !== metadata.snapshot_captured_at) {
    throw new Error('Artifact snapshot_captured_at does not match metadata.');
  }

  return {
    ok: true,
    snapshot_captured_at: artifact.snapshot_captured_at,
    total_candidates: artifact.summary.total_candidates,
    publishable_candidates: artifact.summary.publishable_candidates,
    limited_overrides_applied: artifact.summary.limited_overrides_applied,
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

  const result = verifyNewsletterArtifact(
    parseNewsletterArtifact(artifactRaw),
    parseMetadata(metadataRaw),
  );
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === entryPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
