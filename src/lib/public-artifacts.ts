export type PublicationStatus = 'publishable' | 'limited' | 'blocked';

export type ScoreBreakdownEntry = {
  points: number;
  max: number;
  value: unknown;
  label: string;
  details?: Record<string, unknown>;
};

export type RankedBrand = {
  public_rank: number;
  brand_id: number;
  brand: string;
  country: string | null;
  city: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  portugal_relationship_class: string | null;
  brand_score: number;
  confidence_score: number;
  publication_status: PublicationStatus;
  score_version: string;
  snapshot_captured_at: string;
  last_research_date: string | null;
  last_verified_at: string | null;
  score_breakdown: Record<string, ScoreBreakdownEntry>;
  confidence_breakdown: Record<string, ScoreBreakdownEntry>;
  profile_completeness: Record<string, string>;
  blockers: string[];
  limitations: string[];
  evidence: Record<string, unknown>;
};

export type PublicRankingsArtifact = {
  artifact_kind: 'public_rankings';
  artifact_version: string;
  generated_at: string;
  snapshot_captured_at: string;
  snapshot_source: string;
  score_version: string;
  ui_contract: {
    language_default: string;
    show_blocked_rows: boolean;
    show_limited_rows: boolean;
    show_full_breakdowns: boolean;
    filters_supported: string[];
    sort_order: string[];
  };
  publication_policy: {
    included_statuses: PublicationStatus[];
    excluded_statuses: PublicationStatus[];
    blocked_rows_hidden: boolean;
    limited_rows_badged: boolean;
  };
  summary: {
    included_rows: number;
    publishable_rows: number;
    limited_rows: number;
    blocked_rows_hidden: number;
    top_ranked_brand: string | null;
  };
  ranked_brands: RankedBrand[];
};

export type NewsletterCandidateArtifact = {
  artifact_kind: 'newsletter_candidates';
  artifact_version: string;
  generated_at: string;
  snapshot_captured_at: string;
  snapshot_source: string;
  score_version: string;
  language_default: string;
  selection_policy: {
    default_included_statuses: PublicationStatus[];
    limited_override_brand_ids: number[];
    limited_override_brand_names: string[];
    limited_override_source: string | null;
    requires_editorial_review_for_limited: boolean;
    send_mode: string;
  };
  summary: {
    publishable_candidates: number;
    limited_overrides_applied: number;
    total_candidates: number;
    top_candidate_brand: string | null;
  };
  candidate_brands: RankedBrand[];
};

export type RankingsFilters = {
  country: string;
  city: string;
  portugalRelationshipClass: string;
};
