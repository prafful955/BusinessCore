import { useEffect, useState } from 'react';
import { roleApi } from './role.api';
import type { Role } from './role.types';
import DeleteRole from './DeleteRole';

export default function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [bLoadingL, setLoading] = useState(true);
  const [zErrorL, setError] = useState('');
  const [nRetryL, setRetry] = useState(0);
  const [zSearchL, setSearch] = useState('');
  const [nSelectedIdL, setSelectedId] = useState<number>();
  const [oDeletingL, setDeleting] = useState<Role | null>(null);
  const aFilteredL = roles.filter(role => role.name.toLowerCase().includes(zSearchL.toLowerCase()));
  const oSelectedL = !bLoadingL && !zErrorL ? aFilteredL.find(role => role.id === nSelectedIdL) : undefined;
  useEffect(() => {
    let bActiveL = true; setLoading(true); setError('');
    roleApi.list().then(data => { if (bActiveL) setRoles(data); })
      .catch(oErrorP => { if (bActiveL) setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to load roles.'); })
      .finally(() => { if (bActiveL) setLoading(false); });
    return () => { bActiveL = false; };
  }, [nRetryL]);
  return <><header><div><h1>Role manager</h1><p>Manage user roles and access permissions.</p></div></header>
    <section className="control-card"><div className="toolbar" aria-label="Role actions">
      <button onClick={() => { window.location.hash = '/roles/new'; }}>+ New role</button>
      <button className="secondary" disabled={!oSelectedL} onClick={() => { if (oSelectedL) window.location.hash = `/roles/${oSelectedL.id}`; }}>View</button>
      <button className="secondary" disabled={!oSelectedL} onClick={() => { if (oSelectedL) window.location.hash = `/roles/${oSelectedL.id}/edit`; }}>Update</button>
      <button className="danger" disabled={!oSelectedL} onClick={() => setDeleting(oSelectedL || null)}>Delete</button>
      <button className="secondary" disabled={bLoadingL} onClick={() => setRetry(nValueP => nValueP + 1)}>Refresh</button>
    </div><label className="field"><span>Search roles</span><input type="search" value={zSearchL} onChange={oEventP => setSearch(oEventP.target.value)} placeholder="Role name" /></label></section>
    <section className="grid-card">
      {bLoadingL ? <p role="status">Loading roles...</p> : zErrorL ? <p role="alert" className="notice">{zErrorL}</p> : <div className="table-wrap"><table><thead><tr><th>Select</th><th>Name</th><th>Granted permissions</th><th>Actions</th></tr></thead><tbody>{aFilteredL.map(role => <tr key={role.id} className={nSelectedIdL === role.id ? 'selected' : ''}><td><input type="radio" name="role-selection" aria-label={`Select ${role.name}`} checked={nSelectedIdL === role.id} onChange={() => setSelectedId(role.id)} /></td><td>{role.name}</td><td>{role.permissions.length}</td><td><div className="toolbar" style={{ margin: 0 }}><a href={`#/roles/${role.id}`}>View</a><a href={`#/roles/${role.id}/edit`}>Update</a><button className="danger" onClick={() => setDeleting(role)}>Delete</button></div></td></tr>)}{!aFilteredL.length && <tr><td colSpan={4} className="empty">{roles.length ? 'No roles match your search.' : 'No roles yet. Create your first role.'}</td></tr>}</tbody></table></div>}
    </section>{oDeletingL && <DeleteRole role={oDeletingL} onClose={() => setDeleting(null)} onDeleted={() => { setDeleting(null); setSelectedId(undefined); setRetry(nValueP => nValueP + 1); }} />}</>;
}
