import { useEffect, useState } from 'react';
import { roleApi } from './role.api';
import { permissionModules, permissionActions, type Role, type Permission } from './role.types';
import DeleteRole from './DeleteRole';

export default function RoleDetails({ id: nRoleIdP }: { id: number }) {
  const [role, setRole] = useState<Role | null>(null);
  const [zErrorL, setError] = useState('');
  const [nRetryL, setRetry] = useState(0);
  const [bDeletingL, setDeleting] = useState(false);
  useEffect(() => {
    let bActiveL = true; setRole(null); setError('');
    roleApi.get(nRoleIdP).then(data => { if (bActiveL) setRole(data); })
      .catch(oErrorP => { if (bActiveL) setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to load role.'); });
    return () => { bActiveL = false; };
  }, [nRoleIdP, nRetryL]);
  return <><header><h1>Role details</h1></header><section className="control-card">
    <div className="toolbar"><a href="#/roles">Back to roles</a>{role && <><button onClick={() => { window.location.hash = `/roles/${nRoleIdP}/edit`; }}>Update</button><button className="danger" onClick={() => setDeleting(true)}>Delete</button></>}</div>
    {zErrorL ? <><p role="alert" className="notice">{zErrorL}</p><button onClick={() => setRetry(nValueP => nValueP + 1)}>Retry</button></> : !role ? <p role="status">Loading role...</p> : <><h2>{role.name}</h2><p>{role.permissions.length} granted permissions</p><div className="table-wrap"><table><thead><tr><th>Module</th>{permissionActions.map(action => <th key={action}>{action}</th>)}</tr></thead><tbody>{permissionModules.map(module => <tr key={module.key}><td>{module.label}</td>{permissionActions.map(action => <td key={action}>{role.permissions.includes(`${module.key}.${action}` as Permission) ? 'Allowed' : 'Denied'}</td>)}</tr>)}</tbody></table></div></>}
  </section>{role && bDeletingL && <DeleteRole role={role} onClose={() => setDeleting(false)} onDeleted={() => { window.location.hash = '/roles'; }} />}</>;
}
