import { describe, expect, it } from 'vitest';
import {
  parseMetadata,
  parseRankingsArtifact,
  verifyRankingsArtifact,
} from './verify-public-rankings-artifact.mjs';

function makeArtifact() {
  return {
    artifact_kind: 'public_rankings',
    artifact_version: 'public-brand-rankings-v1',
    generated_at: '2026-04-24T00:00:00Z',
    snapshot_captured_at: '2026-04-23T22:09:57Z',
    snapshot_source: 'temp/public_scores/public_brand_rankings_2026-04-23.json',
    score_version: 'public-brand-score-v1',
    ui_contract: {},
    publication_policy: {},
    summary: {
      included_rows: 1,
      publishable_rows: 1,
      limited_rows: 0,
      blocked_rows_hidden: 555,
      top_ranked_brand: 'North Sails',
    },
    ranked_brands: [
      {
        brand: 'North Sails',
        publication_status: 'publishable',
      },
    ],
  };
}

describe('verify public rankings artifact script', () => {
  it('accepts a valid public rankings artifact and matching metadata', () => {
    const artifact = parseRankingsArtifact(JSON.stringify(makeArtifact()));
    const metadata = parseMetadata(
      JSON.stringify({
        snapshot_captured_at: '2026-04-23T22:09:57Z',
        snapshot_filename: 'public_brand_rankings.2026-04-23T22-09-57Z.json',
        latest_alias: 'public_brand_rankings.latest.json',
      }),
    );

    expect(verifyRankingsArtifact(artifact, metadata)).toMatchObject({
      ok: true,
      publishable_rows: 1,
      limited_rows: 0,
    });
  });

  it('rejects blocked rows in the public artifact', () => {
    const artifact = makeArtifact();
    artifact.ranked_brands[0].publication_status = 'blocked';
    artifact.summary.publishable_rows = 0;
    artifact.summary.blocked_rows_hidden = 554;

    expect(() =>
      verifyRankingsArtifact(
        parseRankingsArtifact(JSON.stringify(artifact)),
        parseMetadata(
          JSON.stringify({
            snapshot_captured_at: '2026-04-23T22:09:57Z',
            snapshot_filename: 'public_brand_rankings.2026-04-23T22-09-57Z.json',
            latest_alias: 'public_brand_rankings.latest.json',
          }),
        ),
      ),
    ).toThrow('Blocked rows are present');
  });

  it('rejects mismatched artifact metadata lineage', () => {
    expect(() =>
      verifyRankingsArtifact(
        parseRankingsArtifact(JSON.stringify(makeArtifact())),
        parseMetadata(
          JSON.stringify({
            snapshot_captured_at: '2026-04-24T00:00:00Z',
            snapshot_filename: 'public_brand_rankings.2026-04-24T00-00-00Z.json',
            latest_alias: 'public_brand_rankings.latest.json',
          }),
        ),
      ),
    ).toThrow('Artifact snapshot_captured_at does not match metadata.');
  });
});
