import { MasterDetailsTemplate } from '../shared/MasterTemplate';
export default function BusinessLocationDetails({ id }: { id: number }) {
  return <MasterDetailsTemplate kind="business-locations" id={id} />;
}
