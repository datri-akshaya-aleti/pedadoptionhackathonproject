import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Avatar, Button } from '../../components/ui.jsx';

export default function SettingsAdmin() {
  const { user, theme, toggleTheme } = useApp();
  return (
    <>
      <PageHeader title="Settings" />
      <div className="card profile-card">
        <Avatar user={user} size={72} />
        <div><h2>{user.name}</h2><p className="muted">{user.email}</p><p className="muted small">Shelter administrator</p></div>
      </div>
      <div className="card setting-row">
        <div><strong>Appearance</strong><p className="muted small">Currently using {theme} mode.</p></div>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'}</Button>
      </div>
    </>
  );
}
