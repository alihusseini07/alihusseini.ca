import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import PageTransition from './components/PageTransition';
import PortfolioPage from './components/PortfolioPage';
import AboutMe from './pages/AboutMe';
import Portfolio from './pages/Portfolio';
import Skills from './pages/Skills';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <PageTransition>
          <Routes>
            <Route path="/" element={<PortfolioPage />} />
            <Route path="/about" element={<AboutMe />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/skills" element={<Skills />} />
          </Routes>
        </PageTransition>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
