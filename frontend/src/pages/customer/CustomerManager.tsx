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
export default function CustomerManager() {
  return (
    <RecordManager
      title="Customer"
      route="/customers"
      api={customerApi}
      columns={columns}
      searchText={(row) =>
        [row.code, row.name, row.invoiceName, row.company, row.email, row.phone].join(' ')
      }
      displayName={(row) => row.name}
    />
  );
}
