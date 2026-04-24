import { describe, expect, it } from 'vitest';
import { parseArtifact, snapshotSlug } from './import-newsletter-candidates-artifact.mjs';

describe('import newsletter candidates artifact script', () => {
  it('normalizes a snapshot timestamp into a file-safe slug', () => {
    expect(snapshotSlug('2026-04-23T22:09:57Z')).toBe('2026-04-23T22-09-57Z');
  });

  it('accepts a valid newsletter candidate artifact payload', () => {
    const artifact = parseArtifact(
      JSON.stringify({
        artifact_kind: 'newsletter_candidates',
        artifact_version: 'newsletter-candidates-v1',
        snapshot_captured_at: '2026-04-23T22:09:57Z',
        score_version: 'public-brand-score-v1',
        candidate_brands: [],
      }),
    );

    expect(artifact.artifact_kind).toBe('newsletter_candidates');
    expect(artifact.score_version).toBe('public-brand-score-v1');
  });

  it('rejects a malformed artifact kind', () => {
    expect(() =>
      parseArtifact(
        JSON.stringify({
          artifact_kind: 'wrong-kind',
          snapshot_captured_at: '2026-04-23T22:09:57Z',
          score_version: 'public-brand-score-v1',
        }),
      ),
    ).toThrow('Unexpected artifact_kind');
  });
});
