import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, StatCard, Empty, StatusBadge } from '../../components/ui.jsx';
import PetCard from '../../components/PetCard.jsx';
import Timeline from '../../components/Timeline.jsx';
import { Button } from '../../components/ui.jsx';
import { go } from '../../hooks.js';

export default function Dashboard() {
  const { user, pets, apps, favIds, toggleFav, viewPet, chatWith } = useApp();
  const available = pets.filter((p) => p.available !== false);
  const active = apps.filter((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW');
  const approved = apps.filter((a) => a.status === 'APPROVED').length;
  const favPets = pets.filter((p) => favIds.includes(p.id));
  const newest = [...available].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        subtitle="Here’s where your adoption journey stands today."
        actions={<Button icon="search" onClick={() => go('/discover')}>Find a pet</Button>}
      />

      <div className="stat-grid">
        <StatCard icon="paw" label="Pets available" value={available.length} tone="green" />
        <StatCard icon="file" label="Active applications" value={active.length} tone="orange" />
        <StatCard icon="check" label="Approved" value={approved} tone="teal" />
        <StatCard icon="heart" label="Favorites" value={favIds.length} tone="rose" />
      </div>

      <section className="section">
        <div className="section-head"><h2>Active applications</h2><a href="#/applications" className="link">View all</a></div>
        {active.length === 0 ? (
          <div className="card"><Empty icon="file" title="No active applications">When you apply to adopt a pet, you’ll follow its progress here.</Empty></div>
        ) : (
          <div className="stack">
            {active.slice(0, 3).map((a) => (
              <div className="card" key={a.id}>
                <div className="row-between"><h3>{a.petName || `Pet #${a.petId}`}</h3><StatusBadge status={a.status} /></div>
                <Timeline app={a} />
              </div>
            ))}
          </div>
        )}
      </section>

      {favPets.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>Your favorites</h2><a href="#/favorites" className="link">View all</a></div>
          <div className="pet-grid">
            {favPets.slice(0, 3).map((p) => <PetCard key={p.id} pet={p} favorite onToggleFavorite={toggleFav} onView={viewPet} onChat={chatWith} />)}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head"><h2>Newest arrivals</h2><a href="#/discover" className="link">Browse all</a></div>
        <div className="pet-grid">
          {newest.map((p) => <PetCard key={p.id} pet={p} favorite={favIds.includes(p.id)} onToggleFavorite={toggleFav} onView={viewPet} onChat={chatWith} />)}
        </div>
      </section>
    </>
  );
}
