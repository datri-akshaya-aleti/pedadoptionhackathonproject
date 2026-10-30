import React from 'react';
import { Modal } from './ui.jsx';
import ChatPanel from './ChatPanel.jsx';

export default function PetChatModal({ pet, user, onClose }) {
  return (
    <Modal title={`Chat about ${pet.name}`} subtitle={`${pet.shelter} · ${pet.location || ''}`} onClose={onClose} wide>
      <ChatPanel
        kind="pet" targetId={pet.id} user={user}
        banner={`The shelter assistant can answer quick questions about ${pet.name}.`}
        quick={[`What are ${pet.name}'s vaccination details?`, `Is ${pet.name} good with kids and other pets?`, `Can I schedule a visit to meet ${pet.name}?`, `How do I adopt ${pet.name}?`]}
      />
    </Modal>
  );
}
