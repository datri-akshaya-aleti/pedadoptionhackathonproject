import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import Auth from './pages/Auth.jsx';
import UserLayout from './layouts/UserLayout.jsx';
import { Toasts } from './components/ui.jsx';
import { API_BASE, authFetch, clearSession, isAdmin, loadSession, saveSession } from './api.js';
import { go, useRoute, useTheme, useToasts } from './hooks.js';

// The admin interface is a separate bundle: normal users never download it.
const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'));

export default function App() {
  const [user, setUser] = useState(loadSession);
  const [pets, setPets] = useState([]);
  const [apps, setApps] = useState([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [petsError, setPetsError] = useState('');
  const [theme, toggleTheme] = useTheme();
  const [toasts, toast] = useToasts();
  const route = useRoute();
  const admin = isAdmin(user);

  const reloadPets = useCallback(() => {
    setPetsError('');
    authFetch(`${API_BASE}/pets`)
      .then(async (r) => {
        const d = await r.json().catch(() => null);
        if (!r.ok || !Array.isArray(d)) throw new Error((d && (d.error || d.message)) || `Server returned ${r.status}`);
        setPets(d);
      })
      .catch((e) => setPetsError(e.message === 'Failed to fetch' ? 'Cannot reach the server. Is the backend running on port 8080?' : e.message))
      .finally(() => setPetsLoading(false));
  }, []);
  const reloadApps = useCallback(() => {
    if (!user) return;
    const url = admin ? `${API_BASE}/applications` : `${API_BASE}/applications?userId=${user.id}`;
    authFetch(url).then((r) => r.json()).then((d) => Array.isArray(d) && setApps(d)).catch(() => {});
  }, [user, admin]);

  useEffect(() => { if (user) { reloadPets(); reloadApps(); } }, [user, reloadPets, reloadApps]);

  // Keep each role inside its own interface.
  useEffect(() => {
    if (!user) return;
    if (admin && !route.startsWith('/admin')) go('/admin');
    if (!admin && route.startsWith('/admin')) go('/');
  }, [user, admin, route]);

  const onAuthed = (data) => { saveSession(data); setUser(data); go(isAdmin(data) ? '/admin' : '/'); };
  const onLogout = () => { clearSession(); setUser(null); setPets([]); setApps([]); go('/'); };

  if (!user) return <Auth onAuthed={onAuthed} theme={theme} toggleTheme={toggleTheme} />;

  const props = { route, user, pets, apps, petsLoading, petsError, reloadPets, reloadApps, toast, onLogout, theme, toggleTheme };
  return (
    <>
      {admin ? (
        <Suspense fallback={<div className="boot">Loading admin console…</div>}><AdminLayout {...props} /></Suspense>
      ) : (
        <UserLayout {...props} />
      )}
      <Toasts toasts={toasts} />
    </>
  );
}
