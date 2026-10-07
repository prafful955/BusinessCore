import { MasterFormTemplate } from '../shared/MasterTemplate';
export default function WarehouseForm({ id }: { id?: number }) {
  return <MasterFormTemplate kind="warehouses" id={id} />;
}
