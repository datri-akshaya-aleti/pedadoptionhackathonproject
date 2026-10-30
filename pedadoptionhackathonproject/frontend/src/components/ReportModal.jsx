import React, { useState } from 'react';
import { Modal, Field, Button } from './ui.jsx';
import Icon from './Icon.jsx';
import { API_BASE, jsonPost } from '../api.js';

export default function ReportModal({ user, onClose }) {
  const [f, setF] = useState({ animalType: 'Dog', condition: 'Injured', location: '', description: '', photoUrl: '', reporterName: user?.name || '', reporterPhone: '', reporterEmail: user?.email || '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const geo = () => {
    if (!navigator.geolocation) return setErr('Location is not supported on this device. Please type the address.');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setF((x) => ({ ...x, location: `${x.location ? x.location + ' | ' : ''}https://maps.google.com/?q=${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}` })),
      () => setErr('Could not get your location. Please type the address instead.')
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!f.location.trim()) return setErr('Please tell us where the animal is.');
    setBusy(true);
    try {
      const res = await jsonPost(`${API_BASE}/reports`, f);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to submit the report.');
      setDone(true);
    } catch (e2) {
      setErr(e2.message || 'Failed to submit. Please call the helpline.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={done ? 'Report sent to the rescue team' : 'Report an animal in need'} subtitle={done ? undefined : 'Emergency helpline: +91 9100664071'} onClose={onClose}>
      {done ? (
        <div className="center-col">
          <p>Thank you for helping. Our team has been alerted by email, and we’ll email you as the rescue progresses. For anything life-threatening, please also call the helpline now.</p>
          <a className="btn btn-danger" href="tel:+919100664071"><Icon name="phone" size={16} /> +91 9100664071</a>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      ) : (
        <form className="form-grid" onSubmit={submit}>
          <Field label="Animal"><select value={f.animalType} onChange={set('animalType')}>{['Dog', 'Cat', 'Bird', 'Cattle', 'Rabbit', 'Hamster', 'Guinea Pig', 'Turtle', 'Other'].map((a) => <option key={a}>{a}</option>)}</select></Field>
          <Field label="Condition"><select value={f.condition} onChange={set('condition')}>{['Injured', 'Abandoned', 'Critical', 'Malnourished', 'Trapped'].map((a) => <option key={a}>{a}</option>)}</select></Field>
          <div className="span-2">
            <Field label="Location / landmark"><input required value={f.location} onChange={set('location')} placeholder="Street, area, nearby landmark" /></Field>
            <button type="button" className="link-btn" onClick={geo}><Icon name="pin" size={14} /> Add my current location</button>
          </div>
          <div className="span-2"><Field label="What happened?"><textarea rows={3} value={f.description} onChange={set('description')} /></Field></div>
          <div className="span-2"><Field label="Photo link (optional)"><input type="url" value={f.photoUrl} onChange={set('photoUrl')} /></Field></div>
          <Field label="Your name"><input value={f.reporterName} onChange={set('reporterName')} /></Field>
          <Field label="Your phone"><input type="tel" value={f.reporterPhone} onChange={set('reporterPhone')} /></Field>
          <div className="span-2"><Field label="Your email" hint="We’ll email you when the rescue team takes action."><input type="email" value={f.reporterEmail} onChange={set('reporterEmail')} placeholder="you@example.com" /></Field></div>
          {err && <p className="form-error span-2" role="alert">{err}</p>}
          <div className="span-2"><Button type="submit" variant="danger" loading={busy} icon="alert">Send emergency report</Button></div>
        </form>
      )}
    </Modal>
  );
}
