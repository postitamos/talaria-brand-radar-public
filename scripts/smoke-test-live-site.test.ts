import { describe, expect, it } from 'vitest';
import { buildExpectedUrls, normalizeBaseUrl, parseArgs } from './smoke-test-live-site.mjs';

describe('smoke test live site script', () => {
  it('normalizes a base url with a trailing slash', () => {
    expect(normalizeBaseUrl('https://example.com/site')).toBe('https://example.com/site/');
  });

  it('builds the expected route and data urls from the base url', () => {
    const urls = buildExpectedUrls('https://example.com/site');
    expect(urls.routes).toContain('https://example.com/site/?/ranking');
    expect(urls.data).toContain('https://example.com/site/data/site_release.latest.json');
  });

  it('parses the default smoke-test arguments', () => {
    const args = parseArgs([]);
    expect(args.baseUrl).toContain('github.io/talaria-brand-radar-public');
    expect(args.checkSignup).toBe(false);
    expect(args.signupFunctionName).toBe('newsletter-signup');
  });
});
