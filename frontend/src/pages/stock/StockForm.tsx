import { StockFormTemplate } from '../shared/StockTemplate';
export default function StockForm({ id }: { id?: number }) {
  return <StockFormTemplate id={id} />;
}
