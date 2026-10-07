import { useEffect, useState, type FormEvent } from 'react';
import RecordManager from './RecordManager';
import { errorMessage } from '../business/business.api';
import {
  masterApis,
  masterNames,
  type MasterKind,
  type Master,
  type MasterInput,
} from './operations.api';
export function MasterManagerTemplate({ kind }: { kind: MasterKind }) {
  return (
    <RecordManager
      title={masterNames[kind]}
      route={'/' + kind}
      api={masterApis[kind]}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'parentName', label: 'Parent' },
        { key: 'status', label: 'Status' },
        { key: 'version', label: 'Version' },
      ]}
      searchText={(r) => r.code + ' ' + r.name + ' ' + r.parentName}
      displayName={(r) => r.name}
      deleteRecord={(r) => masterApis[kind].delete(r.id, r.version)}
    />
  );
}
export function MasterFormTemplate({ kind, id }: { kind: MasterKind; id?: number }) {
  const [draft, setDraft] = useState<MasterInput>({
    code: '',
    name: '',
    address: '',
    status: 'Active',
    parentId: null,
  });
  const [parents, setParents] = useState<Master[]>([]),
    [loading, setLoading] = useState(true),
    [failed, setFailed] = useState(false);
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [reload, setReload] = useState(0);
  const api = masterApis[kind];
  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setError('');
    const choices =
      kind === 'companies'
        ? Promise.resolve([])
        : masterApis[kind === 'warehouses' ? 'business-locations' : 'companies'].list();
    Promise.all([choices, id === undefined ? Promise.resolve(null) : api.get(id)])
      .then(([p, r]) => {
        if (!active) return;
        setParents(p);
        setDraft(r || { code: '', name: '', address: '', status: 'Active', parentId: null });
      })
      .catch((e) => {
        if (active) {
          setError(errorMessage(e));
          setFailed(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api, kind, id, reload]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const row = id === undefined ? await api.create(draft) : await api.update(id, draft);
      window.location.hash = '/' + kind + '/' + row.id;
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header>
        <h1>
          {id === undefined ? 'New' : 'Update'} {masterNames[kind].toLowerCase()}
        </h1>
        <a href={'#/' + kind}>Back to manager</a>
      </header>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading...</p>
      ) : failed ? (
        <button onClick={() => setReload((x) => x + 1)}>Retry</button>
      ) : (
        <form onSubmit={save}>
          <fieldset disabled={busy} className="role-fieldset">
            <section className="control-card">
              <label className="field">
                <span>Code *</span>
                <input
                  required
                  maxLength={100}
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Name *</span>
                <input
                  required
                  maxLength={255}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              {kind !== 'companies' && (
                <label className="field">
                  <span>{kind === 'warehouses' ? 'Business location' : 'Company'} *</span>
                  <select
                    required
                    disabled={id !== undefined}
                    value={draft.parentId || ''}
                    onChange={(e) => setDraft({ ...draft, parentId: Number(e.target.value) })}
                  >
                    <option value="">Choose parent</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {kind !== 'companies' && !parents.length && (
                <p>
                  Create a{' '}
                  <a href={kind === 'warehouses' ? '#/business-locations/new' : '#/companies/new'}>
                    {kind === 'warehouses' ? 'business location' : 'company'}
                  </a>{' '}
                  first.
                </p>
              )}
              <label className="field">
                <span>Address</span>
                <textarea
                  maxLength={255}
                  value={draft.address}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
              {draft.version !== undefined && <p>Version {draft.version}</p>}
            </section>
            <div className="toolbar">
              <button>{busy ? 'Saving...' : 'Save'}</button>
              <a href={'#/' + kind}>Cancel</a>
              {id !== undefined && (
                <button type="button" className="secondary" onClick={() => setReload((x) => x + 1)}>
                  Reload latest
                </button>
              )}
            </div>
          </fieldset>
        </form>
      )}
    </>
  );
}
export function MasterDetailsTemplate({ kind, id }: { kind: MasterKind; id: number }) {
  const [row, setRow] = useState<Master | null>(null),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setRow(null);
    setError('');
    masterApis[kind]
      .get(id)
      .then((r) => {
        if (active) setRow(r);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [kind, id, reload]);
  return (
    <>
      <header>
        <h1>{masterNames[kind]} details</h1>
        <a href={'#/' + kind}>Back to manager</a>
      </header>
      {error ? (
        <>
          <p role="alert">{error}</p>
          <button onClick={() => setReload((x) => x + 1)}>Retry</button>
        </>
      ) : !row ? (
        <p role="status">Loading...</p>
      ) : (
        <section className="control-card">
          <h2>{row.name}</h2>
          <a href={'#/' + kind + '/' + id + '/edit'}>Update</a>
          <dl className="business-details">
            {(['code', 'address', 'parentName', 'status', 'version'] as const).map((k) => (
              <div key={k}>
                <dt>{k === 'parentName' ? 'Parent' : k}</dt>
                <dd>{row[k] ?? '?'}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}
