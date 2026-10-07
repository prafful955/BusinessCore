import { MasterFormTemplate } from '../shared/MasterTemplate';
export default function CompanyForm({ id }: { id?: number }) {
  return <MasterFormTemplate kind="companies" id={id} />;
}
