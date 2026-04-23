import { Link } from 'react-router-dom';
import { usePublicRankings } from '../context/PublicRankingsContext';

export function LandingPage() {
  const { artifact, error, loading } = usePublicRankings();

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Portuguese-first supply chain intelligence</p>
          <h2>Ranking publico para descobrir marcas com maior potencial por geografia</h2>
          <p className="hero-lead">
            O Brand Radar transforma verdade revista em scores transparentes, contexto de
            confianca e listas acionaveis para owners e decisores da cadeia de fornecimento.
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/ranking">
              Ver ranking publico
            </Link>
            <Link className="button button--secondary" to="/registo">
              Receber a newsletter
            </Link>
          </div>
        </div>

        <div className="hero-summary">
          <div className="summary-card">
            <span>Snapshot aceite</span>
            <strong>{artifact?.snapshot_captured_at || 'A carregar...'}</strong>
          </div>
          <div className="summary-card">
            <span>Linhas publicas</span>
            <strong>{artifact?.summary.included_rows ?? '...'}</strong>
          </div>
          <div className="summary-card">
            <span>Publishable</span>
            <strong>{artifact?.summary.publishable_rows ?? '...'}</strong>
          </div>
          <div className="summary-card">
            <span>Limited</span>
            <strong>{artifact?.summary.limited_rows ?? '...'}</strong>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <article className="content-card">
          <h3>O que o ranking mostra</h3>
          <p>
            Cada marca recebe um <strong>brand score</strong> para oportunidade e um{' '}
            <strong>confidence score</strong> para qualidade da base de prova. O ranking e
            publico, mas nao esconde limitacoes.
          </p>
        </article>
        <article className="content-card">
          <h3>Porque existe o estado limited</h3>
          <p>
            O site mostra linhas publicas com prova suficiente para descoberta, mas sinaliza o
            que ainda esta em consolidacao. A newsletter continua mais conservadora.
          </p>
        </article>
        <article className="content-card">
          <h3>Como entra a newsletter</h3>
          <p>
            O ranking gera descoberta em aberto. A newsletter transforma a descoberta em
            distribuicao recorrente, sempre com metodologia publica e explicita.
          </p>
        </article>
      </section>

      <section className="content-band">
        <div>
          <h3>Base atual</h3>
          {loading ? <p>A carregar a distribuicao publica...</p> : null}
          {error ? <p className="inline-error">{error}</p> : null}
          {!loading && !error && artifact ? (
            <ul className="issue-list">
              <li>{artifact.summary.publishable_rows} linhas publicaveis por defeito.</li>
              <li>{artifact.summary.limited_rows} linhas publicas com badge de limitacao.</li>
              <li>{artifact.summary.blocked_rows_hidden} linhas bloqueadas ficam fora do site.</li>
              <li>Top ranked atual: {artifact.summary.top_ranked_brand || 'N/D'}.</li>
            </ul>
          ) : null}
        </div>
        <div className="content-band__aside">
          <p className="eyebrow">Proximos passos do produto</p>
          <p>
            Ranking publico agora. Signup e arquivo nesta tranche. Newsletter publica so depois
            do corte editorial mais estrito.
          </p>
        </div>
      </section>
    </div>
  );
}
