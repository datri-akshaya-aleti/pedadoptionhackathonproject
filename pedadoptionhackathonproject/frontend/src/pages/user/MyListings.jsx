import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, Empty, Button, Badge } from '../../components/ui.jsx';

export default function MyListings() {
  const { pets, user, addPet, editPet, deletePet, viewPet } = useApp();
  const mine = pets.filter((p) => p.ownerId === user.id);
  return (
    <>
      <PageHeader title="My listings" subtitle="Pets you’ve put up for adoption." actions={<Button icon="plus" onClick={addPet}>List a pet</Button>} />
      {mine.length === 0 ? (
        <div className="card"><Empty icon="paw" title="You haven’t listed any pets">Need to rehome a pet? List it and adopters can contact you.</Empty></div>
      ) : (
        <div className="stack">
          {mine.map((p) => (
            <article className="card listing" key={p.id}>
              <img src={p.photoUrl} alt="" />
              <div className="listing-body">
                <div className="row-between">
                  <div><h3>{p.name}</h3><p className="muted small">{p.breed} · {p.age} yrs · {p.location}</p></div>
                  <Badge tone={p.available === false ? 'danger' : 'success'}>{p.available === false ? 'Adopted' : 'Available'}</Badge>
                </div>
                <div className="row-gap">
                  <Button variant="ghost" size="sm" onClick={() => viewPet(p)}>View</Button>
                  <Button variant="ghost" size="sm" onClick={() => editPet(p)}>Edit</Button>
                  <Button variant="danger-soft" size="sm" onClick={() => deletePet(p)}>Delete</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
