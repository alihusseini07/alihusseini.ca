import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import PageTransition from './components/PageTransition';
import LandingPage from './components/LandingPage';
import AboutMe from './pages/AboutMe';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import { ThemeProvider } from './lib/theme';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <PageTransition>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutMe />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/skills" element={<Skills />} />
            </Routes>
          </PageTransition>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
