import { useEffect, useState, type FormEvent } from 'react';
import type { GridColumn } from '../../components/grid/AppGrid';
import RecordManager from './RecordManager';
import {
  customerApi,
  documentApis,
  documentNames,
  statusApi,
  errorMessage,
  type Customer,
  type DocumentKind,
  type DocumentInput,
  type BusinessDocument,
  type StatusValue,
} from '../business/business.api';
const money = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
const columns: GridColumn<BusinessDocument>[] = [
  { key: 'number', label: 'Number' },
  { key: 'customerName', label: 'Customer' },
  { key: 'invoiceName', label: 'Invoice name' },
  { key: 'documentDate', label: 'Date' },
  { key: 'dueDate', label: 'Due date' },
  { key: 'status', label: 'Status' },
  { key: 'total', label: 'Total', render: (row) => money(row.total, row.currency) },
];
const today = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};
const empty = (): DocumentInput => ({
  number: '',
  customerId: 0,
  statusId: 0,
  documentDate: today(),
  dueDate: '',
  notes: '',
  taxPercent: 0,
  lines: [{ description: '', quantity: 1, unitPrice: 0 }],
});
export default function DocumentForm({ kind, id }: { kind: DocumentKind; id?: number }) {
  const [draft, setDraft] = useState<DocumentInput>(empty);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statuses, setStatuses] = useState<StatusValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const api = documentApis[kind],
    title = documentNames[kind],
    route = kind === 'sales-orders' ? '/orders' : '/' + kind;
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setError('');
    Promise.all([
      customerApi.list(),
      statusApi.list(kind),
      id === undefined ? Promise.resolve(null) : api.get(id),
    ])
      .then(([customers, statuses, row]) => {
        if (!active) return;
        setCustomers(customers);
        setStatuses(statuses);
        setDraft(
          row || {
            ...empty(),
            statusId: statuses.find((s) => s.name === 'Draft')?.id || statuses[0]?.id || 0,
          }
        );
      })
      .catch((e) => {
        if (active) {
          setError(errorMessage(e));
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api, kind, id, retry]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const row = id === undefined ? await api.create(draft) : await api.update(id, draft);
      window.location.hash = route + '/' + row.id;
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }
  const customer = customers.find((c) => c.id === draft.customerId);
  const subtotal = draft.lines.reduce(
    (sum, line) => sum + Math.round(line.quantity * line.unitPrice * 100) / 100,
    0
  );
  const estimated = subtotal + Math.round(subtotal * draft.taxPercent) / 100;
  return (
    <>
      <header>
        <h1>
          {id === undefined ? 'New' : 'Update'} {title.toLowerCase()}
        </h1>
        <a href={'#' + route}>Back to manager</a>
      </header>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading...</p>
      ) : loadFailed ? (
        <button onClick={() => setRetry((x) => x + 1)}>Retry</button>
      ) : (
        <form onSubmit={save}>
          <fieldset disabled={saving} className="role-fieldset">
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
                <label className="field">
                  <span>Customer *</span>
                  <select
                    required
                    value={draft.customerId || ''}
                    onChange={(e) => setDraft({ ...draft, customerId: Number(e.target.value) })}
                  >
                    <option value="">Choose customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Status *</span>
                  <select
                    required
                    value={draft.statusId || ''}
                    onChange={(e) => setDraft({ ...draft, statusId: Number(e.target.value) })}
                  >
                    <option value="">Choose status</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
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
                  <span>{kind === 'quotations' ? 'Valid until' : 'Due date'}</span>
                  <input
                    type="date"
                    min={draft.documentDate}
                    value={draft.dueDate}
                    onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Tax (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.0001"
                    required
                    value={draft.taxPercent}
                    onChange={(e) => setDraft({ ...draft, taxPercent: Number(e.target.value) })}
                  />
                </label>
              </div>
              {customer && (
                <p>
                  Customer invoice name: <strong>{customer.invoiceName || customer.name}</strong>
                </p>
              )}
              {!customers.length && (
                <p>
                  Add a <a href="#/customers/new">customer</a> before creating a document.
                </p>
              )}
              {!statuses.length && (
                <p>
                  Add a status in <a href="#/lookup-values">lookup values</a> before saving.
                </p>
              )}
            </section>
            <section className="control-card">
              <h2>Line items</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit price</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.lines.map((line, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            aria-label={'Item ' + (index + 1) + ' description'}
                            required
                            maxLength={255}
                            value={line.description}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                lines: draft.lines.map((l, i) =>
                                  i === index ? { ...l, description: e.target.value } : l
                                ),
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            aria-label={'Item ' + (index + 1) + ' quantity'}
                            type="number"
                            required
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
                        </td>
                        <td>
                          <input
                            aria-label={'Item ' + (index + 1) + ' unit price'}
                            type="number"
                            required
                            min="0"
                            step="0.0001"
                            value={line.unitPrice}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                lines: draft.lines.map((l, i) =>
                                  i === index ? { ...l, unitPrice: Number(e.target.value) } : l
                                ),
                              })
                            }
                          />
                        </td>
                        <td>{(line.quantity * line.unitPrice).toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="danger"
                            disabled={draft.lines.length === 1}
                            onClick={() =>
                              setDraft({
                                ...draft,
                                lines: draft.lines.filter((_, i) => i !== index),
                              })
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="secondary"
                disabled={draft.lines.length >= 500}
                onClick={() =>
                  setDraft({
                    ...draft,
                    lines: [...draft.lines, { description: '', quantity: 1, unitPrice: 0 }],
                  })
                }
              >
                + Add item
              </button>
              <p>Estimated total: {estimated.toFixed(2)}</p>
              <label className="field">
                <span>Notes</span>
                <textarea
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </label>
            </section>
            <div className="toolbar">
              <button disabled={!customers.length || !statuses.length}>
                {saving ? 'Saving...' : 'Save ' + title.toLowerCase()}
              </button>
              <a href={'#' + route}>Cancel</a>
            </div>
          </fieldset>
        </form>
      )}
    </>
  );
}
