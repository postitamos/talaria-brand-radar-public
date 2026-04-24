import { useEffect, useState } from 'react';
import { loadNewsletterCandidateArtifact } from '../lib/newsletter';
import type { NewsletterCandidateArtifact } from '../lib/public-artifacts';

const NEWSLETTER_DATA_URL = '/data/newsletter_candidate_brands.latest.json';

export function ArchivePage() {
  const [artifact, setArtifact] = useState<NewsletterCandidateArtifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void loadNewsletterCandidateArtifact(NEWSLETTER_DATA_URL)
      .then((nextArtifact) => {
        if (!active) {
          return;
        }
        setArtifact(nextArtifact);
        setError(null);
        setLoading(false);
      })
      .catch((nextError: unknown) => {
        if (!active) {
          return;
        }
        setArtifact(null);
        setError(nextError instanceof Error ? nextError.message : 'Falha ao carregar o baseline editorial.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-copy">
          <p className="eyebrow">Arquivo</p>
          <h2>As issues publicas vao aparecer aqui</h2>
          <p className="hero-lead">
            Este placeholder prepara a navegacao do produto sem fingir que a newsletter ja esta em
            producao. Quando as primeiras issues sairem, o arquivo vai ligar ranking, metodologia
            e distribuicao.
          </p>
        </div>
      </section>

      <section className="content-band">
        <div>
          <h3>Estado atual</h3>
          <p>
            O site publico ja pode mostrar ranking, metodologia e registo. O arquivo fica pronto
            para receber as issues depois da validacao editorial da primeira remessa.
          </p>
        </div>
        <div className="content-band__aside">
          <p className="eyebrow">Ainda nao</p>
          <p>Sem issue live, sem automacao de envio e sem backdoor para linhas blocked.</p>
        </div>
      </section>

      <section className="content-grid content-grid--two-up">
        <article className="content-card">
          <p className="eyebrow">Baseline editorial</p>
          <h3>Candidato atual para a primeira issue</h3>
          {loading ? <p>A carregar o artefacto editorial...</p> : null}
          {error ? <p className="inline-error">{error}</p> : null}
          {artifact ? (
            <>
              <p>
                Snapshot: <strong>{artifact.snapshot_captured_at}</strong>
              </p>
              <p>
                Candidatos publishable: <strong>{artifact.summary.publishable_candidates}</strong>
              </p>
              <p>
                Overrides limited aplicados: <strong>{artifact.summary.limited_overrides_applied}</strong>
              </p>
              <p>
                Top candidate atual: <strong>{artifact.summary.top_candidate_brand || 'Sem candidato'}</strong>
              </p>
              <p>
                Modo de envio: <strong>{artifact.selection_policy.send_mode}</strong>
              </p>
            </>
          ) : null}
        </article>

        <article className="content-card">
          <p className="eyebrow">Regras editoriais</p>
          <h3>O que entra e o que fica de fora</h3>
          <ul className="issue-list">
            <li>`publishable` entra por defeito no pipeline editorial.</li>
            <li>`limited` so entra quando o override existe no artefacto importado.</li>
            <li>`blocked` continua invisivel no site e fora da newsletter.</li>
            <li>O arquivo publico continua vazio ate existir uma issue realmente publicada.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
