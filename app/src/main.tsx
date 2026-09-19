import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import { App } from './App';
import { BASE_URL } from './lib/routing/base';

/**
 * Restore a deep link that GitHub Pages served the 404 fallback for.
 *
 * Pages has no rewrite rules, so `/cx/alexden/wardrobe` hits 404.html, which
 * stashes the intended path and bounces to the app root. Replacing the history
 * entry here — before React mounts — means the router boots straight onto the
 * right route and the address bar keeps the clean URL.
 */
function restoreDeepLink() {
  try {
    const target = sessionStorage.getItem('zat:redirect');
    if (!target) return;
    sessionStorage.removeItem('zat:redirect');
    if (target === '/' || !target.startsWith('/')) return;
    history.replaceState(null, '', `${BASE_URL.replace(/\/$/, '')}${target}`);
  } catch {
    /* storage blocked — the visitor simply lands on the home route */
  }
}

restoreDeepLink();

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
