import { useEffect, useRef, useState } from 'react';
import { allPermissions, permissionActions, permissionModules, type Permission } from './role.types';

function AccessCheckbox({ label, keys, value, onChange }: { label: string; keys: Permission[]; value: Permission[]; onChange: (value: Permission[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const count = keys.filter(key => value.includes(key)).length;
  useEffect(() => { if (ref.current) ref.current.indeterminate = count > 0 && count < keys.length; }, [count, keys.length]);
  return <label className="permission-label"><input ref={ref} type="checkbox" checked={count === keys.length} onChange={e => onChange(e.target.checked ? [...new Set([...value, ...keys])] : value.filter(key => !keys.includes(key)))} />{label}<span className={`access-state ${count === keys.length ? 'allowed' : ''}`}>{count === keys.length ? 'On' : count ? 'Partial' : 'Off'}</span></label>;
}
export default function PermissionTree({ value, onChange }: { value: Permission[]; onChange: (value: Permission[]) => void }) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(true);
  return <section className="control-card permission-tree" aria-label="Access permissions">
    <div className="permission-row"><button type="button" className="tree-toggle" aria-label="Expand or collapse all permissions" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? '−' : '+'}</button><AccessCheckbox label="All" keys={allPermissions} value={value} onChange={onChange} /></div>
    {showAll && permissionModules.map(module => {
      const keys = permissionActions.map(action => `${module.key}.${action}` as Permission);
      const open = expanded.includes(module.key);
      return <div className="permission-module" key={module.key}><div className="permission-row"><button type="button" className="tree-toggle" aria-label={`${open ? 'Collapse' : 'Expand'} ${module.label}`} aria-expanded={open} aria-controls={`permissions-${module.key}`} onClick={() => setExpanded(open ? expanded.filter(key => key !== module.key) : [...expanded, module.key])}>{open ? '−' : '+'}</button><AccessCheckbox label={module.label} keys={keys} value={value} onChange={onChange} /></div>
        {open && <div className="permission-actions" id={`permissions-${module.key}`}>{permissionActions.map(action => <AccessCheckbox key={action} label={action.charAt(0).toUpperCase() + action.slice(1)} keys={[`${module.key}.${action}`]} value={value} onChange={onChange} />)}</div>}
      </div>;
    })}
  </section>;
}
