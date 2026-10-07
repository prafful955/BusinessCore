import { useEffect, useState } from 'react';
import { AppGrid, type GridColumn } from '../../components/grid/AppGrid';
import { ConfirmDialog } from '../../components/dialog/Dialog';
import { errorMessage, type CrudApi } from '../business/business.api';

export default function RecordManager<T extends { id: number; status: string }, Input>({
  title,
  route,
  api,
  columns,
  searchText,
  displayName,
  deleteRecord,
}: {
  title: string;
  route: string;
  api: CrudApi<T, Input>;
  columns: GridColumn<T>[];
  searchText: (row: T) => string;
  displayName: (row: T) => string;
  deleteRecord?: (row: T) => Promise<void>;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<number>();
  const [deleting, setDeleting] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api
      .list()
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
  }, [api, reload]);
  const filtered = rows.filter(
    (row) =>
      searchText(row).toLowerCase().includes(search.toLowerCase()) &&
      (!status || row.status === status)
  );
  const chosen = filtered.find((row) => row.id === selected);
  const view = (row: T) => {
    window.location.hash = route + '/' + row.id;
  };
  const edit = (row: T) => {
    window.location.hash = route + '/' + row.id + '/edit';
  };
  const askDelete = (row: T) => {
    setDeleteError('');
    setDeleting(row);
  };
  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    setDeleteError('');
    try {
      if (deleteRecord) await deleteRecord(deleting);
      else await api.delete(deleting.id);
      setDeleting(null);
      setSelected(undefined);
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
        <div>
          <h1>{title === 'Customer' ? 'Customers' : title + ' manager'}</h1>
          <p>Manage your {title.toLowerCase()} records and information.</p>
        </div>
        <a className="button" href={'#' + route + '/new'}>
          + New {title.toLowerCase()}
        </a>
      </header>
      <section className="control-card">
        <div className="toolbar">
          <a className="button" href={'#' + route + '/new'}>
            + Add {title.toLowerCase()}
          </a>
          <button
            className="secondary"
            disabled={loading || !!error || !chosen}
            onClick={() => chosen && view(chosen)}
          >
            View
          </button>
          <button
            className="secondary"
            disabled={loading || !!error || !chosen}
            onClick={() => chosen && edit(chosen)}
          >
            Update
          </button>
          <button
            className="danger"
            disabled={loading || !!error || !chosen}
            onClick={() => chosen && askDelete(chosen)}
          >
            Delete
          </button>
          <button className="secondary" disabled={loading} onClick={() => setReload((x) => x + 1)}>
            Refresh
          </button>
        </div>
        <div className="filters">
          <label className="field">
            <span>Search</span>
            <input
              type="search"
              placeholder="Search by name, code, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {[...new Set(rows.map((row) => row.status))].sort().map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <button
            className="secondary"
            onClick={() => {
              setSearch('');
              setStatus('');
            }}
          >
            Reset filters
          </button>
        </div>
      </section>
      {loading ? (
        <p role="status">Loading...</p>
      ) : error ? (
        <p role="alert" className="notice">
          {error}
        </p>
      ) : (
        <AppGrid
          gridId={route.slice(1)}
          title={title}
          rowLabel="records"
          rows={filtered}
          columns={columns}
          selectedId={selected}
          onSelect={(row) => setSelected(row.id)}
          onView={view}
          onUpdate={edit}
          onDelete={askDelete}
        />
      )}
      {deleting && (
        <ConfirmDialog
          open
          title={'Delete ' + title.toLowerCase() + '?'}
          message={deleteError || 'Delete ' + displayName(deleting) + '?'}
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
