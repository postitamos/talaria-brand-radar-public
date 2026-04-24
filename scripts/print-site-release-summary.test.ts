import { describe, expect, it } from 'vitest';
import { buildReleaseSummary } from './print-site-release-summary.mjs';

describe('print site release summary script', () => {
  it('extracts the weekly operator summary fields from the release manifest', () => {
    const summary = buildReleaseSummary({
      snapshot_captured_at: '2026-04-23T22:09:57Z',
      score_version: 'public-brand-score-v1',
      release_summary: {
        visible_ranked_rows: 552,
        publishable_rows: 1,
        limited_rows: 551,
        newsletter_default_candidates: 1,
      },
    });

    expect(summary).toEqual({
      snapshot_captured_at: '2026-04-23T22:09:57Z',
      score_version: 'public-brand-score-v1',
      visible_ranked_rows: 552,
      publishable_rows: 1,
      limited_rows: 551,
      newsletter_default_candidates: 1,
    });
  });
});
