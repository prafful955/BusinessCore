import DocumentDetails from '../shared/DocumentDetails';
export default function QuotationDetails({ id }: { id: number }) {
  return <DocumentDetails kind="quotations" id={id} />;
}
