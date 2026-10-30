import React, { useState } from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Empty, StatusBadge, Button, formatDate } from '../../components/ui.jsx';
import Timeline from '../../components/Timeline.jsx';
import { API_BASE, jsonPost } from '../../api.js';
import { go } from '../../hooks.js';

const TABS = [['ALL', 'All'], ['PENDING', 'Pending'], ['UNDER_REVIEW', 'Under review'], ['APPROVED', 'Approved'], ['REJECTED', 'Rejected']];

export default function ApplicationsAdmin() {
  const { apps, reloadApps, toast } = useApp();
  const [tab, setTab] = useState('ALL');
  const [busyId, setBusyId] = useState(null);
  const list = [...apps].filter((a) => tab === 'ALL' || a.status === tab).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const update = async (a, status, backgroundCheckStatus, backgroundCheckNotes) => {
    setBusyId(a.id);
    try {
      const res = await jsonPost(`${API_BASE}/applications/${a.id}/status`, { status, backgroundCheckStatus, backgroundCheckNotes }, 'PUT');
      if (!res.ok) throw new Error('Update failed');
      toast(`Application for ${a.petName} marked ${status.replace('_', ' ').toLowerCase()}. ${a.adopterName} was notified by email.`);
      reloadApps();
    } catch (e) { toast('Could not update the application.', 'error'); }
    finally { setBusyId(null); }
  };

  return (
    <>
      <PageHeader title="Adoption applications" subtitle="Review, verify and decide on each application." />
      <div className="tabs" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
            {label} <span className="tab-count">{k === 'ALL' ? apps.length : apps.filter((a) => a.status === k).length}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? <div className="card"><Empty icon="file" title="Nothing here" /></div> : (
        <div className="stack">
          {list.map((a) => {
            const decided = a.status === 'APPROVED' || a.status === 'REJECTED';
            return (
              <article className="card" key={a.id}>
                <div className="row-between">
                  <div>
                    <h3>{a.petName || `Pet #${a.petId}`}</h3>
                    <p className="muted small">{a.adopterName} · {a.email} · {a.phone} · {formatDate(a.createdAt)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <p className="quote">“{a.reason}”</p>
                <p className="muted small">Housing: {a.housingType} · Other pets: {a.hasOtherPets ? 'Yes' : 'No'}</p>
                <Timeline app={a} />
                <p className="note">{a.backgroundCheckNotes}</p>
                <div className="row-gap">
                  <Button variant="ghost" size="sm" icon="message" onClick={() => go(`/admin/messages/${a.id}`)}>Open chat</Button>
                  <span className="spacer" />
                  {a.status === 'PENDING' && (
                    <Button variant="ghost" size="sm" loading={busyId === a.id} onClick={() => update(a, 'UNDER_REVIEW', 'IN_PROGRESS', 'Application is now under review by the shelter team.')}>Start review</Button>
                  )}
                  {!decided && (
                    <>
                      <Button variant="danger-soft" size="sm" loading={busyId === a.id} onClick={() => update(a, 'REJECTED', 'FAILED', 'Housing requirements or reference checks did not satisfy the safety policy.')}>Reject</Button>
                      <Button size="sm" loading={busyId === a.id} onClick={() => update(a, 'APPROVED', 'PASSED', 'Background check passed. Approved for adoption!')}>Approve</Button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
