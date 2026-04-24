import { describe, expect, it } from 'vitest';
import {
  parseMetadata,
  parseNewsletterArtifact,
  verifyNewsletterArtifact,
} from './verify-newsletter-candidates-artifact.mjs';

function makeArtifact() {
  return {
    artifact_kind: 'newsletter_candidates',
    artifact_version: 'newsletter-candidates-v1',
    generated_at: '2026-04-23T22:16:02Z',
    snapshot_captured_at: '2026-04-23T22:09:57Z',
    snapshot_source: 'supabase-service-role-rest-export',
    score_version: 'public-brand-score-v1',
    language_default: 'pt-PT',
    selection_policy: {
      default_included_statuses: ['publishable'],
      limited_override_brand_ids: [],
      limited_override_brand_names: [],
      limited_override_source: null,
      requires_editorial_review_for_limited: true,
      send_mode: 'manual_first',
    },
    summary: {
      publishable_candidates: 1,
      limited_overrides_applied: 0,
      total_candidates: 1,
      top_candidate_brand: 'North Sails',
    },
    candidate_brands: [
      {
        brand: 'North Sails',
        publication_status: 'publishable',
      },
    ],
  };
}

describe('verify newsletter candidate artifact script', () => {
  it('accepts a valid newsletter artifact and matching metadata', () => {
    const artifact = parseNewsletterArtifact(JSON.stringify(makeArtifact()));
    const metadata = parseMetadata(
      JSON.stringify({
        snapshot_captured_at: '2026-04-23T22:09:57Z',
        snapshot_filename: 'newsletter_candidate_brands.2026-04-23T22-09-57Z.json',
        latest_alias: 'newsletter_candidate_brands.latest.json',
      }),
    );

    expect(verifyNewsletterArtifact(artifact, metadata)).toMatchObject({
      ok: true,
      total_candidates: 1,
    });
  });

  it('rejects blocked rows in the newsletter artifact', () => {
    const artifact = makeArtifact();
    artifact.candidate_brands[0].publication_status = 'blocked';

    expect(() =>
      verifyNewsletterArtifact(
        parseNewsletterArtifact(JSON.stringify(artifact)),
        parseMetadata(
          JSON.stringify({
            snapshot_captured_at: '2026-04-23T22:09:57Z',
            snapshot_filename: 'newsletter_candidate_brands.2026-04-23T22-09-57Z.json',
            latest_alias: 'newsletter_candidate_brands.latest.json',
          }),
        ),
      ),
    ).toThrow('Blocked rows are present');
  });

  it('rejects limited rows without an explicit override list', () => {
    const artifact = makeArtifact();
    artifact.candidate_brands[0].publication_status = 'limited';

    expect(() =>
      verifyNewsletterArtifact(
        parseNewsletterArtifact(JSON.stringify(artifact)),
        parseMetadata(
          JSON.stringify({
            snapshot_captured_at: '2026-04-23T22:09:57Z',
            snapshot_filename: 'newsletter_candidate_brands.2026-04-23T22-09-57Z.json',
            latest_alias: 'newsletter_candidate_brands.latest.json',
          }),
        ),
      ),
    ).toThrow('Limited newsletter candidates require an explicit override list.');
  });
});
