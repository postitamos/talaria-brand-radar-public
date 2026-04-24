import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMetadata as parseNewsletterMetadata,
  parseNewsletterArtifact,
  verifyNewsletterArtifact,
} from './verify-newsletter-candidates-artifact.mjs';
import {
  parseMetadata as parseRankingsMetadata,
  parseRankingsArtifact,
  verifyRankingsArtifact,
} from './verify-public-rankings-artifact.mjs';

const repoRoot = process.cwd();
const entryPath = fileURLToPath(import.meta.url);

const defaults = {
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
  outputDir: path.join(repoRoot, 'public', 'data'),
};

export function parseArgs(argv) {
  const rankingsArtifactIndex = argv.indexOf('--rankings-artifact');
  const rankingsMetadataIndex = argv.indexOf('--rankings-metadata');
  const newsletterArtifactIndex = argv.indexOf('--newsletter-artifact');
  const newsletterMetadataIndex = argv.indexOf('--newsletter-metadata');
  const outputDirIndex = argv.indexOf('--output-dir');

  return {
    rankingsArtifactPath:
      rankingsArtifactIndex >= 0 ? argv[rankingsArtifactIndex + 1] : defaults.rankingsArtifactPath,
    rankingsMetadataPath:
      rankingsMetadataIndex >= 0 ? argv[rankingsMetadataIndex + 1] : defaults.rankingsMetadataPath,
    newsletterArtifactPath:
      newsletterArtifactIndex >= 0
        ? argv[newsletterArtifactIndex + 1]
        : defaults.newsletterArtifactPath,
    newsletterMetadataPath:
      newsletterMetadataIndex >= 0
        ? argv[newsletterMetadataIndex + 1]
        : defaults.newsletterMetadataPath,
    outputDir: outputDirIndex >= 0 ? argv[outputDirIndex + 1] : defaults.outputDir,
  };
}

export function snapshotSlug(snapshotCapturedAt) {
  return snapshotCapturedAt.replace(/:/g, '-');
}

export function buildReleaseManifest({
  rankingsArtifact,
  rankingsMetadata,
  newsletterArtifact,
  newsletterMetadata,
  generatedAt = new Date().toISOString(),
}) {
  if (rankingsArtifact.snapshot_captured_at !== newsletterArtifact.snapshot_captured_at) {
    throw new Error('Rankings and newsletter artifacts must share the same snapshot_captured_at.');
  }

  if (rankingsArtifact.score_version !== newsletterArtifact.score_version) {
    throw new Error('Rankings and newsletter artifacts must share the same score_version.');
  }

  return {
    artifact_kind: 'site_release',
    artifact_version: 'site-release-v1',
    generated_at: generatedAt,
    snapshot_captured_at: rankingsArtifact.snapshot_captured_at,
    score_version: rankingsArtifact.score_version,
    site_contract: {
      language_default: rankingsArtifact.ui_contract.language_default,
      hosting_mode: 'github-pages-free',
      data_mode: 'snapshot_backed_read_only',
      signup_boundary_mode: 'shared_project_fallback',
      routes: ['/', '/ranking', '/metodologia', '/privacidade', '/registo', '/arquivo'],
    },
    source_artifacts: {
      rankings: {
        artifact_kind: rankingsArtifact.artifact_kind,
        artifact_version: rankingsArtifact.artifact_version,
        latest_alias: rankingsMetadata.latest_alias,
        snapshot_filename: rankingsMetadata.snapshot_filename,
        source_path: rankingsMetadata.source_path,
        summary: rankingsArtifact.summary,
      },
      newsletter: {
        artifact_kind: newsletterArtifact.artifact_kind,
        artifact_version: newsletterArtifact.artifact_version,
        latest_alias: newsletterMetadata.latest_alias,
        snapshot_filename: newsletterMetadata.snapshot_filename,
        source_path: newsletterMetadata.source_path,
        summary: newsletterArtifact.summary,
      },
    },
    publication_policy: {
      public_rankings: {
        allowed_statuses: rankingsArtifact.publication_policy.included_statuses,
        hidden_statuses: rankingsArtifact.publication_policy.excluded_statuses,
        limited_rows_badged: rankingsArtifact.publication_policy.limited_rows_badged,
      },
      newsletter: {
        allowed_statuses: newsletterArtifact.selection_policy.default_included_statuses,
        limited_override_required:
          newsletterArtifact.selection_policy.requires_editorial_review_for_limited,
        send_mode: newsletterArtifact.selection_policy.send_mode,
      },
      raw_evidence_public: false,
      person_level_data_public: false,
    },
    release_summary: {
      visible_ranked_rows: rankingsArtifact.summary.included_rows,
      publishable_rows: rankingsArtifact.summary.publishable_rows,
      limited_rows: rankingsArtifact.summary.limited_rows,
      blocked_rows_hidden: rankingsArtifact.summary.blocked_rows_hidden,
      newsletter_default_candidates: newsletterArtifact.summary.total_candidates,
      top_ranked_brand: rankingsArtifact.summary.top_ranked_brand,
      top_newsletter_candidate: newsletterArtifact.summary.top_candidate_brand,
    },
    verification_baseline: {
      expected_live_base_url: 'https://postitamos.github.io/talaria-brand-radar-public/',
      expected_query_entry_routes: [
        '/?/ranking',
        '/?/metodologia',
        '/?/privacidade',
        '/?/registo',
        '/?/arquivo',
      ],
      expected_data_routes: [
        '/data/public_brand_rankings.latest.json',
        '/data/newsletter_candidate_brands.latest.json',
        '/data/site_release.latest.json',
      ],
      blocked_rows_publicly_hidden: true,
      limited_rows_publicly_badged: true,
    },
  };
}

