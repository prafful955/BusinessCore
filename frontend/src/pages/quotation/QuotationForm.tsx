import DocumentForm from '../shared/DocumentForm';
export default function QuotationForm({ id }: { id?: number }) {
  return <DocumentForm kind="quotations" id={id} />;
}
