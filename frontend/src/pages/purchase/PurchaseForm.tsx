import { InventoryFormTemplate } from '../shared/InventoryTemplate';
export default function PurchaseForm({ id }: { id?: number }) {
  return <InventoryFormTemplate kind="purchases" id={id} />;
}