export async function buildAndWriteReleaseManifest({
  rankingsArtifactPath,
  rankingsMetadataPath,
  newsletterArtifactPath,
  newsletterMetadataPath,
  outputDir,
  root = repoRoot,
  generatedAt,
}) {
  const resolvedRankingsArtifactPath = path.resolve(root, rankingsArtifactPath);
  const resolvedRankingsMetadataPath = path.resolve(root, rankingsMetadataPath);
  const resolvedNewsletterArtifactPath = path.resolve(root, newsletterArtifactPath);
  const resolvedNewsletterMetadataPath = path.resolve(root, newsletterMetadataPath);
  const resolvedOutputDir = path.resolve(root, outputDir);

  const [rankingsArtifactRaw, rankingsMetadataRaw, newsletterArtifactRaw, newsletterMetadataRaw] =
    await Promise.all([
      fs.readFile(resolvedRankingsArtifactPath, 'utf-8'),
      fs.readFile(resolvedRankingsMetadataPath, 'utf-8'),
      fs.readFile(resolvedNewsletterArtifactPath, 'utf-8'),
      fs.readFile(resolvedNewsletterMetadataPath, 'utf-8'),
    ]);

  const rankingsArtifact = parseRankingsArtifact(rankingsArtifactRaw);
  const rankingsMetadata = parseRankingsMetadata(rankingsMetadataRaw);
  const newsletterArtifact = parseNewsletterArtifact(newsletterArtifactRaw);
  const newsletterMetadata = parseNewsletterMetadata(newsletterMetadataRaw);

  verifyRankingsArtifact(rankingsArtifact, rankingsMetadata);
  verifyNewsletterArtifact(newsletterArtifact, newsletterMetadata);

  const manifest = buildReleaseManifest({
    rankingsArtifact,
    rankingsMetadata,
    newsletterArtifact,
    newsletterMetadata,
    generatedAt,
  });

  await fs.mkdir(resolvedOutputDir, { recursive: true });

  const slug = snapshotSlug(manifest.snapshot_captured_at);
  const snapshotFilename = `site_release.${slug}.json`;
  const latestFilename = 'site_release.latest.json';
  const metadataFilename = 'site_release.metadata.json';

  const metadata = {
    artifact_kind: manifest.artifact_kind,
    artifact_version: manifest.artifact_version,
    snapshot_captured_at: manifest.snapshot_captured_at,
    score_version: manifest.score_version,
    source_rankings_path: rankingsMetadata.source_path,
    source_newsletter_path: newsletterMetadata.source_path,
    latest_alias: latestFilename,
    snapshot_filename: snapshotFilename,
  };

  await Promise.all([
    fs.writeFile(path.join(resolvedOutputDir, snapshotFilename), JSON.stringify(manifest, null, 2)),
    fs.writeFile(path.join(resolvedOutputDir, latestFilename), JSON.stringify(manifest, null, 2)),
    fs.writeFile(path.join(resolvedOutputDir, metadataFilename), JSON.stringify(metadata, null, 2)),
  ]);

  return {
    ok: true,
    snapshot_captured_at: manifest.snapshot_captured_at,
    snapshot_filename: snapshotFilename,
    latest_alias: latestFilename,
    publishable_rows: manifest.release_summary.publishable_rows,
    limited_rows: manifest.release_summary.limited_rows,
    newsletter_default_candidates: manifest.release_summary.newsletter_default_candidates,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const result = await buildAndWriteReleaseManifest(args);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === entryPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
