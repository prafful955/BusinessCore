import { useEffect, useState, type FormEvent } from 'react';
import { ConfirmDialog } from '../../components/dialog/Dialog';
import { lookupApi, lookupKinds, errorMessage, type LookupValue } from '../business/business.api';

export default function LookupManager() {
  const [kind, setKind] = useState<string>('customer-status');
  const [rows, setRows] = useState<LookupValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [editing, setEditing] = useState<number>();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<LookupValue | null>(null);
  const [deleteError, setDeleteError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setRows([]);
    setEditing(undefined);
    setName('');
    lookupApi
      .listKind(kind)
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind, reload]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (editing === undefined) await lookupApi.create({ kind, name });
      else await lookupApi.update(editing, { kind, name });
      setReload((x) => x + 1);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    setDeleteError('');
    try {
      await lookupApi.delete(deleting.id);
      setDeleting(null);
      setReload((x) => x + 1);
    } catch (e) {
      setDeleteError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header>
        <h1>Lookup values</h1>
        <p>Maintain status names and dropdown choices.</p>
      </header>
      <section className="control-card">
        <label className="field">
          <span>Lookup type</span>
          <select value={kind} disabled={busy} onChange={(e) => setKind(e.target.value)}>
            {lookupKinds.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="secondary"
          disabled={busy || loading}
          onClick={() => setReload((x) => x + 1)}
        >
          Refresh
        </button>
      </section>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading...</p>
      ) : (
        <>
          <section className="control-card">
            <form onSubmit={save}>
              <label className="field">
                <span>{editing === undefined ? 'New value' : 'Update value'}</span>
                <input
                  required
                  maxLength={100}
                  value={name}
                  disabled={busy}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <div className="toolbar">
                <button disabled={busy}>{busy ? 'Saving...' : 'Save value'}</button>
                {editing !== undefined && (
                  <button
                    type="button"
                    className="secondary"
                    disabled={busy}
                    onClick={() => {
                      setEditing(undefined);
                      setName('');
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </section>
          <section className="control-card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.name}</td>
                      <td>
                        <button
                          className="secondary"
                          disabled={busy}
                          onClick={() => {
                            setEditing(row.id);
                            setName(row.name);
                          }}
                        >
                          Update
                        </button>
                        <button
                          className="danger"
                          disabled={busy}
                          onClick={() => {
                            setDeleteError('');
                            setDeleting(row);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={2}>No values yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      {deleting && (
        <ConfirmDialog
          open
          title="Delete lookup value?"
          message={deleteError || 'Delete ' + deleting.name + '?'}
          busy={busy}
          onNo={() => {
            if (!busy) setDeleting(null);
          }}
          onYes={remove}
        />
      )}
    </>
  );
}
