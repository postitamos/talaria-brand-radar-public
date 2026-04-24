import { fileURLToPath } from 'node:url';
import path from 'node:path';

const entryPath = fileURLToPath(import.meta.url);

export function parseArgs(argv) {
  const baseUrlIndex = argv.indexOf('--base-url');
  const signupUrlIndex = argv.indexOf('--signup-url');
  const signupEmailIndex = argv.indexOf('--signup-email');

  return {
    baseUrl:
      baseUrlIndex >= 0
        ? argv[baseUrlIndex + 1]
        : 'https://postitamos.github.io/talaria-brand-radar-public/',
    checkSignup: argv.includes('--check-signup'),
    signupUrl:
      signupUrlIndex >= 0 ? argv[signupUrlIndex + 1] : process.env.VITE_PUBLIC_SIGNUP_SUPABASE_URL,
    signupFunctionName: process.env.VITE_PUBLIC_SIGNUP_FUNCTION_NAME || 'newsletter-signup',
    signupEmail:
      signupEmailIndex >= 0
        ? argv[signupEmailIndex + 1]
        : `smoke+${Date.now()}@example.invalid`,
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

async function fetchOk(url, expectedContentType = null) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Fetch failed for ${url} (${response.status}).`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (expectedContentType && !contentType.includes(expectedContentType)) {
    throw new Error(`Unexpected content type for ${url}: ${contentType}`);
  }

  return response;
}

export async function runSmokeTest({
  baseUrl,
  checkSignup = false,
  signupUrl,
  signupFunctionName = 'newsletter-signup',
  signupEmail,
}) {
  const urls = buildExpectedUrls(baseUrl);

  for (const url of urls.routes) {
    await fetchOk(url, 'text/html');
  }

  const [rankingsResponse, newsletterResponse, releaseResponse] = await Promise.all(
    urls.data.map((url) => fetchOk(url, 'application/json')),
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
