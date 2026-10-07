import { useEffect, useState } from 'react';
import { employeeApi } from './employee.api';
import type { Employee } from './employee.types';
import { DeleteEmployee } from './DeleteEmployee';
import { personalFields, addressFields, loginFlags, serviceFlags, workFields } from './EmployeeFields';

export default function EmployeeDetails({ id: nEmployeeIdP }: { id: number }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [zErrorL, setError] = useState('');
  const [bDeletingL, setDeleting] = useState(false);
  const [nRetryL, setRetry] = useState(0);
  useEffect(() => {
    let bActiveL = true; setEmployee(null); setError('');
    employeeApi.get(nEmployeeIdP).then(data => { if (bActiveL) setEmployee(data); }).catch(oErrorP => { if (bActiveL) setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to load employee.'); });
    return () => { bActiveL = false; };
  }, [nEmployeeIdP, nRetryL]);
  return <><header><h1>Employee details</h1></header><section className="control-card">
    <div className="toolbar"><a href="#/employees">Back to employees</a>{employee && <><button onClick={() => { window.location.hash = `/employees/${nEmployeeIdP}/edit`; }}>Update</button><button className="danger" onClick={() => setDeleting(true)}>Delete</button></>}</div>
    {zErrorL ? <><p role="alert">{zErrorL}</p><button onClick={() => setRetry(nValueP => nValueP + 1)}>Retry</button></> : !employee ? <p role="status">Loading employee...</p> : <><h2>{employee.name}</h2><dl className="details">{(['code', 'name', 'email', 'role', 'department', 'status'] as const).map(key => <div key={key}><dt>{key}</dt><dd>{employee[key] || '—'}</dd></div>)}</dl>
      {[
        { title: 'Personal details', fields: personalFields },
        { title: 'Address', fields: addressFields },
        { title: 'Work settings', fields: workFields },
      ].map(section => <section key={section.title}><h3>{section.title}</h3><dl className="details">{section.fields.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{employee[key] ?? '—'}</dd></div>)}</dl></section>)}
      <h3>Login settings</h3><dl className="details"><div><dt>Has login</dt><dd>{employee.hasLogin ? 'Yes' : 'No'}</dd></div><div><dt>Login ID</dt><dd>{employee.loginId || '—'}</dd></div><div><dt>Third-party login email addresses</dt><dd>{employee.thirdPartyLoginEmails || '—'}</dd></div>{loginFlags.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{employee[key] ? 'Yes' : 'No'}</dd></div>)}</dl>
      <h3>Service settings</h3><dl className="details">{serviceFlags.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{employee[key] ? 'Yes' : 'No'}</dd></div>)}<div><dt>Maximum services per day</dt><dd>{employee.maximumDailyServices ?? '—'}</dd></div><div><dt>Warehouse</dt><dd>{employee.warehouse || '—'}</dd></div><div><dt>Custom fields</dt><dd>{employee.customFields || '—'}</dd></div></dl>
    </>}
  </section>{bDeletingL && employee && <DeleteEmployee employee={employee} onClose={() => setDeleting(false)} onDeleted={() => { window.location.hash = '/employees'; }} />}</>;
}
