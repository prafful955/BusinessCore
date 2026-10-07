import { InventoryDetailsTemplate } from '../shared/InventoryTemplate';
export default function PurchaseOrderDetails({ id }: { id: number }) {
  return <InventoryDetailsTemplate kind="purchase-orders" id={id} />;
}
