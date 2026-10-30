import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Empty, StatusBadge, Button, formatDate } from '../../components/ui.jsx';
import Timeline from '../../components/Timeline.jsx';
import { go } from '../../hooks.js';

export default function Applications() {
  const { apps } = useApp();
  const list = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <>
      <PageHeader title="My applications" subtitle="Follow each application from submission to decision." />
      {list.length === 0 ? (
        <div className="card"><Empty icon="file" title="No applications yet">Find a pet you love and press “Adopt” to start.</Empty></div>
      ) : (
        <div className="stack">
          {list.map((a) => (
            <article className="card" key={a.id}>
              <div className="row-between">
                <div>
                  <h3>{a.petName || `Pet #${a.petId}`}</h3>
                  <p className="muted small">Submitted {formatDate(a.createdAt)} · {a.housingType} · Other pets: {a.hasOtherPets ? 'Yes' : 'No'}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <Timeline app={a} />
              <p className="note"><strong>Latest update:</strong> {a.backgroundCheckNotes}</p>
              <div className="row-gap">
                <Button variant="ghost" size="sm" icon="message" onClick={() => go(`/messages/${a.id}`)}>Message the shelter</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
