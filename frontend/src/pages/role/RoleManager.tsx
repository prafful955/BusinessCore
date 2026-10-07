import { useEffect, useState } from 'react';
import { roleApi } from './role.api';
import type { Role } from './role.types';
import DeleteRole from './DeleteRole';
import { AppGrid } from '../../components/grid/AppGrid';

export default function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [bLoadingL, setLoading] = useState(true);
  const [zErrorL, setError] = useState('');
  const [nRetryL, setRetry] = useState(0);
  const [zSearchL, setSearch] = useState('');
  const [nSelectedIdL, setSelectedId] = useState<number>();
  const [oDeletingL, setDeleting] = useState<Role | null>(null);
  const aFilteredL = roles.filter((role) =>
    role.name.toLowerCase().includes(zSearchL.toLowerCase())
  );
  const oSelectedL =
    !bLoadingL && !zErrorL ? aFilteredL.find((role) => role.id === nSelectedIdL) : undefined;
  useEffect(() => {
    let bActiveL = true;
    setLoading(true);
    setError('');
    roleApi
      .list()
      .then((data) => {
        if (bActiveL) setRoles(data);
      })
      .catch((oErrorP) => {
        if (bActiveL)
          setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to load roles.');
      })
      .finally(() => {
        if (bActiveL) setLoading(false);
      });
    return () => {
      bActiveL = false;
    };
  }, [nRetryL]);
  return (
    <>
      <header>
        <div>
          <h1>Role manager</h1>
          <p>Manage user roles and access permissions.</p>
        </div>
      </header>
      <section className="control-card">
        <div className="toolbar" aria-label="Role actions">
          <button
            onClick={() => {
              window.location.hash = '/roles/new';
            }}
          >
            + New role
          </button>
          <button
            className="secondary"
            disabled={!oSelectedL}
            onClick={() => {
              if (oSelectedL) window.location.hash = `/roles/${oSelectedL.id}`;
            }}
          >
            View
          </button>
          <button
            className="secondary"
            disabled={!oSelectedL}
            onClick={() => {
              if (oSelectedL) window.location.hash = `/roles/${oSelectedL.id}/edit`;
            }}
          >
            Update
          </button>
          <button
            className="danger"
            disabled={!oSelectedL}
            onClick={() => setDeleting(oSelectedL || null)}
          >
            Delete
          </button>
          <button
            className="secondary"
            disabled={bLoadingL}
            onClick={() => setRetry((nValueP) => nValueP + 1)}
          >
            Refresh
          </button>
        </div>
        <label className="field">
          <span>Search roles</span>
          <input
            type="search"
            value={zSearchL}
            onChange={(oEventP) => setSearch(oEventP.target.value)}
            placeholder="Role name"
          />
        </label>
      </section>
      {bLoadingL ? (
        <p role="status">Loading roles...</p>
      ) : zErrorL ? (
        <p role="alert" className="notice">
          {zErrorL}
        </p>
      ) : (
        <AppGrid
          gridId="role-grid"
          title="Roles"
          rowLabel="roles"
          rows={aFilteredL}
          columns={[
            { key: 'name', label: 'Name' },
            {
              key: 'permissions',
              label: 'Granted permissions',
              render: (oRoleP) => oRoleP.permissions.length,
            },
          ]}
          selectedId={nSelectedIdL}
          onSelect={(oRoleP) => setSelectedId(oRoleP.id)}
          onView={(oRoleP) => {
            window.location.hash = `/roles/${oRoleP.id}`;
          }}
          onUpdate={(oRoleP) => {
            window.location.hash = `/roles/${oRoleP.id}/edit`;
          }}
          onDelete={setDeleting}
          emptyMessage={
            roles.length ? 'No roles match your search.' : 'No roles yet. Create your first role.'
          }
        />
      )}
      {oDeletingL && (
        <DeleteRole
          role={oDeletingL}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            setSelectedId(undefined);
            setRetry((nValueP) => nValueP + 1);
          }}
        />
      )}
    </>
  );
}
