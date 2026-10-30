import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Empty } from '../../components/ui.jsx';
import PetCard from '../../components/PetCard.jsx';

export default function Favorites() {
  const { pets, favIds, toggleFav, viewPet, chatWith } = useApp();
  const list = pets.filter((p) => favIds.includes(p.id));
  return (
    <>
      <PageHeader title="Favorites" subtitle="Pets you’ve saved on this device." />
      {list.length === 0 ? (
        <div className="card"><Empty icon="heart" title="No favorites yet">Tap the heart on any pet to save it here.</Empty></div>
      ) : (
        <div className="pet-grid">
          {list.map((p) => <PetCard key={p.id} pet={p} favorite onToggleFavorite={toggleFav} onView={viewPet} onChat={chatWith} />)}
        </div>
      )}
    </>
  );
}
