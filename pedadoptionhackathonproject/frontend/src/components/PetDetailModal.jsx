import React from 'react';
import { Modal, Badge, Button } from './ui.jsx';
import Icon from './Icon.jsx';

export default function PetDetailModal({ pet, onClose, onApply, onChat }) {
  return (
    <Modal title={pet.name} subtitle={`${pet.breed} · ${pet.age} ${pet.age === 1 ? 'year' : 'years'} · ${pet.gender}`} onClose={onClose} wide>
      <img className="detail-photo" src={pet.photoUrl} alt={pet.name} />
      <p className="detail-shelter"><Icon name="building" size={15} /> {pet.shelter} · {pet.location || 'Local shelter'}</p>
      <p className="detail-desc">{pet.description}</p>
      <div className="chip-row">
        {pet.personalityTags?.split('·').map((t, i) => <span key={i} className="chip">{t.trim()}</span>)}
      </div>
      <div className="info-grid">
        <div><span className="muted small">Vaccination</span><strong>{pet.vaccinated === false ? 'Not fully vaccinated' : 'Fully vaccinated'}</strong></div>
        <div><span className="muted small">Spayed / neutered</span><strong>{pet.spayedNeutered === false ? 'No' : 'Yes'}</strong></div>
        <div><span className="muted small">Health record</span><strong>{pet.healthRecord || '—'}</strong></div>
        <div><span className="muted small">Medical history</span><strong>{pet.medicalHistory || '—'}</strong></div>
      </div>
      <div className="modal-actions">
        {onApply && <Button onClick={() => onApply(pet)} disabled={pet.available === false} icon="paw">{pet.available === false ? 'Already adopted' : `Adopt ${pet.name}`}</Button>}
        {onChat && <Button variant="ghost" icon="message" onClick={() => onChat(pet)}>Chat with shelter</Button>}
        {pet.available === false && <Badge tone="danger">Adopted</Badge>}
      </div>
    </Modal>
  );
}
