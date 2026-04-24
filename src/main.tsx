import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { PublicRankingsProvider } from './context/PublicRankingsContext';
import './index.css';

const basename = import.meta.env.BASE_URL || '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <PublicRankingsProvider>
        <App />
      </PublicRankingsProvider>
    </BrowserRouter>
  </StrictMode>,
);
