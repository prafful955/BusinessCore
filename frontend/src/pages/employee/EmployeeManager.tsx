import { useEffect, useState } from 'react';
import { AppGrid, type GridColumn } from '../../components/grid/AppGrid';
import { AppSelect } from '../../components/controls/Controls';
import { employeeApi } from './employee.api';
import { departments, type Employee } from './employee.types';
import { DeleteEmployee } from './DeleteEmployee';

export const employeeColumns: GridColumn<Employee>[] = [
  { key: 'code', label: 'Code' }, { key: 'name', label: 'Employee' },
  { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department' }, { key: 'status', label: 'Status' },
];
export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bLoadingL, setLoading] = useState(true);
  const [zErrorL, setError] = useState('');
  const [nReloadL, setReload] = useState(0);
  const [zSearchL, setSearch] = useState('');
  const [department, setDepartment] = useState('All departments');
  const [status, setStatus] = useState('All statuses');
  const [nSelectedIdL, setSelectedId] = useState<number>();
  const [oDeletingL, setDeleting] = useState<Employee | null>(null);
  useEffect(() => {
    let bActiveL = true;
    setLoading(true); setError('');
    employeeApi.list().then(data => { if (bActiveL) setEmployees(data); })
      .catch(oErrorP => { if (bActiveL) setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to load employees.'); })
      .finally(() => { if (bActiveL) setLoading(false); });
    return () => { bActiveL = false; };
  }, [nReloadL]);
  const aFilteredL = employees.filter(oEventP => `${oEventP.code} ${oEventP.name} ${oEventP.email} ${oEventP.role}`.toLowerCase().includes(zSearchL.toLowerCase()) && (department === 'All departments' || oEventP.department === department) && (status === 'All statuses' || oEventP.status === status));
  const oSelectedL = aFilteredL.find(oEventP => oEventP.id === nSelectedIdL);
  const view = (oEventP: Employee) => { window.location.hash = `/employees/${oEventP.id}`; };
  const edit = (oEventP: Employee) => { window.location.hash = `/employees/${oEventP.id}/edit`; };
  return <><header><div><h1>Employee manager</h1><p>Manage your team and employee information.</p></div></header>
    <section className="control-card"><div className="toolbar" aria-label="Employee actions">
      <button onClick={() => { window.location.hash = '/employees/new'; }}>+ Add employee</button>
      <button className="secondary" disabled={bLoadingL || !!zErrorL || !oSelectedL} onClick={() => oSelectedL && view(oSelectedL)}>View</button>
      <button className="secondary" disabled={bLoadingL || !!zErrorL || !oSelectedL} onClick={() => oSelectedL && edit(oSelectedL)}>Update</button>
      <button className="danger" disabled={bLoadingL || !!zErrorL || !oSelectedL} onClick={() => setDeleting(oSelectedL || null)}>Delete</button>
      <button className="secondary" disabled={bLoadingL} onClick={() => setReload(nValueP => nValueP + 1)}>Refresh</button>
    </div><div className="filters"><label className="field"><span>Search employees</span><input type="search" placeholder="Name, code, email or role" value={zSearchL} onChange={oEventP => setSearch(oEventP.target.value)} /></label>
      <AppSelect label="Department" value={department} onChange={setDepartment} options={['All departments', ...departments]} />
      <AppSelect label="Status" value={status} onChange={setStatus} options={['All statuses', 'Active', 'Inactive']} />
      <button className="secondary" onClick={() => { setSearch(''); setDepartment('All departments'); setStatus('All statuses'); }}>Reset filters</button>
    </div></section>
    {bLoadingL ? <p role="status">Loading employees...</p> : zErrorL ? <p role="alert" className="notice">{zErrorL}</p> : <AppGrid gridId="employees" title="Employees" rows={aFilteredL} columns={employeeColumns} selectedId={nSelectedIdL} onSelect={oEventP => setSelectedId(oEventP.id)} onView={view} onUpdate={edit} onDelete={setDeleting} />}
    {oDeletingL && <DeleteEmployee employee={oDeletingL} onClose={() => setDeleting(null)} onDeleted={() => { setDeleting(null); setSelectedId(undefined); setReload(nValueP => nValueP + 1); }} />}
  </>;
}
