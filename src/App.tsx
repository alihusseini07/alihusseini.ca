import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, type CSSProperties } from 'react';
import PortfolioPage from './components/PortfolioPage';
import AboutMe from './pages/AboutMe';
import Projects from './pages/Projects';
import Experiences from './pages/Experiences';
import { THEMES } from './tokens';

export type ThemeId = keyof typeof THEMES;

export default function App() {
  const [themeId, setThemeId] = useState<ThemeId>('light');

  const switcher: CSSProperties = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    display: 'flex',
    gap: 6,
    zIndex: 100,
  };

  const btnStyle = (active: boolean): CSSProperties => ({
    font: "400 10px 'Silkscreen', monospace",
    textTransform: 'uppercase',
    padding: '6px 10px',
    cursor: 'pointer',
    border: active ? '2px solid currentColor' : '2px solid #888',
    background: active ? '#211f1b' : 'transparent',
    color: active ? '#fff' : '#888',
  });

  const ThemeSwitcher = () => (
    <div style={switcher}>
      {Object.values(THEMES).map((t) => (
        <button
          key={t.id}
          onClick={() => setThemeId(t.id as ThemeId)}
          style={btnStyle(themeId === t.id)}
        >
          {t.name}
        </button>
      ))}
    </div>
  );

  return (
    <BrowserRouter>
      <ThemeSwitcher />
      <Routes>
        <Route path="/" element={<PortfolioPage themeId={themeId} />} />
        <Route path="/about" element={<AboutMe themeId={themeId} />} />
        <Route path="/projects" element={<Projects themeId={themeId} />} />
        <Route path="/experiences" element={<Experiences themeId={themeId} />} />
      </Routes>
    </BrowserRouter>
  );
}
