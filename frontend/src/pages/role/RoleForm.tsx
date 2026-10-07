import { useEffect, useState, type FormEvent } from 'react';
import PermissionTree from './PermissionTree';
import { roleApi } from './role.api';
import type { RoleInput } from './role.types';

export default function RoleForm({ id: nRoleIdP }: { id?: number }) {
  const [oDraftL, setDraft] = useState<RoleInput>({ name: '', permissions: [] });
  const [bLoadingL, setLoading] = useState(nRoleIdP !== undefined);
  const [bLoadFailedL, setLoadFailed] = useState(false);
  const [bSavingL, setSaving] = useState(false);
  const [zErrorL, setError] = useState('');
  const [nRetryL, setRetry] = useState(0);
  useEffect(() => {
    if (nRoleIdP === undefined) return;
    let bActiveL = true; setLoading(true); setError(''); setLoadFailed(false);
    roleApi.get(nRoleIdP).then(oRoleP => { if (bActiveL) setDraft({ name: oRoleP.name, permissions: oRoleP.permissions }); })
      .catch(oErrorP => { if (bActiveL) { setLoadFailed(true); setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to load role.'); } })
      .finally(() => { if (bActiveL) setLoading(false); });
    return () => { bActiveL = false; };
  }, [nRoleIdP, nRetryL]);
  async function save(oEventP: FormEvent) {
    oEventP.preventDefault(); if (bSavingL) return;
    if (!oDraftL.name.trim()) { setError('Enter a role name.'); return; }
    setSaving(true); setError('');
    try { const oDataL = { ...oDraftL, name: oDraftL.name.trim() }; if (nRoleIdP === undefined) await roleApi.create(oDataL); else await roleApi.update(nRoleIdP, oDataL); window.location.hash = '/roles'; }
    catch (oErrorP) { setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to save role.'); }
    finally { setSaving(false); }
  }
  return <><header><h1>{nRoleIdP === undefined ? 'New User Role' : 'Update User Role'}</h1><a href="#/roles">Back to roles</a></header>
    <section className="control-card"><h2>Hints</h2><p>Select a module to grant all its actions. Expand it to choose individual actions.</p><p>Unchecking a module removes all its access. New roles start with no access.</p></section>
    {zErrorL && <p className="notice" role="alert">{zErrorL}</p>}
    {bLoadingL ? <p role="status">Loading role...</p> : bLoadFailedL ? <button onClick={() => setRetry(nValueP => nValueP + 1)}>Retry</button> : <form onSubmit={save}><fieldset disabled={bSavingL} className="role-fieldset">
      <section className="control-card"><label className="field"><span>Name *</span><input required maxLength={100} value={oDraftL.name} onChange={oEventP => setDraft({ ...oDraftL, name: oEventP.target.value })} placeholder="For example: Sales manager" /></label></section>
      <PermissionTree value={oDraftL.permissions} onChange={aPermissionsP => setDraft({ ...oDraftL, permissions: aPermissionsP })} />
      <div className="toolbar form-actions"><button type="submit">{bSavingL ? 'Saving...' : 'Save role'}</button><button type="button" className="secondary" onClick={() => { window.location.hash = '/roles'; }}>Cancel</button></div>
    </fieldset></form>}
  </>;
}
