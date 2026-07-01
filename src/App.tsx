import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortfolioPage from './components/PortfolioPage';
import AboutMe from './pages/AboutMe';
import Projects from './pages/Projects';
import Experiences from './pages/Experiences';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/about" element={<AboutMe />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/experiences" element={<Experiences />} />
      </Routes>
    </BrowserRouter>
  );
}
