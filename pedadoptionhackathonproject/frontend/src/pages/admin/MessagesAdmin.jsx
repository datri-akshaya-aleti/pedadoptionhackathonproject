import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Empty } from '../../components/ui.jsx';
import ChatPanel from '../../components/ChatPanel.jsx';
import { go } from '../../hooks.js';

export default function MessagesAdmin({ route }) {
  const { apps, user } = useApp();
  const id = Number(route.split('/')[2]) || apps[0]?.id;
  const selected = apps.find((a) => a.id === id);
  return (
    <>
      <PageHeader title="Messages" subtitle="Application conversations with adopters." />
      {apps.length === 0 ? <div className="card"><Empty icon="message" title="No conversations yet" /></div> : (
        <div className="chat-layout">
          <div className="card chat-list">
            {apps.map((a) => (
              <button key={a.id} className={`chat-item ${a.id === id ? 'on' : ''}`} onClick={() => go(`/admin/messages/${a.id}`)}>
                <strong>{a.petName}</strong><span className="muted small">{a.adopterName}</span>
              </button>
            ))}
          </div>
          <div className="card chat-main">
            {selected ? <ChatPanel kind="app" targetId={selected.id} user={user} /> : <Empty icon="message" title="Select a conversation" />}
          </div>
        </div>
      )}
    </>
  );
}
