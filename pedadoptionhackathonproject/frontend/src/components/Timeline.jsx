import React from 'react';
import Icon from './Icon.jsx';

// Builds the visual stages purely from the real application fields.
export function stagesFor(app) {
  const st = app.status;
  const bg = app.backgroundCheckStatus;
  const decided = st === 'APPROVED' || st === 'REJECTED';
  return [
    { label: 'Submitted', state: 'done' },
    { label: 'Under review', state: st === 'PENDING' ? 'current' : 'done' },
    { label: 'Background check', state: bg === 'PASSED' ? 'done' : bg === 'FAILED' ? 'failed' : decided ? 'done' : 'current' },
    { label: st === 'REJECTED' ? 'Rejected' : 'Approved', state: st === 'APPROVED' ? 'done' : st === 'REJECTED' ? 'failed' : 'todo' },
  ];
}

export default function Timeline({ app }) {
  return (
    <ol className="timeline">
      {stagesFor(app).map((s, i) => (
        <li key={i} className={`tl-${s.state}`}>
          <span className="tl-dot">{s.state === 'done' ? <Icon name="check" size={13} /> : s.state === 'failed' ? <Icon name="x" size={13} /> : i + 1}</span>
          <span className="tl-label">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
