import { useEffect, useState, type FormEvent } from 'react';
import { employeeApi } from './employee.api';
import { departments, type EmployeeInput } from './employee.types';
import { roleApi } from '../role/role.api';
import { EmployeeField, EmployeeChecks, personalFields, addressFields, loginFlags, serviceFlags, workFields } from './EmployeeFields';

const oEmptyEmployeeL: EmployeeInput = { code: '', name: '', firstName: '', lastName: '', email: '', role: '', department: '', status: 'Active', hasLogin: false };
export default function EmployeeForm({ id: nEmployeeIdP }: { id?: number }) {
  const [oDraftL, setDraft] = useState<EmployeeInput>(oEmptyEmployeeL);
  const [bLoadingL, setLoading] = useState(nEmployeeIdP !== undefined);
  const [bSavingL, setSaving] = useState(false);
  const [zErrorL, setError] = useState('');
  const [bLoadFailedL, setLoadFailed] = useState(false);
  const [nRetryL, setRetry] = useState(0);
  const [aRoleNamesL, setRoleNames] = useState<string[]>([]);
  const [bRolesLoadingL, setRolesLoading] = useState(true);
  const [zRolesErrorL, setRolesError] = useState('');
  const [bWideL, setWide] = useState(false);
  const [bPhotoErrorL, setPhotoError] = useState(false);
  const change = (oPatchP: Partial<EmployeeInput>) => setDraft(oCurrentP => ({ ...oCurrentP, ...oPatchP }));
  useEffect(() => {
    let bActiveL = true; setRolesLoading(true); setRolesError('');
    roleApi.list().then(data => { if (bActiveL) setRoleNames(data.map(role => role.name)); })
      .catch(oErrorP => { if (bActiveL) setRolesError(oErrorP instanceof Error ? oErrorP.message : 'Unable to load roles.'); })
      .finally(() => { if (bActiveL) setRolesLoading(false); });
    return () => { bActiveL = false; };
  }, [nRetryL]);
  useEffect(() => {
    if (nEmployeeIdP === undefined) return;
    let bActiveL = true; setLoading(true); setError(''); setLoadFailed(false);
    employeeApi.get(nEmployeeIdP).then(employee => {
      if (!bActiveL) return;
      const { id: nEmployeeIdL, ...oDataL } = employee;
      const [zFirstNameL, ...aLastNamePartsL] = oDataL.name.split(' ');
      setDraft({ ...oEmptyEmployeeL, ...oDataL, firstName: oDataL.firstName ?? zFirstNameL, lastName: oDataL.lastName ?? aLastNamePartsL.join(' '), password: '' });
    }).catch(oErrorP => { if (bActiveL) { setLoadFailed(true); setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to load employee.'); } })
      .finally(() => { if (bActiveL) setLoading(false); });
    return () => { bActiveL = false; };
  }, [nEmployeeIdP, nRetryL]);
  async function save(oEventP: FormEvent) {
    oEventP.preventDefault(); if (bSavingL) return;
    const zFirstNameL = (oDraftL.firstName || '').trim();
    const zLastNameL = (oDraftL.lastName || '').trim();
    const oDataL: EmployeeInput = { ...oDraftL, firstName: zFirstNameL, lastName: zLastNameL, name: [zFirstNameL, zLastNameL].filter(Boolean).join(' '), code: oDraftL.code.trim(), email: oDraftL.email.trim() };
    if (!zFirstNameL || !oDataL.code) { setError('First name and employee number are required.'); return; }
    if (oDataL.hasLogin && (bRolesLoadingL || zRolesErrorL || !aRoleNamesL.includes(oDataL.role))) { setError('Select an available user role before enabling login.'); return; }
    if (oDataL.hasLogin && !oDataL.loginId?.trim()) { setError('Login ID is required when login is enabled.'); return; }
    if (!oDataL.hasLogin) { oDataL.role = ''; oDataL.loginId = ''; delete oDataL.password; }
    else if (!oDataL.password) delete oDataL.password;
    setSaving(true); setError('');
    try { const oEmployeeL = nEmployeeIdP === undefined ? await employeeApi.create(oDataL) : await employeeApi.update(nEmployeeIdP, oDataL); setDraft(oCurrentP => ({ ...oCurrentP, password: '' })); window.location.hash = `/employees/${oEmployeeL.id}`; }
    catch (oErrorP) { setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to save employee.'); }
    finally { setSaving(false); }
  }
  const fields = (aItemsP: readonly (readonly [Parameters<typeof EmployeeField>[0]['field'][0], string, string])[]) => aItemsP.map(aFieldP => <EmployeeField key={aFieldP[0]} field={aFieldP} draft={oDraftL} onChange={change} />);
  return <div className={`employee-editor ${bWideL ? 'employee-editor-wide' : ''}`}>
    <header className="employee-title"><h1>{nEmployeeIdP === undefined ? 'New Employee' : 'Update Employee'}</h1><div><button type="button" className="secondary" aria-label="Toggle form width" aria-pressed={bWideL} onClick={() => setWide(!bWideL)}>↔</button><a href="#/employees" aria-label="Close employee form">×</a></div></header>
    {zErrorL && <p role="alert" className="notice">{zErrorL}</p>}
    {bLoadingL ? <p role="status">Loading employee...</p> : bLoadFailedL ? <button onClick={() => setRetry(nValueP => nValueP + 1)}>Retry</button> : <form onSubmit={save}><fieldset disabled={bSavingL} className="role-fieldset">
      <section className="employee-panel" aria-label="Personal details"><div className="employee-personal">
        <div className="employee-name-fields"><label className="field"><span>First name *</span><input required value={oDraftL.firstName || ''} onChange={oEventP => change({ firstName: oEventP.target.value })} /></label><label className="field"><span>Last name</span><input value={oDraftL.lastName || ''} onChange={oEventP => change({ lastName: oEventP.target.value })} /></label><label className="field"><span>Employee number *</span><input required value={oDraftL.code} onChange={oEventP => change({ code: oEventP.target.value })} placeholder="Assigned employee number" /></label><label className="employee-check"><input type="checkbox" checked={oDraftL.status === 'Active'} onChange={oEventP => change({ status: oEventP.target.checked ? 'Active' : 'Inactive' })} />Is bActiveL</label></div>
        <div className="employee-photo"><div className="photo-preview">{oDraftL.photoUrl && !bPhotoErrorL ? <img src={oDraftL.photoUrl} alt="Employee profile" onError={() => setPhotoError(true)} /> : <span>{bPhotoErrorL ? 'Image could not be loaded' : 'Employee photo'}</span>}</div><label className="field"><span>Photo URL</span><input type="url" placeholder="https://..." value={oDraftL.photoUrl || ''} onChange={oEventP => { setPhotoError(false); change({ photoUrl: oEventP.target.value }); }} /></label></div>
      </div><div className="employee-columns">{fields(personalFields)}</div><datalist id="employee-departments">{departments.map(value => <option key={value} value={value} />)}</datalist></section>
      <section className="employee-panel"><h2>Address</h2><div className="employee-columns">{fields(addressFields)}</div></section>
      <section className="employee-panel"><label className="employee-check"><input type="checkbox" checked={!!oDraftL.hasLogin} onChange={oEventP => change({ hasLogin: oEventP.target.checked })} />Has login</label>
        <fieldset disabled={!oDraftL.hasLogin} className="role-fieldset"><div className="employee-columns">
          <label className="field"><span>Login ID {oDraftL.hasLogin ? '*' : ''}</span><input required={!!oDraftL.hasLogin} autoComplete="off" value={oDraftL.loginId || ''} onChange={oEventP => change({ loginId: oEventP.target.value })} /></label>
          <label className="field"><span>{nEmployeeIdP === undefined ? 'Password' : 'New password (leave blank to keep current)'}</span><input type="password" autoComplete="new-password" required={!!oDraftL.hasLogin && nEmployeeIdP === undefined} minLength={8} value={oDraftL.password || ''} onChange={oEventP => change({ password: oEventP.target.value })} /></label>
          <label className="field"><span>User role *</span><select required={!!oDraftL.hasLogin} disabled={bRolesLoadingL || !!zRolesErrorL} value={oDraftL.role} onChange={oEventP => change({ role: oEventP.target.value })}><option value="">{bRolesLoadingL ? 'Loading roles...' : 'Select a role'}</option>{oDraftL.role && !aRoleNamesL.includes(oDraftL.role) && <option disabled value={oDraftL.role}>{oDraftL.role} (unavailable)</option>}{aRoleNamesL.map(name => <option key={name}>{name}</option>)}</select></label>
          <label className="field"><span>Third-party login email addresses</span><textarea rows={2} value={oDraftL.thirdPartyLoginEmails || ''} onChange={oEventP => change({ thirdPartyLoginEmails: oEventP.target.value })} /></label>
        </div><EmployeeChecks fields={loginFlags} draft={oDraftL} onChange={change} /></fieldset>
        {oDraftL.hasLogin && zRolesErrorL && <p role="alert" className="notice">{zRolesErrorL} <button type="button" onClick={() => setRetry(nValueP => nValueP + 1)}>Retry roles</button></p>}
        {oDraftL.hasLogin && !bRolesLoadingL && !zRolesErrorL && !aRoleNamesL.length && <p className="notice">No roles available. <a href="#/roles/new">Create a user role</a> first.</p>}
      </section>
      <section className="employee-panel"><h2>Service settings</h2><EmployeeChecks fields={serviceFlags} draft={oDraftL} onChange={change} /><div className="employee-columns">{fields([['maximumDailyServices', 'Maximum services per day', 'number'], ['warehouse', 'Employee warehouse', 'text']])}</div></section>
      <section className="employee-panel"><h2>Work settings</h2><div className="employee-columns">{fields(workFields)}</div></section>
      <section className="employee-panel"><details><summary>Employee custom fields</summary><label className="field"><span>Additional information</span><textarea rows={3} value={oDraftL.customFields || ''} onChange={oEventP => change({ customFields: oEventP.target.value })} /></label></details><div className="toolbar employee-submit"><button type="button" className="secondary" onClick={() => { window.location.hash = '/employees'; }}>Cancel</button><button type="submit" disabled={!!oDraftL.hasLogin && (bRolesLoadingL || !!zRolesErrorL || !aRoleNamesL.length)}>{bSavingL ? 'Saving...' : nEmployeeIdP === undefined ? 'Create' : 'Save changes'}</button></div></section>
    </fieldset></form>}
  </div>;
}
