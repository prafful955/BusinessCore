import React, { type ChangeEvent } from 'react';
import type { EmployeeInput } from './employee.types';

export const personalFields = [
  ['gender', 'Gender', 'select'], ['dateOfBirth', 'Date of birth', 'date'],
  ['email', 'E-mail', 'email'], ['phone', 'Phone', 'tel'],
  ['department', 'Department', 'department'], ['businessLocation', 'Business location', 'text'],
  ['joiningDate', 'Joining date', 'date'], ['cashRegister', 'Cash register', 'text'],
  ['reportsTo', 'Reports to', 'text'], ['associatedEmailAccount', 'Associated email account', 'email'],
] as const;
export const addressFields = [
  ['streetAddress', 'Street address', 'text'], ['streetAddressLine2', 'Street address line 2', 'text'],
  ['city', 'City', 'text'], ['state', 'State', 'text'], ['county', 'County', 'text'],
  ['country', 'Country', 'text'], ['zipCode', 'Zip code', 'text'],
] as const;
export const loginFlags = [
  ['maintainLoginHistory', 'Maintain login / logout history'],
  ['preventOthersTimeCapture', 'Do not allow time capture for other employees'],
  ['viewOthersTimeCaptures', 'Can view time captures of other employees'],
  ['requireMfa', 'Multi-factor authentication is required to login'],
] as const;
export const serviceFlags = [
  ['notAnEmployee', 'Not an employee'], ['canHaveAppointments', 'Can have appointments'],
  ['assignedToServices', 'Can be assigned to services'], ['performServices', 'Can perform services'],
  ['captureInvoiceSignature', 'Must capture customer signature on invoice'], ['seeRepeatServices', 'Can see all repeat services'],
  ['captureOrderSignature', 'Must capture customer signature on order'], ['serviceLaborTimer', 'Has service labor timer'],
  ['deliverOrders', 'Can deliver orders / perform on-site service'],
] as const;
export const workFields = [
  ['workShift', 'Work shift', 'text'], ['hourlyRate', 'Hourly rate', 'number'],
  ['salesCommissionPercent', 'Sales commission percent (%)', 'number'], ['holidaySchedule', 'Holiday schedule', 'text'],
] as const;

type StringKey = { [K in keyof EmployeeInput]-?: NonNullable<EmployeeInput[K]> extends string ? K : never }[keyof EmployeeInput];
type NumberKey = 'maximumDailyServices' | 'hourlyRate' | 'salesCommissionPercent';
export function EmployeeField({ field: aFieldP, draft: oDraftP, onChange: onChangeP }: {
  field: readonly [StringKey | NumberKey, string, string]; draft: EmployeeInput; onChange: (oPatchP: Partial<EmployeeInput>) => void;
}) {
  const [zKeyL, zLabelL, zTypeL] = aFieldP;
  return <label className="field"><span>{zLabelL}</span>
    {zTypeL === 'select' ? <select value={oDraftP.gender || ''} onChange={(oEventP: ChangeEvent<HTMLSelectElement>) => onChangeP({ gender: oEventP.target.value })}><option value="">Select</option>{['Female', 'Male', 'Other', 'Prefer not to say'].map(zValueP => <option key={zValueP}>{zValueP}</option>)}</select>
      : zTypeL === 'department' ? <input value={oDraftP.department ?? ''} onChange={(oEventP: ChangeEvent<HTMLInputElement>) => onChangeP({ department: oEventP.target.value })} list="employee-departments" />
      : <input type={zTypeL} required={zKeyL === 'email'} min={zTypeL === 'number' ? 0 : undefined} max={zKeyL === 'salesCommissionPercent' ? 100 : undefined} step={zTypeL === 'number' ? (zKeyL === 'maximumDailyServices' ? 1 : '0.01') : undefined} value={oDraftP[zKeyL] ?? ''} onChange={(oEventP: ChangeEvent<HTMLInputElement>) => onChangeP({ [zKeyL]: zTypeL === 'number' ? (oEventP.target.value === '' ? undefined : Number(oEventP.target.value)) : oEventP.target.value })} />}
  </label>;
}
export function EmployeeChecks({ fields: aFieldsP, draft: oDraftP, onChange: onChangeP }: {
  fields: readonly (readonly [keyof EmployeeInput, string])[]; draft: EmployeeInput; onChange: (oPatchP: Partial<EmployeeInput>) => void;
}) {
  return <div className="employee-checks">{aFieldsP.map(([zKeyP, zLabelP]) => <label key={zKeyP}><input type="checkbox" checked={Boolean(oDraftP[zKeyP])} onChange={(oEventP: ChangeEvent<HTMLInputElement>) => onChangeP({ [zKeyP]: oEventP.target.checked })} />{zLabelP}</label>)}</div>;
}
