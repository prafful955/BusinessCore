import DocumentDetails from '../shared/DocumentDetails';
export default function InvoiceDetails({ id }: { id: number }) {
  return <DocumentDetails kind="invoices" id={id} />;
}
