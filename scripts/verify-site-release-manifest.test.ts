import { describe, expect, it } from 'vitest';
import { parseReleaseManifest, verifyReleaseManifest } from './verify-site-release-manifest.mjs';

function makeManifest() {
  return {
    artifact_kind: 'site_release',
    artifact_version: 'site-release-v1',
    generated_at: '2026-04-24T00:00:00Z',
    snapshot_captured_at: '2026-04-23T22:09:57Z',
    score_version: 'public-brand-score-v1',
    site_contract: {
      routes: ['/', '/ranking', '/metodologia', '/privacidade', '/registo', '/arquivo'],
      hosting_mode: 'github-pages-free',
      signup_boundary_mode: 'shared_project_fallback',
    },
    source_artifacts: {},
    publication_policy: {
      public_rankings: {
        allowed_statuses: ['publishable', 'limited'],
      },
      newsletter: {
        allowed_statuses: ['publishable'],
      },
    },
    release_summary: {
      visible_ranked_rows: 552,
      publishable_rows: 1,
      limited_rows: 551,
      newsletter_default_candidates: 1,
    },
    verification_baseline: {
      blocked_rows_publicly_hidden: true,
    },
  };
}

describe('verify site release manifest script', () => {
  it('accepts a valid aligned release manifest', () => {
    const result = verifyReleaseManifest({
      manifest: parseReleaseManifest(JSON.stringify(makeManifest())),
      metadata: {
        snapshot_captured_at: '2026-04-23T22:09:57Z',
        snapshot_filename: 'site_release.2026-04-23T22-09-57Z.json',
        latest_alias: 'site_release.latest.json',
        source_rankings_path: 'rankings.json',
        source_newsletter_path: 'newsletter.json',
      },
      rankingsArtifact: {
        snapshot_captured_at: '2026-04-23T22:09:57Z',
        score_version: 'public-brand-score-v1',
        summary: {
          included_rows: 552,
          publishable_rows: 1,
          limited_rows: 551,
        },
        publication_policy: {
          included_statuses: ['publishable', 'limited'],
        },
      },
      rankingsMetadata: {
        source_path: 'rankings.json',
      },
      newsletterArtifact: {
        snapshot_captured_at: '2026-04-23T22:09:57Z',
        score_version: 'public-brand-score-v1',
        summary: {
          total_candidates: 1,
        },
        selection_policy: {
          default_included_statuses: ['publishable'],
        },
      },
      newsletterMetadata: {
        source_path: 'newsletter.json',
      },
    });

    expect(result.ok).toBe(true);
    expect(result.visible_ranked_rows).toBe(552);
  });

  it('rejects snapshot lineage mismatches', () => {
    expect(() =>
      verifyReleaseManifest({
        manifest: parseReleaseManifest(JSON.stringify(makeManifest())),
        metadata: {
          snapshot_captured_at: '2026-04-24T00:00:00Z',
          snapshot_filename: 'site_release.2026-04-24T00-00-00Z.json',
          latest_alias: 'site_release.latest.json',
          source_rankings_path: 'rankings.json',
          source_newsletter_path: 'newsletter.json',
        },
        rankingsArtifact: {
          snapshot_captured_at: '2026-04-23T22:09:57Z',
          score_version: 'public-brand-score-v1',
          summary: {
            included_rows: 552,
            publishable_rows: 1,
            limited_rows: 551,
          },
          publication_policy: {
            included_statuses: ['publishable', 'limited'],
          },
        },
        rankingsMetadata: {
          source_path: 'rankings.json',
        },
        newsletterArtifact: {
          snapshot_captured_at: '2026-04-23T22:09:57Z',
          score_version: 'public-brand-score-v1',
          summary: {
            total_candidates: 1,
          },
          selection_policy: {
            default_included_statuses: ['publishable'],
          },
        },
        newsletterMetadata: {
          source_path: 'newsletter.json',
        },
      }),
    ).toThrow('snapshot_captured_at does not match metadata');
  });
});
