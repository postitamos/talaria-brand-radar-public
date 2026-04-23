import { describe, expect, it } from 'vitest';
import { filterRankedBrands, parsePublicRankingsArtifact, sortRankedBrands } from './rankings';
import type { PublicRankingsArtifact, RankedBrand } from './public-artifacts';

function makeBrand(overrides: Partial<RankedBrand>): RankedBrand {
  return {
    public_rank: 1,
    brand_id: 1,
    brand: 'Alpha',
    country: 'Portugal',
    city: 'Porto',
    instagram_handle: 'alpha',
    tiktok_handle: 'alpha',
    portugal_relationship_class: 'production',
    brand_score: 80,
    confidence_score: 70,
    publication_status: 'limited',
    score_version: 'v1',
    snapshot_captured_at: '2026-04-23T22:09:57Z',
    last_research_date: '2026-04-20',
    last_verified_at: '2026-04-20T00:00:00Z',
    score_breakdown: {
      component: { points: 10, max: 10, value: 'yes', label: 'ok' },
    },
    confidence_breakdown: {
      component: { points: 10, max: 10, value: 'yes', label: 'ok' },
    },
    profile_completeness: { instagram_handle: 'verified', tiktok_handle: 'verified' },
    blockers: [],
    limitations: [],
    evidence: {},
    ...overrides,
  };
}

describe('parsePublicRankingsArtifact', () => {
  it('accepts a valid public rankings artifact', () => {
    const artifact: PublicRankingsArtifact = {
      artifact_kind: 'public_rankings',
      artifact_version: 'public-brand-rankings-v1',
      generated_at: '2026-04-23T22:15:00Z',
      snapshot_captured_at: '2026-04-23T22:09:57Z',
      snapshot_source: 'docs/checkpoint-evidence/remediation_snapshot.json',
      score_version: 'public-brand-score-v1',
      ui_contract: {
        language_default: 'pt-PT',
        show_blocked_rows: false,
        show_limited_rows: true,
        show_full_breakdowns: true,
        filters_supported: ['country', 'city'],
        sort_order: ['brand_score desc'],
      },
      publication_policy: {
        included_statuses: ['publishable', 'limited'],
        excluded_statuses: ['blocked'],
        blocked_rows_hidden: true,
        limited_rows_badged: true,
      },
      summary: {
        included_rows: 1,
        publishable_rows: 0,
        limited_rows: 1,
        blocked_rows_hidden: 0,
        top_ranked_brand: 'Alpha',
      },
      ranked_brands: [makeBrand({})],
    };

    expect(parsePublicRankingsArtifact(artifact).summary.included_rows).toBe(1);
  });

  it('rejects a wrong artifact kind', () => {
    expect(() =>
      parsePublicRankingsArtifact({
        artifact_kind: 'wrong-kind',
        ranked_brands: [],
      }),
    ).toThrow('Unexpected artifact_kind.');
  });
});

describe('sortRankedBrands', () => {
  it('sorts by score, then confidence, then recency, then brand name', () => {
    const brands = [
      makeBrand({ brand: 'Zulu', brand_score: 60, confidence_score: 99 }),
      makeBrand({ brand: 'Beta', brand_score: 75, confidence_score: 50, last_research_date: '2026-04-19' }),
      makeBrand({ brand: 'Alpha', brand_score: 75, confidence_score: 50, last_research_date: '2026-04-22' }),
      makeBrand({ brand: 'Delta', brand_score: 75, confidence_score: 65 }),
    ];

    expect(sortRankedBrands(brands).map((brand) => brand.brand)).toEqual([
      'Delta',
      'Alpha',
      'Beta',
      'Zulu',
    ]);
  });
});

describe('filterRankedBrands', () => {
  it('filters by country, city, and portugal relationship class', () => {
    const brands = [
      makeBrand({ brand: 'Alpha', country: 'Portugal', city: 'Porto', portugal_relationship_class: 'production' }),
      makeBrand({ brand: 'Beta', country: 'Portugal', city: 'Braga', portugal_relationship_class: 'commercial' }),
      makeBrand({ brand: 'Gamma', country: 'Spain', city: 'Madrid', portugal_relationship_class: 'production' }),
    ];

    const filtered = filterRankedBrands(brands, {
      country: 'Portugal',
      city: 'Porto',
      portugalRelationshipClass: 'production',
    });

    expect(filtered.map((brand) => brand.brand)).toEqual(['Alpha']);
  });
});
