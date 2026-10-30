import React, { useState } from 'react';
import { Modal, Field, Button } from './ui.jsx';
import { API_BASE, jsonPost } from '../api.js';
import { go } from '../hooks.js';

export default function ApplyModal({ pet, user, onClose, onSubmitted, toast }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.target);
    try {
      const res = await jsonPost(`${API_BASE}/applications`, {
        petId: pet.id,
        adopterUserId: user.id,
        adopterName: user.name,
        email: fd.get('email'),
        phone: fd.get('phone'),
        housingType: fd.get('housingType'),
        hasOtherPets: fd.get('hasOtherPets') === 'yes',
        reason: fd.get('reason'),
      });
      if (!res.ok) throw new Error('Could not submit the application.');
      setDone(true);
      onSubmitted && onSubmitted();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={done ? 'Application submitted' : `Adopt ${pet.name}`} subtitle={done ? undefined : 'Tell the shelter a little about your home.'} onClose={onClose}>
      {done ? (
        <div className="center-col">
          <p>Your application for <strong>{pet.name}</strong> has been received. The shelter will review it and you can follow every step under My Applications.</p>
          <Button onClick={() => { onClose(); go('/applications'); }}>Track my application</Button>
        </div>
      ) : (
        <form className="form-grid" onSubmit={submit}>
          <Field label="Contact email"><input name="email" type="email" required defaultValue={user.email} /></Field>
          <Field label="Phone number"><input name="phone" required placeholder="+91 98765 43210" /></Field>
          <Field label="Housing type">
            <select name="housingType">
              <option>House with fenced yard</option>
              <option>Apartment / Condo</option>
              <option>Farm / Rural Property</option>
            </select>
          </Field>
          <Field label="Do you have other pets?">
            <select name="hasOtherPets"><option value="no">No</option><option value="yes">Yes</option></select>
          </Field>
          <div className="span-2">
            <Field label={`Why do you want to adopt ${pet.name}?`}>
              <textarea name="reason" required rows={4} placeholder="Your home, daily routine and experience with pets…" />
            </Field>
          </div>
          <div className="span-2"><Button type="submit" loading={busy}>Submit application</Button></div>
        </form>
      )}
    </Modal>
  );
}
