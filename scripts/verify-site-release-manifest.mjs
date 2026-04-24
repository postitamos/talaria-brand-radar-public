import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMetadata as parseNewsletterMetadata, parseNewsletterArtifact } from './verify-newsletter-candidates-artifact.mjs';
import { parseMetadata as parseRankingsMetadata, parseRankingsArtifact } from './verify-public-rankings-artifact.mjs';

const repoRoot = process.cwd();
const entryPath = fileURLToPath(import.meta.url);

const defaults = {
  manifestPath: path.join(repoRoot, 'public', 'data', 'site_release.latest.json'),
  metadataPath: path.join(repoRoot, 'public', 'data', 'site_release.metadata.json'),
  rankingsArtifactPath: path.join(repoRoot, 'public', 'data', 'public_brand_rankings.latest.json'),
  rankingsMetadataPath: path.join(repoRoot, 'public', 'data', 'public_brand_rankings.metadata.json'),
  newsletterArtifactPath: path.join(
    repoRoot,
    'public',
    'data',
    'newsletter_candidate_brands.latest.json',
  ),
  newsletterMetadataPath: path.join(
    repoRoot,
    'public',
    'data',
    'newsletter_candidate_brands.metadata.json',
  ),
};

export function parseArgs(argv) {
  const keys = [
    ['--manifest', 'manifestPath'],
    ['--metadata', 'metadataPath'],
    ['--rankings-artifact', 'rankingsArtifactPath'],
    ['--rankings-metadata', 'rankingsMetadataPath'],
    ['--newsletter-artifact', 'newsletterArtifactPath'],
    ['--newsletter-metadata', 'newsletterMetadataPath'],
  ];

  const parsed = { ...defaults };
  for (const [flag, key] of keys) {
    const index = argv.indexOf(flag);
    if (index >= 0) {
      parsed[key] = argv[index + 1];
    }
  }

  return parsed;
}

export function parseReleaseManifest(raw) {
  const manifest = JSON.parse(raw);

  if (manifest.artifact_kind !== 'site_release') {
    throw new Error(`Unexpected artifact_kind: ${manifest.artifact_kind}`);
  }

  if (!manifest.snapshot_captured_at || !manifest.score_version) {
    throw new Error('Release manifest is missing snapshot_captured_at or score_version.');
  }

  if (!manifest.site_contract || !manifest.source_artifacts || !manifest.release_summary) {
    throw new Error('Release manifest is missing required sections.');
  }

  return manifest;
}

export function parseReleaseMetadata(raw) {
  const metadata = JSON.parse(raw);

  if (!metadata.snapshot_captured_at || !metadata.snapshot_filename || !metadata.latest_alias) {
    throw new Error('Release metadata is missing required fields.');
  }

  return metadata;
}

