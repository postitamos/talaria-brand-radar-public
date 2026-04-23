export function ArchivePage() {
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
    </div>
  );
}
