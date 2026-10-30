import React, { useCallback, useEffect, useState } from 'react';
import Shell from '../components/Shell.jsx';
import { Button } from '../components/ui.jsx';
import AddPetModal from '../components/AddPetModal.jsx';
import DeletePetModal from '../components/DeletePetModal.jsx';
import PetDetailModal from '../components/PetDetailModal.jsx';
import { AppContext } from '../context.js';
import { getJson } from '../api.js';

import Overview from '../pages/admin/Overview.jsx';
import PetsAdmin from '../pages/admin/PetsAdmin.jsx';
import ApplicationsAdmin from '../pages/admin/ApplicationsAdmin.jsx';
import UsersAdmin from '../pages/admin/UsersAdmin.jsx';
import ReportsAdmin from '../pages/admin/ReportsAdmin.jsx';
import DonationsAdmin from '../pages/admin/DonationsAdmin.jsx';
import MessagesAdmin from '../pages/admin/MessagesAdmin.jsx';
import SettingsAdmin from '../pages/admin/SettingsAdmin.jsx';

export default function AdminLayout({ route, user, pets, apps, petsLoading, petsError, reloadPets, reloadApps, toast, onLogout, theme, toggleTheme }) {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [donations, setDonations] = useState([]);
  const [modal, setModal] = useState(null);

  const loadAll = useCallback(() => {
    getJson('/users').then((d) => Array.isArray(d) && setUsers(d)).catch(() => {});
    getJson('/reports').then((d) => Array.isArray(d) && setReports(d)).catch(() => {});
    getJson('/donations').then((d) => Array.isArray(d) && setDonations(d)).catch(() => {});
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  const ctx = {
    user, pets, apps, petsLoading, petsError, users, reports, donations, toast, theme, toggleTheme,
    reloadPets, reloadApps, reloadReports: loadAll, reloadAll: () => { loadAll(); reloadPets(); reloadApps(); },
    addPet: () => setModal({ type: 'add' }), editPet: (p) => setModal({ type: 'edit', pet: p }), deletePet: (p) => setModal({ type: 'delete', pet: p }), viewPet: (p) => setModal({ type: 'detail', pet: p }),
  };

  const path = route.replace(/^\/admin/, '') || '/';
  const pendingApps = apps.filter((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW').length;
  const openReports = reports.filter((r) => r.status === 'REPORTED').length;
  const nav = [
    { to: '/admin', label: 'Overview', icon: 'grid' },
    { to: '/admin/pets', label: 'Pet Management', icon: 'paw' },
    { to: '/admin/applications', label: 'Applications', icon: 'file', badge: pendingApps },
    { to: '/admin/users', label: 'Users', icon: 'users' },
    { to: '/admin/reports', label: 'Rescue Reports', icon: 'alert', badge: openReports },
    { to: '/admin/donations', label: 'Donations', icon: 'gift' },
    { to: '/admin/messages', label: 'Messages', icon: 'message' },
    { to: '/admin/settings', label: 'Settings', icon: 'user' },
  ];

  let page;
  if (path.startsWith('/pets')) page = <PetsAdmin />;
  else if (path.startsWith('/applications')) page = <ApplicationsAdmin />;
  else if (path.startsWith('/users')) page = <UsersAdmin />;
  else if (path.startsWith('/reports')) page = <ReportsAdmin />;
  else if (path.startsWith('/donations')) page = <DonationsAdmin />;
  else if (path.startsWith('/messages')) page = <MessagesAdmin route={path} />;
  else if (path.startsWith('/settings')) page = <SettingsAdmin />;
  else page = <Overview />;

  return (
    <AppContext.Provider value={ctx}>
      <Shell variant="admin" nav={nav} route={route.startsWith('/admin') ? route : '/admin'} user={user} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme}
        actions={<Button size="sm" icon="plus" onClick={ctx.addPet}><span className="hide-sm">Add pet</span></Button>}>
        {page}
      </Shell>
      {modal?.type === 'add' && <AddPetModal user={user} toast={toast} onClose={() => setModal(null)} onSaved={reloadPets} />}
      {modal?.type === 'edit' && <AddPetModal user={user} pet={modal.pet} toast={toast} onClose={() => setModal(null)} onSaved={reloadPets} />}
      {modal?.type === 'delete' && <DeletePetModal pet={modal.pet} toast={toast} onClose={() => setModal(null)} onDone={reloadPets} />}
      {modal?.type === 'detail' && <PetDetailModal pet={modal.pet} onClose={() => setModal(null)} />}
    </AppContext.Provider>
  );
}
