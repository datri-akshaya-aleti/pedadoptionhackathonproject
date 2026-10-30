import { useCallback, useEffect, useState } from 'react';

// Tiny hash router: "#/discover" -> "/discover"
export function useRoute() {
  const read = () => window.location.hash.replace(/^#/, '') || '/';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
export const go = (path) => { window.location.hash = path; };

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('pawshome_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
    catch (e) { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('pawshome_theme', theme); } catch (e) { /* ignore */ }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

// Favorites are stored per user in this browser.
export function useFavorites(userId) {
  const key = `pawshome_favs_${userId}`;
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  });
  const toggle = useCallback((petId) => {
    setIds((cur) => {
      const next = cur.includes(petId) ? cur.filter((x) => x !== petId) : [...cur, petId];
      try { localStorage.setItem(key, JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }, [key]);
  return [ids, toggle];
}

// Simple toast queue
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return [toasts, push];
}
