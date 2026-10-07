import { InventoryDetailsTemplate } from '../shared/InventoryTemplate';
export default function StockTransferDetails({ id }: { id: number }) {
  return <InventoryDetailsTemplate kind="stock-transfers" id={id} />;
}
