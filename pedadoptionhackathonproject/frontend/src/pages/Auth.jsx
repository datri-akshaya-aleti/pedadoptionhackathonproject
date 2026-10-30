import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Button } from '../components/ui.jsx';
import { API_BASE } from '../api.js';

const HERO = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1400&q=80';

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
}
const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Auth({ onAuthed, theme, toggleTheme }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isReg = mode === 'register';
  const score = strength(form.password);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email address.');
    if (!form.password) return setError('Please enter your password.');
    if (isReg) {
      if (form.name.trim().length < 2) return setError('Please enter your full name.');
      if (form.password.length < 8) return setError('Use at least 8 characters for your password.');
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/auth/${isReg ? 'register' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isReg ? { name: form.name.trim(), email: form.email, password: form.password } : { email: form.email, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      onAuthed(data);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Cannot reach the server. Is the backend running on port 8080?' : err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(20,45,38,.25), rgba(20,45,38,.88)), url(${HERO})` }}>
        <div className="brand brand-light"><Icon name="paw" size={26} /> PawsHome</div>
        <div>
          <h2>Where love finds a four-legged friend.</h2>
          <p>Browse verified shelter pets, track your adoption every step of the way, and help animals in need — all in one place.</p>
          <div className="hero-points">
            <span><Icon name="shield" size={16} /> Verified shelters</span>
            <span><Icon name="message" size={16} /> Chat with caretakers</span>
            <span><Icon name="heart" size={16} /> Support rescue work</span>
          </div>
        </div>
      </aside>

      <main className="auth-panel">
        <button className="icon-btn auth-theme" onClick={toggleTheme} aria-label="Toggle dark mode"><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
        <form className="auth-card" onSubmit={submit} noValidate>
          <div className="brand brand-dark auth-mobile-brand"><Icon name="paw" size={24} /> PawsHome</div>
          <h1>{isReg ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">{isReg ? 'Join to adopt, favorite pets and follow your applications.' : 'Sign in to continue your adoption journey.'}</p>

          {isReg && (
            <label className="field"><span className="field-label">Full name</span>
              <input value={form.name} onChange={set('name')} autoComplete="name" placeholder="Jane Doe" /></label>
          )}
          <label className="field"><span className="field-label">Email</span>
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" /></label>
          <label className="field"><span className="field-label">Password</span>
            <div className="input-icon">
              <input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} autoComplete={isReg ? 'new-password' : 'current-password'} placeholder="••••••••" />
              <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}><Icon name={show ? 'eyeoff' : 'eye'} /></button>
            </div>
          </label>

          {isReg && form.password && (
            <div className="strength" aria-live="polite">
              <div className="strength-bars">{[1, 2, 3, 4].map((i) => <span key={i} className={i <= score ? `on s${score}` : ''} />)}</div>
              <span className="small muted">{LABELS[score]}</span>
            </div>
          )}

          {error && <p className="form-error" role="alert"><Icon name="alert" size={15} /> {error}</p>}
          <Button type="submit" loading={busy} className="btn-block">{isReg ? 'Create account' : 'Sign in'}</Button>

          <p className="auth-switch muted">
            {isReg ? 'Already have an account?' : 'New to PawsHome?'}{' '}
            <button type="button" className="link-btn" onClick={() => { setMode(isReg ? 'login' : 'register'); setError(''); }}>
              {isReg ? 'Sign in' : 'Create an account'}
            </button>
          </p>

          {!isReg && (
            <details className="demo">
              <summary>Demo accounts</summary>
              <p className="small muted">Fills the form with the seeded demo credentials. You still sign in through the normal login.</p>
              <div className="demo-row">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, email: 'adopter@example.com', password: 'password123' })}>Adopter</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, email: 'admin@shelter.org', password: 'admin123' })}>Shelter admin</button>
              </div>
            </details>
          )}
        </form>
      </main>
    </div>
  );
}
