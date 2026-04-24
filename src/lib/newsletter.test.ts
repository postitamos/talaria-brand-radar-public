import { describe, expect, it } from 'vitest';
import { parseNewsletterCandidateArtifact } from './newsletter';
import type { NewsletterCandidateArtifact, RankedBrand } from './public-artifacts';

function makeBrand(overrides: Partial<RankedBrand>): RankedBrand {
  return {
    public_rank: 1,
    brand_id: 1220,
    brand: 'North Sails',
    country: 'Italy',
    city: 'Milan',
    instagram_handle: 'northsails',
    tiktok_handle: 'northsails',
    portugal_relationship_class: 'unknown',
    brand_score: 71,
    confidence_score: 97,
    publication_status: 'publishable',
    score_version: 'public-brand-score-v1',
    snapshot_captured_at: '2026-04-23T22:09:57Z',
    last_research_date: '2026-05-11',
    last_verified_at: '2026-04-22T13:16:40.871667+00:00',
    score_breakdown: {},
    confidence_breakdown: {},
    profile_completeness: {},
    blockers: [],
    limitations: [],
    evidence: {},
    ...overrides,
  };
}

describe('parseNewsletterCandidateArtifact', () => {
  it('accepts a valid newsletter candidate artifact', () => {
    const artifact: NewsletterCandidateArtifact = {
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
      candidate_brands: [makeBrand({})],
    };

    expect(parseNewsletterCandidateArtifact(artifact).summary.total_candidates).toBe(1);
  });

  it('rejects the wrong artifact kind', () => {
    expect(() =>
      parseNewsletterCandidateArtifact({
        artifact_kind: 'public_rankings',
        candidate_brands: [],
      }),
    ).toThrow('Unexpected artifact_kind.');
  });
});
