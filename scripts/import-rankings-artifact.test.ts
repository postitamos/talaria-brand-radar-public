import { describe, expect, it } from 'vitest';
import { parseArtifact, snapshotSlug } from './import-rankings-artifact.mjs';

describe('import rankings artifact script', () => {
  it('normalizes a snapshot timestamp into a file-safe slug', () => {
    expect(snapshotSlug('2026-04-23T22:09:57Z')).toBe('2026-04-23T22-09-57Z');
  });

  it('accepts a valid public rankings artifact payload', () => {
    const artifact = parseArtifact(
      JSON.stringify({
        artifact_kind: 'public_rankings',
        artifact_version: 'public-brand-rankings-v1',
        snapshot_captured_at: '2026-04-23T22:09:57Z',
        score_version: 'public-brand-score-v1',
        ranked_brands: [],
      }),
    );

    expect(artifact.artifact_kind).toBe('public_rankings');
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

  it('rejects artifacts missing required provenance fields', () => {
    expect(() =>
      parseArtifact(
        JSON.stringify({
          artifact_kind: 'public_rankings',
          ranked_brands: [],
        }),
      ),
    ).toThrow('Artifact is missing snapshot_captured_at or score_version.');
  });
});
