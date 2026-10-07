import { StockDetailsTemplate } from '../shared/StockTemplate';
export default function StockDetails({ id }: { id: number }) {
  return <StockDetailsTemplate id={id} />;
}
