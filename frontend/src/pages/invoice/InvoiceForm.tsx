import DocumentForm from '../shared/DocumentForm';
export default function InvoiceForm({ id }: { id?: number }) {
  return <DocumentForm kind="invoices" id={id} />;
}
