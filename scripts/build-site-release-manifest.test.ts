import { describe, expect, it } from 'vitest';
import { buildReleaseManifest, snapshotSlug } from './build-site-release-manifest.mjs';

function makeRankingsArtifact() {
  return {
    artifact_kind: 'public_rankings',
    artifact_version: 'public-brand-rankings-v1',
    snapshot_captured_at: '2026-04-23T22:09:57Z',
    score_version: 'public-brand-score-v1',
    ui_contract: {
      language_default: 'pt-PT',
    },
    publication_policy: {
      included_statuses: ['publishable', 'limited'],
      excluded_statuses: ['blocked'],
      limited_rows_badged: true,
    },
    summary: {
      included_rows: 552,
      publishable_rows: 1,
      limited_rows: 551,
      blocked_rows_hidden: 555,
      top_ranked_brand: 'North Sails',
    },
  };
}

function makeNewsletterArtifact() {
  return {
    artifact_kind: 'newsletter_candidates',
    artifact_version: 'newsletter-candidates-v1',
    snapshot_captured_at: '2026-04-23T22:09:57Z',
    score_version: 'public-brand-score-v1',
    selection_policy: {
      default_included_statuses: ['publishable'],
      requires_editorial_review_for_limited: true,
      send_mode: 'manual_first',
    },
    summary: {
      total_candidates: 1,
      top_candidate_brand: 'North Sails',
    },
  };
}

describe('build site release manifest script', () => {
  it('normalizes a snapshot timestamp into a file-safe slug', () => {
    expect(snapshotSlug('2026-04-23T22:09:57Z')).toBe('2026-04-23T22-09-57Z');
  });

  it('builds a release manifest from aligned public artifacts', () => {
    const manifest = buildReleaseManifest({
      rankingsArtifact: makeRankingsArtifact(),
      rankingsMetadata: {
        latest_alias: 'public_brand_rankings.latest.json',
        snapshot_filename: 'public_brand_rankings.2026-04-23T22-09-57Z.json',
        source_path: '..\\talaria-brand-radar\\temp\\public_scores\\public_brand_rankings_2026-04-23.json',
      },
      newsletterArtifact: makeNewsletterArtifact(),
      newsletterMetadata: {
        latest_alias: 'newsletter_candidate_brands.latest.json',
        snapshot_filename: 'newsletter_candidate_brands.2026-04-23T22-09-57Z.json',
        source_path:
          '..\\talaria-brand-radar\\temp\\public_scores\\newsletter_candidate_brands_2026-04-23.json',
      },
      generatedAt: '2026-04-24T00:00:00Z',
    });

    expect(manifest.artifact_kind).toBe('site_release');
    expect(manifest.site_contract.hosting_mode).toBe('github-pages-free');
    expect(manifest.release_summary.visible_ranked_rows).toBe(552);
    expect(manifest.publication_policy.newsletter.allowed_statuses).toEqual(['publishable']);
  });

  it('rejects artifact sets with different snapshot timestamps', () => {
    expect(() =>
      buildReleaseManifest({
        rankingsArtifact: makeRankingsArtifact(),
        rankingsMetadata: {
          latest_alias: 'public_brand_rankings.latest.json',
          snapshot_filename: 'public_brand_rankings.2026-04-23T22-09-57Z.json',
          source_path: 'rankings.json',
        },
        newsletterArtifact: {
          ...makeNewsletterArtifact(),
          snapshot_captured_at: '2026-04-24T00:00:00Z',
        },
        newsletterMetadata: {
          latest_alias: 'newsletter_candidate_brands.latest.json',
          snapshot_filename: 'newsletter_candidate_brands.2026-04-24T00-00-00Z.json',
          source_path: 'newsletter.json',
        },
      }),
    ).toThrow('same snapshot_captured_at');
  });
});
