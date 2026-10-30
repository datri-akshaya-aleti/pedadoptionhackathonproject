import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Empty } from '../../components/ui.jsx';
import ChatPanel from '../../components/ChatPanel.jsx';
import { go } from '../../hooks.js';

export default function Messages({ route }) {
  const { apps, user } = useApp();
  const id = Number(route.split('/')[2]) || apps[0]?.id;
  const selected = apps.find((a) => a.id === id);
  return (
    <>
      <PageHeader title="Messages" subtitle="Talk to the shelter about your application." />
      {apps.length === 0 ? (
        <div className="card"><Empty icon="message" title="No conversations yet">Submit an adoption application to start chatting with the shelter. You can also chat about any pet from its card.</Empty></div>
      ) : (
        <div className="chat-layout">
          <div className="card chat-list">
            {apps.map((a) => (
              <button key={a.id} className={`chat-item ${a.id === id ? 'on' : ''}`} onClick={() => go(`/messages/${a.id}`)}>
                <strong>{a.petName}</strong><span className="muted small">Application #{a.id}</span>
              </button>
            ))}
          </div>
          <div className="card chat-main">
            {selected ? (
              <ChatPanel kind="app" targetId={selected.id} user={user}
                banner="The shelter assistant replies instantly with status updates."
                quick={['What is my application status?', 'How long does approval take?', 'Is my background check complete?']} />
            ) : <Empty icon="message" title="Select an application" />}
          </div>
        </div>
      )}
    </>
  );
}
