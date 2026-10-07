import { InventoryFormTemplate } from '../shared/InventoryTemplate';
export default function StockTransferForm({ id }: { id?: number }) {
  return <InventoryFormTemplate kind="stock-transfers" id={id} />;
}
