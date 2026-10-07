import { apiRequest } from '../../api/client';

export type StatusValue = { id: number; name: string };
export type CustomerInput = {
  code: string;
  name: string;
  invoiceName: string;
  company: string;
  email: string | null;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  taxNumber: string;
  notes: string;
  statusId: number;
};
export type Customer = CustomerInput & { id: number; status: string };
export type DocumentKind = 'sales-orders' | 'quotations' | 'invoices' | 'sales-invoices';
export type LineInput = { description: string; quantity: number; unitPrice: number };
export type DocumentInput = {
  number: string;
  customerId: number;
  statusId: number;
  documentDate: string;
  dueDate: string;
  notes: string;
  taxPercent: number;
  lines: LineInput[];
};
export type BusinessDocument = Omit<DocumentInput, 'lines'> & {
  id: number;
  kind: DocumentKind;
  customerName: string;
  billingAddress: string | null;
  invoiceName: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  createdAt: string;
  lines: (LineInput & { lineTotal: number })[];
};
export type LookupValue = StatusValue & { kind: string };
export type CrudApi<T, Input> = {
  list: () => Promise<T[]>;
  get: (id: number) => Promise<T>;
  create: (input: Input) => Promise<T>;
  update: (id: number, input: Input) => Promise<T>;
  delete: (id: number) => Promise<void>;
};
function crud<T, Input>(path: string): CrudApi<T, Input> {
  return {
    list: () => apiRequest<T[]>(path),
    get: (id) => apiRequest<T>(path + '/' + id),
    create: (input) => apiRequest<T>(path, { method: 'POST', body: JSON.stringify(input) }),
    update: (id, input) =>
      apiRequest<T>(path + '/' + id, { method: 'PUT', body: JSON.stringify(input) }),
    delete: (id) => apiRequest<void>(path + '/' + id, { method: 'DELETE' }),
  };
}
export const customerApi = crud<Customer, CustomerInput>('/customers');
export const documentApis: Record<DocumentKind, CrudApi<BusinessDocument, DocumentInput>> = {
  'sales-orders': crud('/sales-orders'),
  quotations: crud('/quotations'),
  invoices: crud('/invoices'),
  'sales-invoices': crud('/sales-invoices'),
};
export const documentNames: Record<DocumentKind, string> = {
  'sales-orders': 'Order',
  quotations: 'Quotation',
  invoices: 'Invoice',
  'sales-invoices': 'Sales invoice',
};
export const statusApi = {
  list: (scope: string) =>
    apiRequest<StatusValue[]>('/statuses?scope=' + encodeURIComponent(scope)),
};
export const lookupKinds = [
  ['order-status', 'Order statuses'],
  ['customer-status', 'Customer statuses'],
  ['quotation-status', 'Quotation statuses'],
  ['invoice-status', 'Invoice statuses'],
  ['sales-invoice-status', 'Sales invoice statuses'],
  ['departments', 'Departments'],
  ['locations', 'Locations'],
  ['cash-registers', 'Cash registers'],
  ['email-accounts', 'Email accounts'],
  ['warehouses', 'Warehouses'],
  ['work-shifts', 'Work shifts'],
  ['holiday-schedules', 'Holiday schedules'],
] as const;
export const lookupApi = {
  ...crud<LookupValue, { kind: string; name: string }>('/lookup-values'),
  listKind: (kind: string) =>
    apiRequest<LookupValue[]>('/lookup-values?kind=' + encodeURIComponent(kind)),
};
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'The request could not be completed.';
