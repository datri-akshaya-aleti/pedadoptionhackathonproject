import React, { useEffect, useRef, useState } from 'react';
import { API_BASE, authFetch, jsonPost, isAdmin } from '../api.js';
import Icon from './Icon.jsx';

// kind: 'pet' (direct chat with a pet's owner) | 'app' (application chat)
export default function ChatPanel({ kind, targetId, user, quick = [], banner }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const path = kind === 'pet' ? `/chat/pet/${targetId}` : `/chat/${targetId}`;
  const role = isAdmin(user) ? 'SHELTER' : 'ADOPTER';

  const load = () =>
    authFetch(`${API_BASE}${path}`).then((r) => r.json()).then((d) => Array.isArray(d) && setMessages(d)).catch(() => {});

  useEffect(() => {
    setMessages([]);
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [path]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);

  const send = async (message) => {
    if (!message.trim()) return;
    const body = { senderName: user.name, senderRole: role, message: message.trim() };
    body[kind === 'pet' ? 'petId' : 'applicationId'] = targetId;
    try { await jsonPost(`${API_BASE}${path}`, body); setText(''); load(); } catch (e) { /* ignore */ }
  };

  return (
    <div className="chat">
      {banner && <div className="chat-banner"><Icon name="shield" size={15} /> {banner}</div>}
      <div className="chat-log">
        {messages.length === 0 && <p className="muted center">No messages yet. Say hello!</p>}
        {messages.map((m) => {
          const mine = m.senderName === user.name && m.senderRole !== 'SYSTEM';
          const cls = m.senderRole === 'SYSTEM' ? 'system' : mine ? 'mine' : 'theirs';
          return (
            <div key={m.id} className={`bubble ${cls}`}>
              {cls !== 'system' && <span className="bubble-name">{m.senderName}</span>}
              {m.message}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {quick.length > 0 && (
        <div className="chip-row chat-quick">
          {quick.map((q) => <button key={q} type="button" className="chip chip-btn" onClick={() => send(q)}>{q}</button>)}
        </div>
      )}
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" aria-label="Message" />
        <button className="btn btn-primary btn-sm" type="submit"><Icon name="send" size={15} /> Send</button>
      </form>
    </div>
  );
}
