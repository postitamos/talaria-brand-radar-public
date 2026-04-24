export function PrivacyPage() {
  const supportEmail = import.meta.env.VITE_PUBLIC_SUPPORT_EMAIL?.trim();

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-copy">
          <p className="eyebrow">Privacidade e dados</p>
          <h2>O ranking e publico. A evidencia bruta e os dados pessoais nao.</h2>
          <p className="hero-lead">
            O Brand Radar Public mostra apenas rankings derivados ao nivel de marca e empresa.
            O motor de verdade, a evidencia interna e os dados de registo ficam fora da
            superficie publica.
          </p>
        </div>
      </section>

      <section className="content-grid">
        <article className="content-card">
          <h3>O que fica publico</h3>
          <ul className="issue-list">
            <li>Nome da marca, pais, cidade e classe de relacao com Portugal.</li>
            <li>Brand score, confidence score e breakdowns.</li>
            <li>Estados publicos `publishable` e `limited`.</li>
            <li>Metodologia, pesos e explicacao do workflow open-source.</li>
          </ul>
        </article>

        <article className="content-card">
          <h3>O que fica privado</h3>
          <ul className="issue-list">
            <li>Arquivo bruto de evidencia e notas internas de QA.</li>
            <li>Contradicoes e worklists internas ainda em resolucao.</li>
            <li>Dados de registo da newsletter.</li>
            <li>Dados de contacto pessoais e prospecting pessoa-a-pessoa.</li>
          </ul>
        </article>

        <article className="content-card">
          <h3>O que nunca publicamos em v1</h3>
          <ul className="issue-list">
            <li>Listas de contactos pessoais.</li>
            <li>Emails ou telefones de individuos.</li>
            <li>Copias longas de texto ou capturas integrais de fontes externas.</li>
            <li>Linhas `blocked` no ranking publico.</li>
          </ul>
        </article>
      </section>

      <section className="content-band">
        <div>
          <h3>Como funciona o registo</h3>
          <p>
            O registo serve apenas para receber a newsletter gratuita. O ranking continua
            publico, mesmo sem registo.
          </p>
          <ul className="issue-list">
            <li>Guardamos apenas os campos Lean B2B definidos no formulario.</li>
            <li>O signup usa uma funcao publica dedicada com dedupe por email normalizado.</li>
            <li>Submissoes repetidas devolvem sucesso generico sem criar linhas duplicadas.</li>
          </ul>
        </div>

        <div className="content-band__aside">
          <p className="eyebrow">Regra de lancamento</p>
          <p>
            O site so deve ser considerado live quando a superficie publica respeitar a
            politica de publicacao e nao expuser evidencia bruta, notas internas ou dados
            pessoais.
          </p>
          <p className="inline-note">
            {supportEmail
              ? `Contacto operacional de suporte e privacidade: ${supportEmail}.`
              : 'Contacto operacional de suporte e privacidade ainda por configurar antes do go-live.'}
          </p>
        </div>
      </section>
    </div>
  );
}
