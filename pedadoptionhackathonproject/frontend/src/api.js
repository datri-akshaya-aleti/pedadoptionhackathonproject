export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const STORAGE_KEY = 'pawshome_user';

// The login lives in sessionStorage (not localStorage): opening the site in a new tab/window
// or after closing the browser always shows the login page first. A refresh keeps you signed in.
export const loadSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY); // clear any old "remembered" login from earlier versions
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
  } catch (e) { return null; }
};
export const saveSession = (u) => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
export const clearSession = () => sessionStorage.removeItem(STORAGE_KEY);

// fetch() wrapper that attaches the JWT (saved at login) as a Bearer token.
export const authFetch = async (url, options = {}) => {
  const session = loadSession();
  const token = session && session.token;
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(url, { ...options, headers });
  // Token expired / invalid -> force a fresh sign-in
  if (res.status === 401 && token) {
    clearSession();
    window.location.reload();
  }
  return res;
};

export const jsonPost = (url, body, method = 'POST') =>
  authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const getJson = async (path) => {
  const res = await authFetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
};

export const isAdmin = (u) => !!u && u.role === 'SHELTER_ADMIN';
