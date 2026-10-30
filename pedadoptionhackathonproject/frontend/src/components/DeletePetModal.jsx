import React, { useState } from 'react';
import { Modal, Button } from './ui.jsx';
import { API_BASE, authFetch } from '../api.js';

export default function DeletePetModal({ pet, onClose, onDone, toast }) {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    try {
      const res = await authFetch(`${API_BASE}/pets/${pet.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Could not delete the pet (server error ${res.status}).`);
      }
      toast(`${pet.name} was removed.`);
      onDone && onDone();
      onClose();
    } catch (e) {
      toast(e.message, 'error');
      setBusy(false);
    }
  };
  return (
    <Modal title={`Delete ${pet.name}?`} subtitle="This removes the listing for everyone. It can’t be undone." onClose={onClose}>
      <div className="modal-actions" style={{ marginTop: 0 }}>
        <Button variant="danger" loading={busy} onClick={remove}>Yes, delete</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
}
