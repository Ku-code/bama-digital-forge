import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle GitHub Pages 404.html redirect
if (window.location.search.includes('?/')) {
  const path = window.location.search.replace('?/', '').replace(/~and~/g, '&');
  window.history.replaceState(null, '', path);
}

// After a deploy, chunk filenames change; a session that started on the old
// build fails to lazy-load pages ("Failed to fetch dynamically imported
// module"). Reload once to pick up the new build instead of showing an error.
window.addEventListener('vite:preloadError', (event) => {
  if (!sessionStorage.getItem('chunk-reload')) {
    sessionStorage.setItem('chunk-reload', '1');
    event.preventDefault();
    window.location.reload();
  }
});

// Enable scroll-entrance animations only when JS runs and motion is allowed.
// Runs before React renders, so animated elements never flash. Without this
// class (crawlers, no-JS, reduced motion) all content is simply visible.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js-anim');
}

// A load that made it this far is healthy — re-arm the one-shot reload guard.
window.addEventListener('load', () => sessionStorage.removeItem('chunk-reload'));

// Error handling for root rendering
try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error('Root element not found. Make sure there is a <div id="root"></div> in your HTML.');
  }

  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  
  // Show error message to user
  document.body.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; font-family: system-ui, sans-serif; padding: 20px;">
      <div style="text-align: center; max-width: 600px;">
        <h1 style="font-size: 24px; margin-bottom: 16px; color: #ef4444;">Application Error</h1>
        <p style="margin-bottom: 16px; color: #9ca3af;">Failed to load the application. Please check the browser console for details.</p>
        <p style="margin-bottom: 24px; color: #6b7280; font-size: 14px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button 
          onclick="window.location.reload()" 
          style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;"
        >
          Reload Page
        </button>
      </div>
    </div>
  `;
}
