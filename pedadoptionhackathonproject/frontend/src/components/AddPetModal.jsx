import React, { useState } from 'react';
import { Modal, Field, Button } from './ui.jsx';
import { API_BASE, jsonPost } from '../api.js';

const EMPTY = {
  name: '', species: 'Dog', breed: '', age: 1, gender: 'Male', photoUrl: '', shelter: '', shelterEmail: '',
  location: '', healthRecord: 'Vaccinated & Vet Checked', description: '', personalityTags: 'Friendly · Playful',
};

export default function AddPetModal({ user, pet, onClose, onSaved, toast, title }) {
  const editing = !!pet;
  const [f, setF] = useState(editing
    ? { ...EMPTY, ...pet, age: pet.age ?? 0, available: pet.available !== false }
    : { ...EMPTY, shelter: user.name, shelterEmail: user.email });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...f, age: parseInt(f.age, 10) || 0 };
      const res = editing
        ? await jsonPost(`${API_BASE}/pets/${pet.id}`, body, 'PUT')
        : await jsonPost(`${API_BASE}/pets`, body);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || d.message || `Could not ${editing ? 'save' : 'publish'} the pet (server error ${res.status}).`);
      }
      toast(editing ? `${f.name} was updated.` : `${f.name} is now listed for adoption.`);
      onSaved && onSaved();
      onClose();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={title || (editing ? `Edit ${pet.name}` : 'Add a pet for adoption')} subtitle="Adopters will see this profile and can message you directly." onClose={onClose} wide>
      <form className="form-grid" onSubmit={submit}>
        <Field label="Pet name"><input required value={f.name} onChange={set('name')} placeholder="Rocky" /></Field>
        <Field label="Species">
          <select value={f.species} onChange={set('species')}>{['Dog', 'Cat', 'Rabbit', 'Hamster', 'Guinea Pig', 'Bird', 'Turtle', 'Fish', 'Horse', 'Other'].map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Breed"><input required value={f.breed} onChange={set('breed')} placeholder="Golden Retriever" /></Field>
        <Field label="Age (years)"><input type="number" min="0" required value={f.age} onChange={set('age')} /></Field>
        <Field label="Gender"><select value={f.gender} onChange={set('gender')}><option>Male</option><option>Female</option></select></Field>
        <Field label="City / location"><input required value={f.location} onChange={set('location')} placeholder="Hyderabad" /></Field>
        <Field label="Shelter / owner name"><input required value={f.shelter} onChange={set('shelter')} /></Field>
        <Field label="Contact email"><input type="email" value={f.shelterEmail} onChange={set('shelterEmail')} /></Field>
        <div className="span-2"><Field label="Photo URL"><input required value={f.photoUrl} onChange={set('photoUrl')} placeholder="https://…" /></Field></div>
        <div className="span-2"><Field label="Health & vaccination summary"><input required value={f.healthRecord} onChange={set('healthRecord')} /></Field></div>
        <div className="span-2"><Field label="Personality tags" hint="Separate with ·"><input value={f.personalityTags} onChange={set('personalityTags')} /></Field></div>
        <div className="span-2"><Field label="Description"><textarea required rows={3} value={f.description} onChange={set('description')} /></Field></div>
        {editing && (
          <label className="check span-2">
            <input type="checkbox" checked={f.available !== false} onChange={(e) => setF({ ...f, available: e.target.checked })} />
            <span>Still available for adoption</span>
          </label>
        )}
        <div className="span-2"><Button type="submit" loading={busy}>{editing ? 'Save changes' : 'Publish pet'}</Button></div>
      </form>
    </Modal>
  );
}
