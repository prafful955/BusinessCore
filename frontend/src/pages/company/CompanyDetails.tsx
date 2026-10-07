import { MasterDetailsTemplate } from '../shared/MasterTemplate';
export default function CompanyDetails({ id }: { id: number }) {
  return <MasterDetailsTemplate kind="companies" id={id} />;
}
