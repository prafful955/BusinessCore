import { useEffect, useState, type FormEvent } from 'react';
import RecordManager from './RecordManager';
import { errorMessage } from '../business/business.api';
import {
  inventoryApis,
  inventoryNames,
  masterApis,
  stockApi,
  postInventory,
  localDate,
  type InventoryKind,
  type Inventory,
  type InventoryInput,
  type Master,
  type ProductChoice,
} from './operations.api';
export function InventoryManagerTemplate({ kind }: { kind: InventoryKind }) {
  return (
    <RecordManager
      title={inventoryNames[kind]}
      route={'/' + kind}
      api={inventoryApis[kind]}
      columns={[
        { key: 'number', label: 'Number' },
        { key: 'supplierName', label: 'Supplier' },
        { key: 'warehouseName', label: 'Warehouse' },
        { key: 'documentDate', label: 'Date' },
        { key: 'status', label: 'Status' },
        { key: 'total', label: 'Total' },
      ]}
      searchText={(r) => r.number + ' ' + r.supplierName + ' ' + r.warehouseName}
      displayName={(r) => r.number}
      deleteRecord={(r) => inventoryApis[kind].delete(r.id, r.version)}
    />
  );
}
const blank = (): InventoryInput => ({
  number: '',
  supplierName: '',
  documentDate: localDate(),
  notes: '',
  warehouseId: 0,
  destinationId: null,
  purchaseOrderId: null,
  lines: [{ productId: 0, quantity: 1, unitCost: 0 }],
});
export function InventoryFormTemplate({ kind, id }: { kind: InventoryKind; id?: number }) {
  const [draft, setDraft] = useState<InventoryInput>(blank),
    [warehouses, setWarehouses] = useState<Master[]>([]);
  const [products, setProducts] = useState<ProductChoice[]>([]),
    [orders, setOrders] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true),
    [failed, setFailed] = useState(false),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState(''),
    [reload, setReload] = useState(0),
    [posted, setPosted] = useState(false);
  const api = inventoryApis[kind],
    transfer = kind === 'stock-transfers';
  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setError('');
    Promise.all([
      masterApis.warehouses.list(),
      stockApi.products(),
      kind === 'purchases' ? inventoryApis['purchase-orders'].list() : Promise.resolve([]),
      id === undefined ? Promise.resolve(null) : api.get(id),
    ])
      .then(([w, p, o, r]) => {
        if (active) {
          setWarehouses(w);
          setProducts(p);
          setOrders(o.filter((x) => x.status === 'Ordered'));
          setDraft(r || blank());
          setPosted(!!r && r.status !== 'Draft');
        }
      })
      .catch((e) => {
        if (active) {
          setFailed(true);
          setError(errorMessage(e));
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
      const r = id === undefined ? await api.create(draft) : await api.update(id, draft);
      window.location.hash = '/' + kind + '/' + r.id;
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
          {id === undefined ? 'New' : 'Update'} {inventoryNames[kind].toLowerCase()}
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
      ) : posted ? (
        <p>
          This document is posted and cannot be edited.{' '}
          <a href={'#/' + kind + '/' + id}>View details</a>
        </p>
      ) : (
        <form onSubmit={save}>
          <fieldset disabled={busy} className="role-fieldset">
            <section className="control-card">
              <div className="business-fields">
                <label className="field">
                  <span>Number *</span>
                  <input
                    required
                    maxLength={100}
                    value={draft.number}
                    onChange={(e) => setDraft({ ...draft, number: e.target.value })}
                  />
                </label>
                {!transfer && (
                  <label className="field">
                    <span>Supplier *</span>
                    <input
                      required
                      maxLength={255}
                      value={draft.supplierName}
                      onChange={(e) => setDraft({ ...draft, supplierName: e.target.value })}
                    />
                  </label>
                )}
                <label className="field">
                  <span>Date *</span>
                  <input
                    required
                    type="date"
                    value={draft.documentDate}
                    onChange={(e) => setDraft({ ...draft, documentDate: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>{transfer ? 'Source warehouse' : 'Warehouse'} *</span>
                  <select
                    required
                    value={draft.warehouseId || ''}
                    onChange={(e) => setDraft({ ...draft, warehouseId: Number(e.target.value) })}
                  >
                    <option value="">Choose warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.parentName})
                      </option>
                    ))}
                  </select>
                </label>
                {transfer && (
                  <label className="field">
                    <span>Destination *</span>
                    <select
                      required
                      value={draft.destinationId || ''}
                      onChange={(e) =>
                        setDraft({ ...draft, destinationId: Number(e.target.value) })
                      }
                    >
                      <option value="">Choose destination</option>
                      {warehouses
                        .filter((w) => w.id !== draft.warehouseId)
                        .map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                {kind === 'purchases' && (
                  <label className="field">
                    <span>Purchase order (optional)</span>
                    <select
                      value={draft.purchaseOrderId || ''}
                      onChange={(e) => {
                        const po = orders.find((o) => o.id === Number(e.target.value));
                        setDraft(
                          po
                            ? {
                                ...draft,
                                purchaseOrderId: po.id,
                                supplierName: po.supplierName,
                                warehouseId: po.warehouseId,
                                lines: po.lines.map((l) => ({ ...l })),
                              }
                            : { ...draft, purchaseOrderId: null }
                        );
                      }}
                    >
                      <option value="">Unlinked purchase</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.number}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            </section>
            <section className="control-card">
              <h2>Product lines</h2>
              {!products.length && <p>No products are available yet.</p>}
              {!warehouses.length && (
                <p>
                  Create a <a href="#/warehouses/new">warehouse</a> before adding stock documents.
                </p>
              )}
              {draft.lines.map((line, index) => (
                <div className="business-fields" key={index}>
                  <label className="field">
                    <span>Product *</span>
                    <select
                      required
                      value={line.productId || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          lines: draft.lines.map((l, i) =>
                            i === index ? { ...l, productId: Number(e.target.value) } : l
                          ),
                        })
                      }
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
                    <span>Quantity *</span>
                    <input
                      required
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={line.quantity}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          lines: draft.lines.map((l, i) =>
                            i === index ? { ...l, quantity: Number(e.target.value) } : l
                          ),
                        })
                      }
                    />
                  </label>
                  {!transfer && (
                    <label className="field">
                      <span>Unit cost *</span>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.0001"
                        value={line.unitCost}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            lines: draft.lines.map((l, i) =>
                              i === index ? { ...l, unitCost: Number(e.target.value) } : l
                            ),
                          })
                        }
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    className="danger"
                    disabled={draft.lines.length === 1}
                    onClick={() =>
                      setDraft({ ...draft, lines: draft.lines.filter((_, i) => i !== index) })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="secondary"
                disabled={draft.lines.length >= 500}
                onClick={() =>
                  setDraft({
                    ...draft,
                    lines: [...draft.lines, { productId: 0, quantity: 1, unitCost: 0 }],
                  })
                }
              >
                + Add product
              </button>
              <label className="field">
                <span>Notes</span>
                <textarea
                  maxLength={255}
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </label>
            </section>
            <div className="toolbar">
              <button disabled={!products.length || !warehouses.length}>
                {busy ? 'Saving...' : 'Save draft'}
              </button>
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
export function InventoryDetailsTemplate({ kind, id }: { kind: InventoryKind; id: number }) {
  const [row, setRow] = useState<Inventory | null>(null),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setRow(null);
    setError('');
    inventoryApis[kind]
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
  async function post() {
    if (!row || busy) return;
    setBusy(true);
    setError('');
    try {
      setRow(await postInventory(kind, id, row.version));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header>
        <h1>{inventoryNames[kind]} details</h1>
        <a href={'#/' + kind}>Back to manager</a>
      </header>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {!row ? (
        <>
          <p role="status">Loading...</p>
          {error && <button onClick={() => setReload((x) => x + 1)}>Retry</button>}
        </>
      ) : (
        <section className="control-card">
          <h2>{row.number}</h2>
          {kind !== 'stock-transfers' && (
            <a href={'#/' + kind + '/' + id + '/print'}>Print preview</a>
          )}
          <dl className="business-details">
            {(
              [
                ['supplierName', 'Supplier'],
                ['warehouseName', 'Warehouse'],
                ['destinationName', 'Destination'],
                ['documentDate', 'Date'],
                ['status', 'Status'],
                ['version', 'Version'],
                ['total', 'Total'],
                ['notes', 'Notes'],
              ] as const
            ).map(([k, label]) => (
              <div key={k}>
                <dt>{label}</dt>
                <dd>{row[k] ?? '?'}</dd>
              </div>
            ))}
          </dl>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit cost</th>
                </tr>
              </thead>
              <tbody>
                {row.lines.map((l, i) => (
                  <tr key={i}>
                    <td>{l.productName}</td>
                    <td>{l.quantity}</td>
                    <td>{l.unitCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {row.status === 'Draft' && (
            <div className="toolbar">
              <a href={'#/' + kind + '/' + id + '/edit'}>Update draft</a>
              <button disabled={busy} onClick={post}>
                {busy
                  ? 'Posting...'
                  : kind === 'purchases'
                    ? 'Receive stock'
                    : kind === 'purchase-orders'
                      ? 'Place order'
                      : 'Post transfer'}
              </button>
            </div>
          )}
          <button className="secondary" disabled={busy} onClick={() => setReload((x) => x + 1)}>
            Refresh
          </button>
        </section>
      )}
    </>
  );
}
