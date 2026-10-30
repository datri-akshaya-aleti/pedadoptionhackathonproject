import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Empty, StatusBadge } from '../../components/ui.jsx';
import { API_BASE, jsonPost } from '../../api.js';

const STATUSES = ['REPORTED', 'DISPATCHED', 'RESCUED', 'TREATED'];

export default function ReportsAdmin() {
  const { reports, reloadReports, toast } = useApp();
  const list = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const setStatus = async (id, status) => {
    const target = reports.find((r) => r.id === id);
    try {
      const res = await jsonPost(`${API_BASE}/reports/${id}/status`, { status }, 'PUT');
      if (!res.ok) throw new Error();
      toast(target?.reporterEmail ? `Status updated. ${target.reporterEmail} was notified by email.` : 'Status updated. No reporter email on file, so no email was sent.');
      reloadReports();
    } catch (e) { toast('Could not update the report.', 'error'); }
  };
  return (
    <>
      <PageHeader title="Rescue reports" subtitle="Abandoned and injured animals reported by the public." />
      {list.length === 0 ? <div className="card"><Empty icon="alert" title="No reports yet" /></div> : (
        <div className="stack">
          {list.map((r) => (
            <article className="card report" key={r.id}>
              {r.photoUrl && <img className="report-photo" src={r.photoUrl} alt="" />}
              <div className="report-body">
                <div className="row-between">
                  <h3>{r.animalType} · {r.condition}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="muted small">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</p>
                <p><strong>Location:</strong> {r.location}</p>
                {r.description && <p>{r.description}</p>}
                <p className="muted small">Reporter: {r.reporterName || 'Anonymous'}{r.reporterPhone ? ` · ${r.reporterPhone}` : ''}{r.reporterEmail ? ` · ${r.reporterEmail}` : ' · no email on file'}</p>
                <label className="inline-field"><span className="small muted">Update status</span>
                  <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
