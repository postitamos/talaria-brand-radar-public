import { NavLink, Outlet } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Visao geral' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/metodologia', label: 'Metodologia' },
  { to: '/privacidade', label: 'Privacidade' },
  { to: '/registo', label: 'Registo' },
  { to: '/arquivo', label: 'Arquivo' },
];

export function SiteShell() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <span className="brand-kicker">Brand Radar</span>
          <div>
            <h1>Radar de marcas para decisores da cadeia de fornecimento</h1>
            <p>
              Ranking publico, metodologia transparente e newsletter gratuita para quem quer
              perceber onde estao os melhores alvos por geografia.
            </p>
          </div>
        </div>

        <nav className="site-nav" aria-label="Navegacao principal">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
              end={item.to === '/'}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-block">
          <strong>Brand Radar Public</strong>
          <p>
            Produto publico em leitura, alimentado por artefactos scored e por um workflow
            open-source de verdade revista.
          </p>
        </div>
        <div className="footer-block footer-block--links">
          <nav className="footer-nav" aria-label="Navegacao de rodape">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  isActive ? 'footer-link footer-link--active' : 'footer-link'
                }
                end={item.to === '/'}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <p className="footer-note">
            O ranking e publico. O registo serve para receber a newsletter, nao para
            desbloquear o acesso. A evidencia bruta e os dados pessoais ficam privados por
            defeito.
          </p>
        </div>
      </footer>
    </div>
  );
}
