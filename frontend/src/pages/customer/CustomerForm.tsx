import { customerApi } from './customer.api';
import { useEffect, useState, type FormEvent } from 'react';
import type { GridColumn } from '../../components/grid/AppGrid';
import RecordManager from '../shared/RecordManager';
import {
  statusApi,
  errorMessage,
  type Customer,
  type CustomerInput,
  type StatusValue,
} from '../business/business.api';

const columns: GridColumn<Customer>[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Customer' },
  { key: 'invoiceName', label: 'Invoice name' },
  { key: 'email', label: 'Email', render: (row) => row.email || '?' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
];
const empty: CustomerInput = {
  code: '',
  name: '',
  invoiceName: '',
  company: '',
  email: '',
  phone: '',
  streetAddress: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  taxNumber: '',
  notes: '',
  statusId: 0,
};
const fields: {
  key: keyof Omit<CustomerInput, 'statusId' | 'notes'>;
  label: string;
  type?: string;
  required?: boolean;
}[] = [
  { key: 'code', label: 'Customer code', required: true },
  { key: 'name', label: 'Customer name', required: true },
  { key: 'invoiceName', label: 'Name on invoices' },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'streetAddress', label: 'Street address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'zipCode', label: 'Postal code' },
  { key: 'taxNumber', label: 'Tax number' },
];
export default function CustomerForm({ id }: { id?: number }) {
  const [draft, setDraft] = useState<CustomerInput>({ ...empty });
  const [statuses, setStatuses] = useState<StatusValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setError('');
    Promise.all([
      statusApi.list('customers'),
      id === undefined ? Promise.resolve(null) : customerApi.get(id),
    ])
      .then(([values, row]) => {
        if (!active) return;
        setStatuses(values);
        setDraft(
          row
            ? { ...row, email: row.email || '' }
            : {
                ...empty,
                statusId: values.find((v) => v.name === 'Active')?.id || values[0]?.id || 0,
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
  }, [id, retry]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const row =
        id === undefined ? await customerApi.create(draft) : await customerApi.update(id, draft);
      window.location.hash = '/customers/' + row.id;
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <header>
        <h1>{id === undefined ? 'New customer' : 'Update customer'}</h1>
        <a href="#/customers">Back to customers</a>
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
                {fields.map((field) => (
                  <label className="field" key={field.key}>
                    <span>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </span>
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      maxLength={255}
                      value={draft[field.key] || ''}
                      onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                    />
                  </label>
                ))}
                <label className="field">
                  <span>Status *</span>
                  <select
                    required
                    value={draft.statusId || ''}
                    onChange={(e) => setDraft({ ...draft, statusId: Number(e.target.value) })}
                  >
                    <option value="">Choose status</option>
                    {statuses.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Notes</span>
                <textarea
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </label>
              <p>Leave the invoice name empty to use the customer name on new documents.</p>
              {!statuses.length && (
                <p className="notice">
                  Add a customer status in <a href="#/lookup-values">lookup values</a> before
                  saving.
                </p>
              )}
            </section>
            <div className="toolbar">
              <button disabled={!statuses.length}>{saving ? 'Saving...' : 'Save customer'}</button>
              <a href="#/customers">Cancel</a>
            </div>
          </fieldset>
        </form>
      )}
    </>
  );
}
