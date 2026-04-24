import { describe, expect, it } from 'vitest';
import { buildExpectedUrls, normalizeBaseUrl, parseArgs, wait } from './smoke-test-live-site.mjs';

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
    const previousValue = process.env.VITE_PUBLIC_SIGNUP_FUNCTION_NAME;
    delete process.env.VITE_PUBLIC_SIGNUP_FUNCTION_NAME;

    try {
      const args = parseArgs([]);
      expect(args.baseUrl).toContain('github.io/talaria-brand-radar-public');
      expect(args.checkSignup).toBe(false);
      expect(args.signupFunctionName).toBe('newsletter-signup');
      expect(args.retries).toBe(1);
      expect(args.retryDelayMs).toBe(0);
    } finally {
      if (previousValue === undefined) {
        delete process.env.VITE_PUBLIC_SIGNUP_FUNCTION_NAME;
      } else {
        process.env.VITE_PUBLIC_SIGNUP_FUNCTION_NAME = previousValue;
      }
    }
  });

  it('accepts retry configuration from cli args', () => {
    const args = parseArgs(['--retries', '6', '--retry-delay-ms', '5000']);
    expect(args.retries).toBe(6);
    expect(args.retryDelayMs).toBe(5000);
  });

  it('resolves immediately when the retry delay is zero', async () => {
    await expect(wait(0)).resolves.toBeUndefined();
  });
});
