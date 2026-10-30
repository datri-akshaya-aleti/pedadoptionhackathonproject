import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Avatar, Button } from '../../components/ui.jsx';

export default function Profile() {
  const { user, theme, toggleTheme, apps, favIds } = useApp();
  return (
    <>
      <PageHeader title="Profile & settings" />
      <div className="card profile-card">
        <Avatar user={user} size={72} />
        <div>
          <h2>{user.name}</h2>
          <p className="muted">{user.email}</p>
          <p className="muted small">{apps.length} applications · {favIds.length} favorites</p>
        </div>
      </div>
      <div className="card setting-row">
        <div><strong>Appearance</strong><p className="muted small">Currently using {theme} mode.</p></div>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'}</Button>
      </div>
    </>
  );
}
