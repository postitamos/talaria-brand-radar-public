import {
  describeLimitation,
  formatFallbackLabel,
  portugalRelationshipCopy,
  socialCompletenessCopy,
} from '../content/pt';
import type { RankedBrand, ScoreBreakdownEntry } from '../lib/public-artifacts';
import { StatusBadge } from './StatusBadge';

function BreakdownSection({
  title,
  breakdown,
}: {
  title: string;
  breakdown: Record<string, ScoreBreakdownEntry>;
}) {
  return (
    <section className="drawer-section">
      <h3>{title}</h3>
      <ul className="breakdown-list">
        {Object.entries(breakdown).map(([key, entry]) => (
          <li key={key} className="breakdown-item">
            <div className="breakdown-item__header">
              <strong>{formatFallbackLabel(key)}</strong>
              <span>
                {entry.points}/{entry.max}
              </span>
            </div>
            <div className="breakdown-bar">
              <span style={{ width: `${Math.round((entry.points / entry.max) * 100)}%` }} />
            </div>
            <p>{entry.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BrandDetailDrawer({
  brand,
  onClose,
}: {
  brand: RankedBrand | null;
  onClose: () => void;
}) {
  if (!brand) {
    return null;
  }

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        aria-label={`Detalhe da marca ${brand.brand}`}
        className="drawer-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="drawer-close" onClick={onClose} type="button">
          Fechar
        </button>

        <div className="drawer-hero">
          <div>
            <p className="eyebrow">Ficha publica</p>
            <h2>{brand.brand}</h2>
            <p className="drawer-location">
              {brand.city || 'Cidade em falta'}, {brand.country || 'Pais em falta'}
            </p>
          </div>
          <StatusBadge status={brand.publication_status} />
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span>Brand score</span>
            <strong>{brand.brand_score}</strong>
          </div>
          <div className="metric-card">
            <span>Confidence score</span>
            <strong>{brand.confidence_score}</strong>
          </div>
          <div className="metric-card">
            <span>Portugal</span>
            <strong>
              {brand.portugal_relationship_class
                ? portugalRelationshipCopy[brand.portugal_relationship_class] ||
                  brand.portugal_relationship_class
                : 'Em revisao'}
            </strong>
          </div>
        </div>

        <section className="drawer-section">
          <h3>Completude social</h3>
          <div className="chip-row">
            <span className="chip">
              Instagram:{' '}
              {socialCompletenessCopy[brand.profile_completeness.instagram_handle] ||
                brand.profile_completeness.instagram_handle}
            </span>
            <span className="chip">
              TikTok:{' '}
              {socialCompletenessCopy[brand.profile_completeness.tiktok_handle] ||
                brand.profile_completeness.tiktok_handle}
            </span>
          </div>
        </section>

        {brand.limitations.length > 0 ? (
          <section className="drawer-section">
            <h3>Limitacoes visiveis</h3>
            <ul className="issue-list">
              {brand.limitations.map((item) => (
                <li key={item}>{describeLimitation(item)}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <BreakdownSection breakdown={brand.score_breakdown} title="Como o score e composto" />
        <BreakdownSection
          breakdown={brand.confidence_breakdown}
          title="Como a confianca e composta"
        />

        <section className="drawer-section">
          <h3>Proveniencia</h3>
          <ul className="issue-list">
            <li>Versao do score: {brand.score_version}</li>
            <li>Snapshot aceite: {brand.snapshot_captured_at}</li>
            <li>Ultima pesquisa: {brand.last_research_date || 'Nao definida'}</li>
            <li>Ultima verificacao: {brand.last_verified_at || 'Nao definida'}</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
