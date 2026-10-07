import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AppGrid } from '../../components/grid/AppGrid';
import { ConfirmDialog } from '../../components/dialog/Dialog';
import { lookupApi, lookupKinds, errorMessage, type LookupValue } from '../business/business.api';

export default function LookupManager() {
  const [nSelectedIdL, setSelectedId] = useState<number>();
  const [oViewingL, setViewing] = useState<LookupValue | null>(null);
  const oDialogRefL = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (oViewingL && !oDialogRefL.current?.open) oDialogRefL.current?.showModal();
    if (!oViewingL && oDialogRefL.current?.open) oDialogRefL.current.close();
  }, [oViewingL]);
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
    setSelectedId(undefined);
    setViewing(null);
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
          <AppGrid
            gridId="lookup-grid"
            title="Lookup values"
            rowLabel="values"
            rows={rows}
            columns={[{ key: 'name', label: 'Name' }]}
            selectedId={nSelectedIdL}
            onSelect={(oRowP) => setSelectedId(oRowP.id)}
            actionsDisabled={busy}
            onView={setViewing}
            onUpdate={(oRowP) => {
              setEditing(oRowP.id);
              setName(oRowP.name);
            }}
            onDelete={(oRowP) => {
              setDeleteError('');
              setDeleting(oRowP);
            }}
            emptyMessage="No values yet."
          />
        </>
      )}
      <dialog
        ref={oDialogRefL}
        className="dialog"
        aria-labelledby="lookup-view-title"
        onCancel={(oEventP) => {
          oEventP.preventDefault();
          setViewing(null);
        }}
      >
        <h3 id="lookup-view-title">Lookup value details</h3>
        <dl>
          <dt>ID</dt>
          <dd>{oViewingL?.id}</dd>
          <dt>Type</dt>
          <dd>{lookupKinds.find(([zKeyP]) => zKeyP === kind)?.[1] || kind}</dd>
          <dt>Name</dt>
          <dd>{oViewingL?.name}</dd>
        </dl>
        <button type="button" className="secondary" onClick={() => setViewing(null)}>
          Close
        </button>
      </dialog>
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
