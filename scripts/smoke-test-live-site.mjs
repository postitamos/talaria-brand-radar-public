import { fileURLToPath } from 'node:url';
import path from 'node:path';

const entryPath = fileURLToPath(import.meta.url);

export function parseArgs(argv) {
  const baseUrlIndex = argv.indexOf('--base-url');
  const signupUrlIndex = argv.indexOf('--signup-url');
  const signupEmailIndex = argv.indexOf('--signup-email');
  const retriesIndex = argv.indexOf('--retries');
  const retryDelayIndex = argv.indexOf('--retry-delay-ms');

  return {
    baseUrl:
      baseUrlIndex >= 0
        ? argv[baseUrlIndex + 1]
        : 'https://postitamos.github.io/talaria-brand-radar-public/',
    checkSignup: argv.includes('--check-signup'),
    signupUrl:
      signupUrlIndex >= 0 ? argv[signupUrlIndex + 1] : process.env.VITE_PUBLIC_SIGNUP_SUPABASE_URL,
    signupFunctionName:
      process.env.VITE_PUBLIC_SIGNUP_FUNCTION_NAME?.trim() || 'newsletter-signup',
    signupEmail:
      signupEmailIndex >= 0
        ? argv[signupEmailIndex + 1]
        : `smoke+${Date.now()}@example.invalid`,
    retries: retriesIndex >= 0 ? Number.parseInt(argv[retriesIndex + 1], 10) : 1,
    retryDelayMs: retryDelayIndex >= 0 ? Number.parseInt(argv[retryDelayIndex + 1], 10) : 0,
  };
}

export function normalizeBaseUrl(value) {
  return value.endsWith('/') ? value : `${value}/`;
}

export function buildExpectedUrls(baseUrl) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  return {
    routes: [
      normalizedBaseUrl,
      `${normalizedBaseUrl}?/ranking`,
      `${normalizedBaseUrl}?/metodologia`,
      `${normalizedBaseUrl}?/privacidade`,
      `${normalizedBaseUrl}?/registo`,
      `${normalizedBaseUrl}?/arquivo`,
    ],
    data: [
      `${normalizedBaseUrl}data/public_brand_rankings.latest.json`,
      `${normalizedBaseUrl}data/newsletter_candidate_brands.latest.json`,
      `${normalizedBaseUrl}data/site_release.latest.json`,
    ],
  };
}

export async function wait(delayMs) {
  if (delayMs <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function fetchOk(url, expectedContentType = null, { retries = 1, retryDelayMs = 0 } = {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Fetch failed for ${url} (${response.status}).`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (expectedContentType && !contentType.includes(expectedContentType)) {
        throw new Error(`Unexpected content type for ${url}: ${contentType}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await wait(retryDelayMs);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function runSmokeTest({
  baseUrl,
  checkSignup = false,
  signupUrl,
  signupFunctionName = 'newsletter-signup',
  signupEmail,
  retries = 1,
  retryDelayMs = 0,
}) {
  const urls = buildExpectedUrls(baseUrl);

  for (const url of urls.routes) {
    await fetchOk(url, 'text/html', { retries, retryDelayMs });
  }

  const [rankingsResponse, newsletterResponse, releaseResponse] = await Promise.all(
    urls.data.map((url) => fetchOk(url, 'application/json', { retries, retryDelayMs })),
  );

  const [rankingsArtifact, newsletterArtifact, releaseArtifact] = await Promise.all([
    rankingsResponse.json(),
    newsletterResponse.json(),
    releaseResponse.json(),
  ]);

  if (rankingsArtifact.artifact_kind !== 'public_rankings') {
    throw new Error('Live rankings artifact has the wrong artifact_kind.');
  }

  if (newsletterArtifact.artifact_kind !== 'newsletter_candidates') {
    throw new Error('Live newsletter artifact has the wrong artifact_kind.');
  }

  if (releaseArtifact.artifact_kind !== 'site_release') {
    throw new Error('Live release manifest has the wrong artifact_kind.');
  }

  if (!Array.isArray(rankingsArtifact.ranked_brands)) {
    throw new Error('Live rankings artifact is missing ranked_brands.');
  }

  if (rankingsArtifact.ranked_brands.some((row) => row.publication_status === 'blocked')) {
    throw new Error('Live rankings artifact still exposes blocked rows.');
  }

  if (!releaseArtifact.verification_baseline?.blocked_rows_publicly_hidden) {
    throw new Error('Live release manifest no longer asserts blocked rows are hidden.');
  }

  if (checkSignup) {
    if (!signupUrl) {
      throw new Error('signupUrl is required when --check-signup is used.');
    }

    const response = await fetch(
      `${signupUrl.replace(/\/$/, '')}/functions/v1/${signupFunctionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupEmail,
          name: 'Smoke Test',
          company: 'Talaria',
          role: 'QA',
          country: 'Portugal',
          marketingConsent: true,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Signup smoke test failed (${response.status}).`);
    }
  }

  return {
    ok: true,
    base_url: normalizeBaseUrl(baseUrl),
    checked_routes: urls.routes.length,
    checked_data_artifacts: urls.data.length,
    signup_checked: checkSignup,
    snapshot_captured_at: releaseArtifact.snapshot_captured_at,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const result = await runSmokeTest(args);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === entryPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
