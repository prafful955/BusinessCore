import DocumentForm from '../shared/DocumentForm';
export default function SalesInvoiceForm({ id }: { id?: number }) {
  return <DocumentForm kind="sales-invoices" id={id} />;
}
