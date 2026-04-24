import { describe, expect, it, vi } from 'vitest';
import {
  createNewsletterFunctionUrl,
  normalizeEmail,
  submitNewsletterSignup,
  validateSignupPayload,
} from './signup';

describe('signup helpers', () => {
  it('normalizes email and validates lean B2B fields', () => {
    const result = validateSignupPayload({
      email: '  Owner@Example.com ',
      name: ' Sofia ',
      company: ' Talaria ',
      role: ' Founder ',
      country: ' Portugal ',
      marketingConsent: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.normalizedPayload.email).toBe('owner@example.com');
    expect(result.normalizedPayload.name).toBe('Sofia');
  });

  it('builds the edge function url from the configured Supabase project url', () => {
    expect(
      createNewsletterFunctionUrl({
        projectUrl: 'https://demo.supabase.co/',
        anonKey: 'anon',
        functionName: 'newsletter-signup',
      }),
    ).toBe('https://demo.supabase.co/functions/v1/newsletter-signup');
  });

  it('submits a normalized payload with anon headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });

    await submitNewsletterSignup(
      {
        email: '  Owner@Example.com ',
        name: ' Sofia ',
        company: ' Talaria ',
        role: ' Founder ',
        country: ' Portugal ',
        marketingConsent: true,
      },
      {
        projectUrl: 'https://demo.supabase.co',
        anonKey: 'anon-key',
        functionName: 'newsletter-signup',
      },
      fetchMock as unknown as typeof fetch,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://demo.supabase.co/functions/v1/newsletter-signup');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: 'anon-key',
        Authorization: 'Bearer anon-key',
      },
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      email: normalizeEmail('Owner@Example.com'),
    });
  });
});
