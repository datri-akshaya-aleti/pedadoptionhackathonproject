import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, StatCard, StatusBadge, Empty, formatMoney, formatDate } from '../../components/ui.jsx';

export default function Overview() {
  const { users, pets, apps, reports, donations } = useApp();
  const paid = donations.filter((d) => d.status === 'SUCCESS');
  const total = paid.reduce((s, d) => s + (d.amount || 0), 0);
  const count = (st) => apps.filter((a) => a.status === st).length;
  const recent = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const recentReports = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  // Real distribution from the pets table
  const speciesName = (v) => { const t = (v || 'Other').trim().toLowerCase(); return t.replace(/\b\w/g, (c) => c.toUpperCase()); };
  const bySpecies = Object.entries(pets.reduce((m, p) => { const k = speciesName(p.species); return { ...m, [k]: (m[k] || 0) + 1 }; }, {}))
    .sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...bySpecies.map(([, n]) => n));

  return (
    <>
      <PageHeader title="Overview" subtitle="Live numbers from your shelter database." />
      <div className="stat-grid stat-grid-4">
        <StatCard icon="users" label="Registered users" value={users.length} tone="teal" />
        <StatCard icon="paw" label="Total pets" value={pets.length} sub={`${pets.filter((p) => p.available !== false).length} available`} tone="green" />
        <StatCard icon="file" label="Pending applications" value={count('PENDING') + count('UNDER_REVIEW')} tone="orange" />
        <StatCard icon="check" label="Approved applications" value={count('APPROVED')} tone="green" />
        <StatCard icon="alert" label="Rescue reports" value={reports.length} sub={`${reports.filter((r) => r.status === 'REPORTED').length} awaiting action`} tone="rose" />
        <StatCard icon="gift" label="Donations received" value={formatMoney(total)} sub={`${paid.length} confirmed payments`} tone="orange" />
      </div>

      <div className="two-col">
        <section className="card">
          <div className="section-head"><h2>Recent applications</h2><a className="link" href="#/admin/applications">Manage</a></div>
          {recent.length === 0 ? <Empty icon="file" title="No applications yet" /> : recent.map((a) => (
            <div className="list-row" key={a.id}>
              <div><strong>{a.petName}</strong><p className="muted small">{a.adopterName} · {formatDate(a.createdAt)}</p></div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </section>
        <section className="card">
          <div className="section-head"><h2>Latest rescue reports</h2><a className="link" href="#/admin/reports">Manage</a></div>
          {recentReports.length === 0 ? <Empty icon="alert" title="No reports" /> : recentReports.map((r) => (
            <div className="list-row" key={r.id}>
              <div><strong>{r.animalType} · {r.condition}</strong><p className="muted small">{String(r.location).slice(0, 48)}</p></div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </section>
      </div>

      <section className="card">
        <div className="section-head"><h2>Pets by species</h2></div>
        {bySpecies.length === 0 ? <Empty title="No pets yet" /> : bySpecies.map(([name, n]) => (
          <div className="bar-row" key={name}>
            <span>{name}</span>
            <div className="bar"><div style={{ width: `${(n / max) * 100}%` }} /></div>
            <strong>{n}</strong>
          </div>
        ))}
      </section>
    </>
  );
}
