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
export default function CustomerDetails({ id }: { id: number }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setCustomer(null);
    setError('');
    customerApi
      .get(id)
      .then((row) => {
        if (active) setCustomer(row);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [id, retry]);
  return (
    <>
      <header>
        <h1>Customer details</h1>
        <a href="#/customers">Back to customers</a>
      </header>
      {error ? (
        <>
          <p role="alert" className="notice">
            {error}
          </p>
          <button onClick={() => setRetry((x) => x + 1)}>Retry</button>
        </>
      ) : !customer ? (
        <p role="status">Loading...</p>
      ) : (
        <section className="control-card">
          <h2>{customer.name}</h2>
          <a href={'#/customers/' + id + '/edit'}>Update customer</a>
          <dl className="business-details">
            {fields.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{customer[field.key] || '?'}</dd>
              </div>
            ))}
            <div>
              <dt>Status</dt>
              <dd>{customer.status}</dd>
            </div>
            <div>
              <dt>Notes</dt>
              <dd>{customer.notes || '?'}</dd>
            </div>
          </dl>
        </section>
      )}
    </>
  );
}
