import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { Avatar } from './ui.jsx';
import { go } from '../hooks.js';

// Shared app frame. The navigation lives in a slide-out drawer opened by the 3-line button.
export default function Shell({ variant, nav, route, user, onLogout, theme, toggleTheme, actions, children }) {
  const [open, setOpen] = useState(false);
  const isActive = (to) => (to === nav[0].to ? route === to || route === '/' : route === to || route.startsWith(to + '/'));
  const current = nav.find((n) => isActive(n.to)) || nav[0];

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  return (
    <div className={`shell shell-${variant}`}>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-hidden={!open} inert={open ? undefined : ''}>
        <div className="sidebar-head">
          <div className="sidebar-brand">
            <Icon name="paw" size={22} /> <span>PawsHome</span>
            {variant === 'admin' && <em className="admin-tag">Admin</em>}
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="x" /></button>
        </div>
        <nav aria-label="Main">
          {nav.map((n) => (
            <a key={n.to} href={`#${n.to}`} className={`nav-link ${isActive(n.to) ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <Icon name={n.icon} size={18} /> {n.label}
              {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="nav-link" onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} /> {theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
          <button className="nav-link" onClick={() => { setOpen(false); onLogout(); }}><Icon name="logout" size={18} /> Sign out</button>
        </div>
      </aside>

      <header className="topbar">
        <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}><Icon name="menu" size={22} /></button>
        <a className="topbar-brand" href={variant === 'admin' ? '#/admin' : '#/'}><Icon name="paw" size={20} /><span>PawsHome</span></a>
        <span className="topbar-sep" aria-hidden="true" />
        <span className="topbar-title">{current.label}</span>
        <div className="topbar-right">
          {actions}
          <button className="profile-chip" onClick={() => go(variant === 'admin' ? '/admin/settings' : '/profile')}>
            <Avatar user={user} size={30} />
            <span className="profile-text"><strong>{user.name}</strong><small>{variant === 'admin' ? 'Shelter admin' : 'Adopter'}</small></span>
          </button>
        </div>
      </header>
      <main className="content"><div className="page" key={route}>{children}</div></main>
    </div>
  );
}
