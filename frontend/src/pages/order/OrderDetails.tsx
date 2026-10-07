import DocumentDetails from '../shared/DocumentDetails';
export default function OrderDetails({ id }: { id: number }) {
  return <DocumentDetails kind="sales-orders" id={id} />;
}
