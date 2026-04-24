import { describe, expect, it } from 'vitest';
import { parseHistory, verifyHistory } from './verify-site-release-history.mjs';

describe('verify site release history script', () => {
  it('accepts an append-only release history ledger', () => {
    const result = verifyHistory(
      parseHistory(
        JSON.stringify({
          artifact_kind: 'site_release_history',
          artifact_version: 'site-release-history-v1',
          generated_at: '2026-04-24T21:00:00Z',
          releases: [
            {
              release_id: '2026-04-23T22:09:57Z::abc123',
              deployed_at: '2026-04-24T21:00:00Z',
              public_repo_commit_sha: 'abc123',
              source_snapshot_captured_at: '2026-04-23T22:09:57Z',
              score_version: 'public-brand-score-v1',
            },
          ],
        }),
      ),
    );

    expect(result.ok).toBe(true);
    expect(result.total_recorded_releases).toBe(1);
  });

  it('rejects duplicate release ids', () => {
    expect(() =>
      verifyHistory(
        parseHistory(
          JSON.stringify({
            artifact_kind: 'site_release_history',
            artifact_version: 'site-release-history-v1',
            generated_at: '2026-04-24T21:00:00Z',
            releases: [
              {
                release_id: 'dup',
                deployed_at: '2026-04-24T21:00:00Z',
                public_repo_commit_sha: 'abc123',
                source_snapshot_captured_at: '2026-04-23T22:09:57Z',
                score_version: 'public-brand-score-v1',
              },
              {
                release_id: 'dup',
                deployed_at: '2026-04-24T21:05:00Z',
                public_repo_commit_sha: 'def456',
                source_snapshot_captured_at: '2026-04-23T22:09:57Z',
                score_version: 'public-brand-score-v1',
              },
            ],
          }),
        ),
      ),
    ).toThrow('Duplicate release_id');
  });
});
