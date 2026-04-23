import { brandScoreWeights, confidenceScoreWeights, publicationStatusCopy } from '../content/pt';

export function MethodologyPage() {
  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-copy">
          <p className="eyebrow">Metodologia publica</p>
          <h2>Como o Brand Radar calcula score, confianca e estado publico</h2>
          <p className="hero-lead">
            O score mede oportunidade. A confianca mede a robustez da base de prova. O estado
            publico decide como a marca pode ou nao aparecer no produto.
          </p>
        </div>
      </section>

      <section className="two-column">
        <article className="content-card">
          <h3>O que o brand score mede</h3>
          <p>
            O brand score existe para ordenar marcas por potencial relativo numa geografia. Nao e
            um selo de qualidade absoluta nem um substituto de decisao comercial.
          </p>
          <ul className="weights-list">
            {brandScoreWeights.map(([label, weight]) => (
              <li key={label}>
                <span>{label}</span>
                <strong>{weight}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="content-card">
          <h3>O que a confidence mede</h3>
          <p>
            A confidence mostra se a base de prova esta suficientemente fechada para expor a marca
            em publico ou para a usar em contexto editorial mais estrito.
          </p>
          <ul className="weights-list">
            {confidenceScoreWeights.map(([label, weight]) => (
              <li key={label}>
                <span>{label}</span>
                <strong>{weight}</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="content-grid">
        {Object.entries(publicationStatusCopy).map(([status, copy]) => (
          <article key={status} className="content-card">
            <h3>{copy.label}</h3>
            <p>{copy.description}</p>
          </article>
        ))}
      </section>

      <section className="content-band">
        <div>
          <h3>Porque as blocked ficam escondidas</h3>
          <p>
            Linhas bloqueadas continuam na verdade interna e nos artefactos completos para QA, mas
            nao entram na descoberta publica porque a base de prova ainda nao suporta esse uso.
          </p>
        </div>
        <div className="content-band__aside">
          <p className="eyebrow">Workflow open source</p>
          <p>
            O produto publico nasce de snapshots aceites, scorer transparente, artefactos
            downstream e uma separacao clara entre verdade interna e consumo publico.
          </p>
        </div>
      </section>
    </div>
  );
}
