import { describe, expect, it } from 'vitest';
import {
  appendReleaseHistory,
  buildHistoryEntry,
  createEmptyHistory,
} from './record-site-release-history.mjs';

function makeManifest() {
  return {
    snapshot_captured_at: '2026-04-23T22:09:57Z',
    score_version: 'public-brand-score-v1',
    release_summary: {
      visible_ranked_rows: 552,
      publishable_rows: 1,
      limited_rows: 551,
      newsletter_default_candidates: 1,
    },
    verification_baseline: {
      expected_live_base_url: 'https://postitamos.github.io/talaria-brand-radar-public/',
    },
  };
}

describe('record site release history script', () => {
  it('appends a new successful deployed release to the history ledger', () => {
    const entry = buildHistoryEntry({
      manifest: makeManifest(),
      commitSha: 'abc123',
      deployedAt: '2026-04-24T21:00:00Z',
    });

    const result = appendReleaseHistory({
      history: createEmptyHistory(),
      entry,
      generatedAt: '2026-04-24T21:00:00Z',
    });

    expect(result.changed).toBe(true);
    expect(result.history.releases).toHaveLength(1);
    expect(result.history.releases[0].public_repo_commit_sha).toBe('abc123');
  });

  it('does not append the same release twice', () => {
    const entry = buildHistoryEntry({
      manifest: makeManifest(),
      commitSha: 'abc123',
      deployedAt: '2026-04-24T21:00:00Z',
    });

    const initial = appendReleaseHistory({
      history: createEmptyHistory(),
      entry,
      generatedAt: '2026-04-24T21:00:00Z',
    }).history;

    const second = appendReleaseHistory({
      history: initial,
      entry,
      generatedAt: '2026-04-24T21:05:00Z',
    });

    expect(second.changed).toBe(false);
    expect(second.history.releases).toHaveLength(1);
  });
});
