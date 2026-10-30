import React, { useMemo, useState } from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Empty, Button } from '../../components/ui.jsx';
import PetCard from '../../components/PetCard.jsx';
import Icon from '../../components/Icon.jsx';

export default function Discover() {
  const { pets, petsLoading, petsError, favIds, toggleFav, viewPet, chatWith, addPet } = useApp();
  const [q, setQ] = useState('');
  const [species, setSpecies] = useState('ALL');
  const [gender, setGender] = useState('ALL');
  const [sort, setSort] = useState('newest');

  const speciesList = useMemo(() => ['ALL', ...Array.from(new Set(pets.map((p) => (p.species || '').toUpperCase()).filter(Boolean)))], [pets]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    let r = pets.filter((p) =>
      (species === 'ALL' || (p.species || '').toUpperCase() === species) &&
      (gender === 'ALL' || p.gender === gender) &&
      p.available !== false && // adopters only see pets that are available
      (!t || [p.name, p.breed, p.location, p.shelter].some((v) => (v || '').toLowerCase().includes(t)))
    );
    r = [...r].sort((a, b) => sort === 'age' ? (a.age || 0) - (b.age || 0) : new Date(b.createdAt) - new Date(a.createdAt));
    return r;
  }, [pets, q, species, gender, sort]);

  return (
    <>
      <PageHeader title="Available pets" subtitle={`${list.length} ${list.length === 1 ? 'pet' : 'pets'} waiting for a home`}
        actions={<Button variant="ghost" icon="plus" onClick={addPet}>List a pet</Button>} />

      <div className="filters card">
        <div className="search-box"><Icon name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, breed or location" aria-label="Search pets" /></div>
        <select value={species} onChange={(e) => setSpecies(e.target.value)} aria-label="Species">
          {speciesList.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All species' : s[0] + s.slice(1).toLowerCase()}</option>)}
        </select>
        <select value={gender} onChange={(e) => setGender(e.target.value)} aria-label="Gender">
          <option value="ALL">Any gender</option><option>Male</option><option>Female</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest first</option><option value="age">Youngest first</option>
        </select>
      </div>

      {petsLoading ? (
        <div className="pet-grid">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton-card"><div className="sk sk-img" /><div className="sk sk-line" /><div className="sk sk-line short" /></div>)}</div>
      ) : petsError ? (
        <div className="card"><Empty icon="alert" title="Couldn’t load pets">{petsError}</Empty></div>
      ) : pets.length === 0 ? (
        <div className="card"><Empty title="No pets listed yet"><Button icon="plus" onClick={addPet}>List the first pet</Button></Empty></div>
      ) : list.length === 0 ? (
        <div className="card"><Empty title="No pets match your filters">Try clearing a filter or searching for something else.</Empty></div>
      ) : (
        <div className="pet-grid">
          {list.map((p) => <PetCard key={p.id} pet={p} favorite={favIds.includes(p.id)} onToggleFavorite={toggleFav} onView={viewPet} onChat={chatWith} />)}
        </div>
      )}
    </>
  );
}
