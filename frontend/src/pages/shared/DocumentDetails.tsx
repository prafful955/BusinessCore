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
export default function DocumentDetails({ kind, id }: { kind: DocumentKind; id: number }) {
  const [row, setRow] = useState<BusinessDocument | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const api = documentApis[kind];
  useEffect(() => {
    let active = true;
    setRow(null);
    setError('');
    api
      .get(id)
      .then((row) => {
        if (active) setRow(row);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [api, id, retry]);
  return (
    <>
      <header>
        <h1>{documentNames[kind]} details</h1>
        <a href={kind === 'sales-orders' ? '#/orders' : '#/' + kind}>Back to manager</a>
      </header>
      {error ? (
        <>
          <p role="alert" className="notice">
            {error}
          </p>
          <button onClick={() => setRetry((x) => x + 1)}>Retry</button>
        </>
      ) : !row ? (
        <p role="status">Loading...</p>
      ) : (
        <>
          <section className="control-card">
            <h2>{row.number}</h2>
            <a
              className="button"
              href={(kind === 'sales-orders' ? '#/orders' : '#/' + kind) + '/' + id + '/print'}
            >
              Print preview
            </a>
            <a href={(kind === 'sales-orders' ? '#/orders' : '#/' + kind) + '/' + id + '/edit'}>
              Update
            </a>
            <dl className="business-details">
              <div>
                <dt>Customer</dt>
                <dd>
                  <a href={'#/customers/' + row.customerId}>{row.customerName}</a>
                </dd>
              </div>
              <div>
                <dt>Invoice name</dt>
                <dd>{row.invoiceName}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{row.status}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{row.documentDate}</dd>
              </div>
              <div>
                <dt>{kind === 'quotations' ? 'Valid until' : 'Due date'}</dt>
                <dd>{row.dueDate || '?'}</dd>
              </div>
              <div>
                <dt>Notes</dt>
                <dd>{row.notes || '?'}</dd>
              </div>
            </dl>
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
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {row.lines.map((line, index) => (
                    <tr key={index}>
                      <td>{line.description}</td>
                      <td>{line.quantity}</td>
                      <td>{money(line.unitPrice, row.currency)}</td>
                      <td>{money(line.lineTotal, row.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="business-details">
              <div>
                <dt>Subtotal</dt>
                <dd>{money(row.subtotal, row.currency)}</dd>
              </div>
              <div>
                <dt>Tax ({row.taxPercent}%)</dt>
                <dd>{money(row.taxAmount, row.currency)}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>
                  <strong>{money(row.total, row.currency)}</strong>
                </dd>
              </div>
            </dl>
          </section>
        </>
      )}
    </>
  );
}
