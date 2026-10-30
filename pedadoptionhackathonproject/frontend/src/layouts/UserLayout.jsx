import React, { useState } from 'react';
import Shell from '../components/Shell.jsx';
import Icon from '../components/Icon.jsx';
import { Button } from '../components/ui.jsx';
import PetDetailModal from '../components/PetDetailModal.jsx';
import ApplyModal from '../components/ApplyModal.jsx';
import PetChatModal from '../components/PetChatModal.jsx';
import DonateModal from '../components/DonateModal.jsx';
import ReportModal from '../components/ReportModal.jsx';
import AddPetModal from '../components/AddPetModal.jsx';
import { AppContext } from '../context.js';
import { useFavorites } from '../hooks.js';

import Discover from '../pages/user/Discover.jsx';
import Favorites from '../pages/user/Favorites.jsx';
import Applications from '../pages/user/Applications.jsx';
import Messages from '../pages/user/Messages.jsx';
import Profile from '../pages/user/Profile.jsx';
import MyListings from '../pages/user/MyListings.jsx';
import DeletePetModal from '../components/DeletePetModal.jsx';

export default function UserLayout({ route, user, pets, apps, petsLoading, petsError, reloadPets, reloadApps, toast, onLogout, theme, toggleTheme }) {
  const [favIds, toggleFav] = useFavorites(user.id);
  const [modal, setModal] = useState(null); // { type, pet }
  const open = (type, pet) => setModal({ type, pet });
  const close = () => setModal(null);

  const ctx = {
    user, pets, apps, petsLoading, petsError, toast, reloadPets, reloadApps, favIds, toggleFav,
    viewPet: (p) => open('detail', p), applyTo: (p) => open('apply', p), chatWith: (p) => open('chat', p),
    addPet: () => open('add'), editPet: (p) => open('edit', p), deletePet: (p) => open('delete', p), donate: () => open('donate'), report: () => open('report'),
    theme, toggleTheme,
  };

  const pending = apps.filter((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW').length;
  const nav = [
    { to: '/discover', label: 'Available Pets', icon: 'search' }, // home page after login
    { to: '/favorites', label: 'Favorites', icon: 'heart', badge: favIds.length },
    { to: '/applications', label: 'My Applications', icon: 'file', badge: pending },
    { to: '/messages', label: 'Messages', icon: 'message' },
    { to: '/my-listings', label: 'My Listings', icon: 'building' },
    { to: '/profile', label: 'Profile & Settings', icon: 'user' },
  ];

  let page;
  if (route.startsWith('/favorites')) page = <Favorites />;
  else if (route.startsWith('/applications')) page = <Applications />;
  else if (route.startsWith('/messages')) page = <Messages route={route} />;
  else if (route.startsWith('/my-listings')) page = <MyListings />;
  else if (route.startsWith('/profile')) page = <Profile />;
  else page = <Discover />; // '/' and '/discover': available pets

  const actions = (
    <>
      <Button variant="danger-soft" size="sm" icon="alert" onClick={ctx.report}><span className="hide-sm">Report a pet</span></Button>
      <Button variant="accent" size="sm" icon="gift" onClick={ctx.donate}><span className="hide-sm">Donate</span></Button>
    </>
  );

  return (
    <AppContext.Provider value={ctx}>
      <Shell variant="user" nav={nav} route={route} user={user} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} actions={actions}>
        {page}
      </Shell>
      {modal?.type === 'detail' && <PetDetailModal pet={modal.pet} onClose={close} onApply={(p) => open('apply', p)} onChat={(p) => open('chat', p)} />}
      {modal?.type === 'apply' && <ApplyModal pet={modal.pet} user={user} toast={toast} onClose={close} onSubmitted={reloadApps} />}
      {modal?.type === 'chat' && <PetChatModal pet={modal.pet} user={user} onClose={close} />}
      {modal?.type === 'donate' && <DonateModal user={user} toast={toast} onClose={close} />}
      {modal?.type === 'report' && <ReportModal user={user} onClose={close} />}
      {modal?.type === 'edit' && <AddPetModal user={user} pet={modal.pet} toast={toast} onClose={close} onSaved={reloadPets} />}
      {modal?.type === 'delete' && <DeletePetModal pet={modal.pet} toast={toast} onClose={close} onDone={reloadPets} />}
      {modal?.type === 'add' && <AddPetModal user={user} toast={toast} onClose={close} onSaved={reloadPets} title="List a pet for adoption" />}
    </AppContext.Provider>
  );
}
