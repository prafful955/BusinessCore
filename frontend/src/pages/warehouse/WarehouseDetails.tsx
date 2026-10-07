import { MasterDetailsTemplate } from '../shared/MasterTemplate';
export default function WarehouseDetails({ id }: { id: number }) {
  return <MasterDetailsTemplate kind="warehouses" id={id} />;
}
