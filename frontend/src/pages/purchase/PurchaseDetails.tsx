import { InventoryDetailsTemplate } from '../shared/InventoryTemplate';
export default function PurchaseDetails({ id }: { id: number }) {
  return <InventoryDetailsTemplate kind="purchases" id={id} />;
}
