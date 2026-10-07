import { InventoryFormTemplate } from '../shared/InventoryTemplate';
export default function PurchaseOrderForm({ id }: { id?: number }) {
  return <InventoryFormTemplate kind="purchase-orders" id={id} />;
}
