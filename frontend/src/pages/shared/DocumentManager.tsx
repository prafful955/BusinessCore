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
export default function DocumentManager({ kind }: { kind: DocumentKind }) {
  return (
    <RecordManager
      title={documentNames[kind]}
      route={kind === 'sales-orders' ? '/orders' : '/' + kind}
      api={documentApis[kind]}
      columns={columns}
      searchText={(row) => [row.number, row.customerName, row.invoiceName, row.status].join(' ')}
      displayName={(row) => row.number}
    />
  );
}