export function verifyReleaseManifest({
  manifest,
  metadata,
  rankingsArtifact,
  rankingsMetadata,
  newsletterArtifact,
  newsletterMetadata,
}) {
  if (manifest.snapshot_captured_at !== metadata.snapshot_captured_at) {
    throw new Error('Release manifest snapshot_captured_at does not match metadata.');
  }

  if (manifest.snapshot_captured_at !== rankingsArtifact.snapshot_captured_at) {
    throw new Error('Release manifest snapshot_captured_at does not match rankings artifact.');
  }

  if (manifest.snapshot_captured_at !== newsletterArtifact.snapshot_captured_at) {
    throw new Error('Release manifest snapshot_captured_at does not match newsletter artifact.');
  }

  if (manifest.score_version !== rankingsArtifact.score_version) {
    throw new Error('Release manifest score_version does not match rankings artifact.');
  }

  if (manifest.score_version !== newsletterArtifact.score_version) {
    throw new Error('Release manifest score_version does not match newsletter artifact.');
  }

  if (metadata.source_rankings_path !== rankingsMetadata.source_path) {
    throw new Error('Release metadata source_rankings_path does not match rankings metadata.');
  }

  if (metadata.source_newsletter_path !== newsletterMetadata.source_path) {
    throw new Error('Release metadata source_newsletter_path does not match newsletter metadata.');
  }

  if (manifest.release_summary.visible_ranked_rows !== rankingsArtifact.summary.included_rows) {
    throw new Error('Release summary visible_ranked_rows does not match rankings artifact.');
  }

  if (manifest.release_summary.publishable_rows !== rankingsArtifact.summary.publishable_rows) {
    throw new Error('Release summary publishable_rows does not match rankings artifact.');
  }

  if (manifest.release_summary.limited_rows !== rankingsArtifact.summary.limited_rows) {
    throw new Error('Release summary limited_rows does not match rankings artifact.');
  }

  if (
    manifest.release_summary.newsletter_default_candidates !==
    newsletterArtifact.summary.total_candidates
  ) {
    throw new Error(
      'Release summary newsletter_default_candidates does not match newsletter artifact.',
    );
  }

  if (
    JSON.stringify(manifest.publication_policy.public_rankings.allowed_statuses) !==
    JSON.stringify(rankingsArtifact.publication_policy.included_statuses)
  ) {
    throw new Error('Release manifest public rankings statuses do not match rankings artifact.');
  }

  if (
    JSON.stringify(manifest.publication_policy.newsletter.allowed_statuses) !==
    JSON.stringify(newsletterArtifact.selection_policy.default_included_statuses)
  ) {
    throw new Error('Release manifest newsletter statuses do not match newsletter artifact.');
  }

  const expectedRoutes = ['/', '/ranking', '/metodologia', '/privacidade', '/registo', '/arquivo'];
  if (JSON.stringify(manifest.site_contract.routes) !== JSON.stringify(expectedRoutes)) {
    throw new Error('Release manifest site routes do not match the locked public route set.');
  }

  if (manifest.site_contract.hosting_mode !== 'github-pages-free') {
    throw new Error('Release manifest hosting_mode must stay github-pages-free.');
  }

  if (manifest.site_contract.signup_boundary_mode !== 'shared_project_fallback') {
    throw new Error('Release manifest signup_boundary_mode must stay shared_project_fallback.');
  }

  if (!manifest.verification_baseline.blocked_rows_publicly_hidden) {
    throw new Error('Release manifest must keep blocked rows hidden publicly.');
  }

  return {
    ok: true,
    snapshot_captured_at: manifest.snapshot_captured_at,
    score_version: manifest.score_version,
    visible_ranked_rows: manifest.release_summary.visible_ranked_rows,
    newsletter_default_candidates: manifest.release_summary.newsletter_default_candidates,
    latest_alias: metadata.latest_alias,
    snapshot_filename: metadata.snapshot_filename,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  const [
    manifestRaw,
    metadataRaw,
    rankingsArtifactRaw,
    rankingsMetadataRaw,
    newsletterArtifactRaw,
    newsletterMetadataRaw,
  ] = await Promise.all([
    fs.readFile(path.resolve(repoRoot, args.manifestPath), 'utf-8'),
    fs.readFile(path.resolve(repoRoot, args.metadataPath), 'utf-8'),
    fs.readFile(path.resolve(repoRoot, args.rankingsArtifactPath), 'utf-8'),
    fs.readFile(path.resolve(repoRoot, args.rankingsMetadataPath), 'utf-8'),
    fs.readFile(path.resolve(repoRoot, args.newsletterArtifactPath), 'utf-8'),
    fs.readFile(path.resolve(repoRoot, args.newsletterMetadataPath), 'utf-8'),
  ]);

  const result = verifyReleaseManifest({
    manifest: parseReleaseManifest(manifestRaw),
    metadata: parseReleaseMetadata(metadataRaw),
    rankingsArtifact: parseRankingsArtifact(rankingsArtifactRaw),
    rankingsMetadata: parseRankingsMetadata(rankingsMetadataRaw),
    newsletterArtifact: parseNewsletterArtifact(newsletterArtifactRaw),
    newsletterMetadata: parseNewsletterMetadata(newsletterMetadataRaw),
  });

  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === entryPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
