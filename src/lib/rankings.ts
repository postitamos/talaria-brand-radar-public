import type {
  PublicRankingsArtifact,
  RankedBrand,
  RankingsFilters,
  ScoreBreakdownEntry,
} from './public-artifacts';

const SORT_FACTOR_DESC = -1;
const ALL_FILTER_VALUE = '';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function isScoreBreakdownEntry(value: unknown): value is ScoreBreakdownEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Partial<ScoreBreakdownEntry>;
  return (
    typeof entry.points === 'number' &&
    typeof entry.max === 'number' &&
    typeof entry.label === 'string'
  );
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
    typeof brand.score_version === 'string' &&
    typeof brand.snapshot_captured_at === 'string' &&
    typeof brand.score_breakdown === 'object' &&
    brand.score_breakdown !== null &&
    Object.values(brand.score_breakdown).every(isScoreBreakdownEntry) &&
    typeof brand.confidence_breakdown === 'object' &&
    brand.confidence_breakdown !== null &&
    Object.values(brand.confidence_breakdown).every(isScoreBreakdownEntry) &&
    Array.isArray(brand.limitations) &&
    Array.isArray(brand.blockers)
  );
}

export async function loadPublicRankingsArtifact(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PublicRankingsArtifact> {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Nao foi possivel carregar o ranking publico (${response.status}).`);
  }

  const payload = await response.json();
  return parsePublicRankingsArtifact(payload);
}

export function parsePublicRankingsArtifact(payload: unknown): PublicRankingsArtifact {
  assert(typeof payload === 'object' && payload !== null, 'Artifact must be an object.');

  const artifact = payload as Partial<PublicRankingsArtifact>;
  assert(artifact.artifact_kind === 'public_rankings', 'Unexpected artifact_kind.');
  assert(typeof artifact.artifact_version === 'string', 'artifact_version is required.');
  assert(typeof artifact.snapshot_captured_at === 'string', 'snapshot_captured_at is required.');
  assert(typeof artifact.snapshot_source === 'string', 'snapshot_source is required.');
  assert(typeof artifact.score_version === 'string', 'score_version is required.');
  assert(Array.isArray(artifact.ranked_brands), 'ranked_brands must be an array.');
  assert(
    artifact.ranked_brands.every(isRankedBrand),
    'ranked_brands includes one or more invalid rows.',
  );
  assert(typeof artifact.summary === 'object' && artifact.summary !== null, 'summary is required.');
  assert(
    typeof artifact.ui_contract === 'object' && artifact.ui_contract !== null,
    'ui_contract is required.',
  );
  assert(
    typeof artifact.publication_policy === 'object' && artifact.publication_policy !== null,
    'publication_policy is required.',
  );

  return artifact as PublicRankingsArtifact;
}

export function sortRankedBrands(brands: RankedBrand[]): RankedBrand[] {
  return [...brands].sort((left, right) => {
    if (left.brand_score !== right.brand_score) {
      return (left.brand_score - right.brand_score) * SORT_FACTOR_DESC;
    }
    if (left.confidence_score !== right.confidence_score) {
      return (left.confidence_score - right.confidence_score) * SORT_FACTOR_DESC;
    }
    if ((left.last_research_date ?? '') !== (right.last_research_date ?? '')) {
      return (left.last_research_date ?? '') < (right.last_research_date ?? '') ? 1 : -1;
    }
    return left.brand.localeCompare(right.brand, 'pt-PT');
  });
}

export function filterRankedBrands(
  brands: RankedBrand[],
  filters: RankingsFilters,
): RankedBrand[] {
  return brands.filter((brand) => {
    if (filters.country !== ALL_FILTER_VALUE && brand.country !== filters.country) {
      return false;
    }

    if (filters.city !== ALL_FILTER_VALUE && brand.city !== filters.city) {
      return false;
    }

    if (
      filters.portugalRelationshipClass !== ALL_FILTER_VALUE &&
      brand.portugal_relationship_class !== filters.portugalRelationshipClass
    ) {
      return false;
    }

    return true;
  });
}

export function extractFilterOptions(brands: RankedBrand[]) {
  const countries = new Set<string>();
  const cities = new Set<string>();
  const relationships = new Set<string>();

  for (const brand of brands) {
    if (brand.country) {
      countries.add(brand.country);
    }
    if (brand.city) {
      cities.add(brand.city);
    }
    if (brand.portugal_relationship_class) {
      relationships.add(brand.portugal_relationship_class);
    }
  }

  return {
    countries: [...countries].sort((left, right) => left.localeCompare(right, 'pt-PT')),
    cities: [...cities].sort((left, right) => left.localeCompare(right, 'pt-PT')),
    portugalRelationshipClasses: [...relationships].sort((left, right) =>
      left.localeCompare(right, 'pt-PT'),
    ),
  };
}
