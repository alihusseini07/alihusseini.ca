import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// the SPA's first paint happens before React renders any content, so the
// browser's automatic scroll restoration lands after that paint and the page
// flashes its top on every reload — disable it, save the position ourselves,
// and restore pre-paint in PageTransition instead
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('pagehide', () => {
  sessionStorage.setItem(
    'reload-scroll',
    JSON.stringify({ path: window.location.pathname, y: window.scrollY }),
  );
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
