import React, { useState } from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Badge, Empty, Button, formatDate } from '../../components/ui.jsx';
import Icon from '../../components/Icon.jsx';

export default function PetsAdmin() {
  const { pets, petsLoading, petsError, addPet, viewPet, editPet, deletePet } = useApp();
  const [q, setQ] = useState('');
  const t = q.trim().toLowerCase();
  const list = pets.filter((p) => !t || [p.name, p.breed, p.species, p.shelter, p.location].some((v) => (v || '').toLowerCase().includes(t)));
  return (
    <>
      <PageHeader title="Pet management" subtitle={`${pets.length} pets in the system`} actions={<Button icon="plus" onClick={addPet}>Add pet</Button>} />
      <div className="card">
        <div className="search-box inline"><Icon name="search" size={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pets" aria-label="Search pets" /></div>
        {petsLoading ? <p className="muted">Loading pets…</p> : petsError ? <Empty icon="alert" title="Couldn’t load pets">{petsError}</Empty> : list.length === 0 ? <Empty title="No pets found" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Pet</th><th>Species / breed</th><th>Age</th><th>Shelter</th><th>Status</th><th>Added</th><th /></tr></thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td><div className="cell-pet"><img src={p.photoUrl} alt="" /><strong>{p.name}</strong></div></td>
                    <td>{p.species} · {p.breed}</td>
                    <td>{p.age}</td>
                    <td>{p.shelter}<br /><span className="muted small">{p.location}</span></td>
                    <td><Badge tone={p.available === false ? 'danger' : 'success'}>{p.available === false ? 'Adopted' : 'Available'}</Badge></td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td><div className="row-actions">
                      <Button variant="ghost" size="sm" onClick={() => viewPet(p)}>View</Button>
                      <Button variant="ghost" size="sm" onClick={() => editPet(p)}>Edit</Button>
                      <Button variant="danger-soft" size="sm" onClick={() => deletePet(p)}>Delete</Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
