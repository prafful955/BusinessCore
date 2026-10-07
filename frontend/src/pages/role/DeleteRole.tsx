import { useState } from 'react';
import { ConfirmDialog } from '../../components/dialog/Dialog';
import { roleApi } from './role.api';
import type { Role } from './role.types';

export default function DeleteRole({ role, onClose, onDeleted }: { role: Role; onClose: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const [zErrorL, setError] = useState('');
  async function remove() {
    if (busy) return;
    setBusy(true); setError('');
    try { await roleApi.delete(role.id); onDeleted(); }
    catch (oErrorP) { setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to delete role.'); }
    finally { setBusy(false); }
  }
  return <ConfirmDialog open title="Delete role?" message={zErrorL || (busy ? 'Deleting role...' : `Delete ${role.name}? This action cannot be undone.`)} busy={busy} onNo={() => { if (!busy) onClose(); }} onYes={remove} />;
}
