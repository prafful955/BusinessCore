import { MasterFormTemplate } from '../shared/MasterTemplate';
export default function BusinessLocationForm({ id }: { id?: number }) {
  return <MasterFormTemplate kind="business-locations" id={id} />;
}
