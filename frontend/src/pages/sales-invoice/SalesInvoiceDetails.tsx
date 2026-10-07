import DocumentDetails from '../shared/DocumentDetails';
export default function SalesInvoiceDetails({ id }: { id: number }) {
  return <DocumentDetails kind="sales-invoices" id={id} />;
}
