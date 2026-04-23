import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteShell } from './components/SiteShell';
import { ArchivePage } from './pages/ArchivePage';
import { LandingPage } from './pages/LandingPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { RankingPage } from './pages/RankingPage';
import { SignupPage } from './pages/SignupPage';

function App() {
  return (
    <Routes>
      <Route element={<SiteShell />} path="/">
        <Route element={<LandingPage />} index />
        <Route element={<RankingPage />} path="ranking" />
        <Route element={<MethodologyPage />} path="metodologia" />
        <Route element={<SignupPage />} path="registo" />
        <Route element={<ArchivePage />} path="arquivo" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default App;
