import { useEffect, useState, type FormEvent } from 'react';
import { AppGrid } from '../../components/grid/AppGrid';
import { errorMessage } from '../business/business.api';
import {
  stockApi,
  masterApis,
  type Stock,
  type Master,
  type ProductChoice,
  type Movement,
} from './operations.api';
export function StockManagerTemplate() {
  const [rows, setRows] = useState<Stock[]>([]),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [reload, setReload] = useState(0),
    [search, setSearch] = useState(''),
    [selected, setSelected] = useState<number>();
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    stockApi
      .list()
      .then((r) => {
        if (active) setRows(r);
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
  }, [reload]);
  const view = (r: Stock) => {
      window.location.hash = '/stocks/' + r.id;
    },
    edit = (r: Stock) => {
      window.location.hash = '/stocks/' + r.id + '/edit';
    };
  const filtered = rows.filter((r) =>
    (r.productName + ' ' + r.warehouseName).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      <header>
        <h1>Stock manager</h1>
      </header>
      <section className="control-card">
        <div className="toolbar">
          <a href="#/stocks/new">+ Adjust stock</a>
          <button className="secondary" disabled={loading} onClick={() => setReload((x) => x + 1)}>
            Refresh
          </button>
        </div>
        <label className="field">
          <span>Search products or warehouses</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </section>
      {loading ? (
        <p role="status">Loading...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <AppGrid
          gridId="stocks"
          title="Stock"
          rowLabel="balances"
          rows={filtered}
          columns={[
            { key: 'productName', label: 'Product' },
            { key: 'warehouseName', label: 'Warehouse' },
            { key: 'quantity', label: 'On hand' },
            { key: 'version', label: 'Version' },
          ]}
          selectedId={selected}
          onSelect={(r) => setSelected(r.id)}
          onView={view}
          onUpdate={edit}
        />
      )}
    </>
  );
}
export function StockFormTemplate({ id }: { id?: number }) {
  const [products, setProducts] = useState<ProductChoice[]>([]),
    [warehouses, setWarehouses] = useState<Master[]>([]),
    [balances, setBalances] = useState<Stock[]>([]);
  const [draft, setDraft] = useState({ productId: 0, warehouseId: 0, quantity: 0, reason: '' }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [reload, setReload] = useState(0),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setError('');
    Promise.all([
      stockApi.products(),
      masterApis.warehouses.list(),
      stockApi.list(),
      id === undefined ? Promise.resolve(null) : stockApi.get(id),
    ])
      .then(([p, w, b, r]) => {
        if (active) {
          setProducts(p);
          setWarehouses(w);
          setBalances(b);
          setDraft({
            productId: r?.productId || 0,
            warehouseId: r?.warehouseId || 0,
            quantity: 0,
            reason: '',
          });
        }
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
  }, [id, reload]);
  const existing = balances.find(
    (b) => b.productId === draft.productId && b.warehouseId === draft.warehouseId
  );
  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const r = await stockApi.adjust({ ...draft, version: existing?.version });
      window.location.hash = '/stocks/' + r.id;
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header>
        <h1>Stock adjustment</h1>
        <a href="#/stocks">Back to stock</a>
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
                <span>Product *</span>
                <select
                  required
                  disabled={id !== undefined}
                  value={draft.productId || ''}
                  onChange={(e) => setDraft({ ...draft, productId: Number(e.target.value) })}
                >
                  <option value="">Choose product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Warehouse *</span>
                <select
                  required
                  disabled={id !== undefined}
                  value={draft.warehouseId || ''}
                  onChange={(e) => setDraft({ ...draft, warehouseId: Number(e.target.value) })}
                >
                  <option value="">Choose warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <p>
                Current stock: {existing?.quantity || 0}. Use a positive quantity to add stock or a
                negative quantity to remove it.
              </p>
              <label className="field">
                <span>Quantity change *</span>
                <input
                  required
                  type="number"
                  step="0.001"
                  value={draft.quantity}
                  onChange={(e) => setDraft({ ...draft, quantity: Number(e.target.value) })}
                />
              </label>
              <label className="field">
                <span>Reason *</span>
                <input
                  required
                  maxLength={255}
                  value={draft.reason}
                  onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
                />
              </label>
            </section>
            <div className="toolbar">
              <button disabled={draft.quantity === 0 || !products.length || !warehouses.length}>
                {busy ? 'Saving...' : 'Record adjustment'}
              </button>
              <button type="button" className="secondary" onClick={() => setReload((x) => x + 1)}>
                Reload latest
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </>
  );
}
export function StockDetailsTemplate({ id }: { id: number }) {
  const [row, setRow] = useState<Stock | null>(null),
    [movements, setMovements] = useState<Movement[]>([]),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setRow(null);
    setError('');
    Promise.all([stockApi.get(id), stockApi.movements(id)])
      .then(([r, m]) => {
        if (active) {
          setRow(r);
          setMovements(m);
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [id, reload]);
  return (
    <>
      <header>
        <h1>Stock details</h1>
        <a href="#/stocks">Back to manager</a>
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
          <h2>{row.productName}</h2>
          <p>
            {row.warehouseName}: {row.quantity} on hand
          </p>
          <p>Version {row.version}</p>
          <a href={'#/stocks/' + id + '/edit'}>Adjust stock</a>
          <h3>Movement history</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Change</th>
                  <th>Reason</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.occurredAt).toLocaleString()}</td>
                    <td>{m.quantity}</td>
                    <td>{m.reason}</td>
                    <td>
                      {m.source}
                      {m.sourceId ? ' #' + m.sourceId : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="secondary" onClick={() => setReload((x) => x + 1)}>
            Refresh
          </button>
        </section>
      )}
    </>
  );
}
