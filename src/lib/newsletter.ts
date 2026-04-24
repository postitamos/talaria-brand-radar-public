import type { NewsletterCandidateArtifact, RankedBrand } from './public-artifacts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function isRankedBrand(value: unknown): value is RankedBrand {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const brand = value as Partial<RankedBrand>;
  return (
    typeof brand.brand === 'string' &&
    typeof brand.brand_id === 'number' &&
    typeof brand.brand_score === 'number' &&
    typeof brand.confidence_score === 'number' &&
    typeof brand.publication_status === 'string' &&
    Array.isArray(brand.limitations) &&
    Array.isArray(brand.blockers)
  );
}

export async function loadNewsletterCandidateArtifact(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<NewsletterCandidateArtifact> {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Nao foi possivel carregar o artefacto editorial (${response.status}).`);
  }

  const payload = await response.json();
  return parseNewsletterCandidateArtifact(payload);
}

export function parseNewsletterCandidateArtifact(payload: unknown): NewsletterCandidateArtifact {
  assert(typeof payload === 'object' && payload !== null, 'Artifact must be an object.');

  const artifact = payload as Partial<NewsletterCandidateArtifact>;
  assert(artifact.artifact_kind === 'newsletter_candidates', 'Unexpected artifact_kind.');
  assert(typeof artifact.artifact_version === 'string', 'artifact_version is required.');
  assert(typeof artifact.snapshot_captured_at === 'string', 'snapshot_captured_at is required.');
  assert(typeof artifact.snapshot_source === 'string', 'snapshot_source is required.');
  assert(typeof artifact.score_version === 'string', 'score_version is required.');
  assert(typeof artifact.language_default === 'string', 'language_default is required.');
  assert(
    typeof artifact.selection_policy === 'object' && artifact.selection_policy !== null,
    'selection_policy is required.',
  );
  assert(typeof artifact.summary === 'object' && artifact.summary !== null, 'summary is required.');
  assert(Array.isArray(artifact.candidate_brands), 'candidate_brands must be an array.');
  assert(
    artifact.candidate_brands.every(isRankedBrand),
    'candidate_brands includes one or more invalid rows.',
  );

  return artifact as NewsletterCandidateArtifact;
}
