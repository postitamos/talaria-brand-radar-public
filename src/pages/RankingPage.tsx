import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { describeLimitation, portugalRelationshipCopy } from '../content/pt';
import { usePublicRankings } from '../context/PublicRankingsContext';
import { extractFilterOptions, filterRankedBrands, sortRankedBrands } from '../lib/rankings';
import type { RankedBrand } from '../lib/public-artifacts';
import { BrandDetailDrawer } from '../components/BrandDetailDrawer';
import { StatusBadge } from '../components/StatusBadge';

function readFilter(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key) || '';
}

export function RankingPage() {
  const { artifact, error, loading } = usePublicRankings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBrand, setSelectedBrand] = useState<RankedBrand | null>(null);

  const filters = {
    country: readFilter(searchParams, 'country'),
    city: readFilter(searchParams, 'city'),
    portugalRelationshipClass: readFilter(searchParams, 'portugal'),
  };

  const visibleBrands = useMemo(() => {
    if (!artifact) {
      return [];
    }

    return sortRankedBrands(filterRankedBrands(artifact.ranked_brands, filters));
  }, [artifact, filters]);

  const options = useMemo(() => extractFilterOptions(artifact?.ranked_brands ?? []), [artifact]);

  function updateFilter(key: 'country' | 'city' | 'portugal', value: string) {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-copy">
          <p className="eyebrow">Ranking publico</p>
          <h2>Filtra por geografia e entende porque uma marca sobe ou desce</h2>
          <p className="hero-lead">
            O ranking consome apenas o artefacto publico snapshot-backed. Linhas blocked ficam
            fora do site; linhas limited entram com contexto e badge visivel.
          </p>
          <p className="hero-note">
            A superficie publica e company-level: o site nao mostra evidencia bruta, notas de QA
            internas ou dados de contacto pessoais.
          </p>
        </div>
      </section>

      <section className="filter-panel">
        <label>
          <span>Pais</span>
          <select value={filters.country} onChange={(event) => updateFilter('country', event.target.value)}>
            <option value="">Todos</option>
            {options.countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Cidade</span>
          <select value={filters.city} onChange={(event) => updateFilter('city', event.target.value)}>
            <option value="">Todas</option>
            {options.cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Classe Portugal</span>
          <select
            value={filters.portugalRelationshipClass}
            onChange={(event) => updateFilter('portugal', event.target.value)}
          >
            <option value="">Todas</option>
            {options.portugalRelationshipClasses.map((item) => (
              <option key={item} value={item}>
                {portugalRelationshipCopy[item] || item}
              </option>
            ))}
          </select>
        </label>
        <div className="filter-summary">
          <span>Snapshot</span>
          <strong>{artifact?.snapshot_captured_at || 'A carregar...'}</strong>
        </div>
      </section>

      {loading ? <p className="loading-copy">A carregar o ranking...</p> : null}
      {error ? <p className="inline-error">{error}</p> : null}

      {!loading && !error && artifact ? (
        <>
          <p className="results-copy">
            {visibleBrands.length} resultado(s) visiveis. Ordenacao fixa por score, confianca,
            data de pesquisa e marca.
          </p>

          <div className="ranking-list">
            {visibleBrands.map((brand) => (
              <button
                key={brand.brand_id}
                className="ranking-row"
                onClick={() => setSelectedBrand(brand)}
                type="button"
              >
                <div className="ranking-row__identity">
                  <span className="rank-pill">#{brand.public_rank}</span>
                  <div>
                    <strong>{brand.brand}</strong>
                    <p>
                      {brand.city || 'Cidade em falta'}, {brand.country || 'Pais em falta'}
                    </p>
                  </div>
                </div>

                <div className="ranking-row__metrics">
                  <div>
                    <span>Brand</span>
                    <strong>{brand.brand_score}</strong>
                  </div>
                  <div>
                    <span>Confidence</span>
                    <strong>{brand.confidence_score}</strong>
                  </div>
                </div>

                <div className="ranking-row__status">
                  <StatusBadge status={brand.publication_status} />
                  <small>
                    {brand.portugal_relationship_class
                      ? portugalRelationshipCopy[brand.portugal_relationship_class] ||
                        brand.portugal_relationship_class
                      : 'Relacao com Portugal em aberto'}
                  </small>
                </div>

                {brand.limitations.length > 0 ? (
                  <div className="ranking-row__limitations">
                    {brand.limitations.slice(0, 2).map((item) => (
                      <span key={item} className="chip chip--warning">
                        {describeLimitation(item)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <BrandDetailDrawer brand={selectedBrand} onClose={() => setSelectedBrand(null)} />
    </div>
  );
}
