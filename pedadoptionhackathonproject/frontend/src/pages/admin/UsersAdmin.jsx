import React, { useState } from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Badge, Avatar, Empty, formatDate } from '../../components/ui.jsx';
import Icon from '../../components/Icon.jsx';

export default function UsersAdmin() {
  const { users, apps } = useApp();
  const [q, setQ] = useState('');
  const t = q.trim().toLowerCase();
  const list = users.filter((u) => !t || [u.name, u.email].some((v) => (v || '').toLowerCase().includes(t)));
  return (
    <>
      <PageHeader title="Users" subtitle={`${users.length} registered accounts`} />
      <div className="card">
        <div className="search-box inline"><Icon name="search" size={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" aria-label="Search users" /></div>
        {list.length === 0 ? <Empty icon="users" title="No users found" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>User</th><th>Role</th><th>Phone</th><th>Applications</th><th>Joined</th><th>Last login</th></tr></thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id}>
                    <td><div className="cell-pet"><Avatar user={u} size={34} /><div><strong>{u.name}</strong><br /><span className="muted small">{u.email}</span></div></div></td>
                    <td><Badge tone={u.role === 'SHELTER_ADMIN' ? 'info' : 'neutral'}>{u.role === 'SHELTER_ADMIN' ? 'Admin' : 'Adopter'}</Badge></td>
                    <td>{u.phone || '—'}</td>
                    <td>{apps.filter((a) => a.adopterUserId === u.id).length}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>{formatDate(u.lastLoginAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
