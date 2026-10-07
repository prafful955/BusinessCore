import DocumentForm from '../shared/DocumentForm';
export default function OrderForm({ id }: { id?: number }) {
  return <DocumentForm kind="sales-orders" id={id} />;
}
