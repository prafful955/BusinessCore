import { useEffect, useState, type FormEvent } from 'react';
import { masterApis, type Master } from '../shared/operations.api';
import { readPrintSettings, savePrintSettings, type PrintSettings } from './print.settings';
import { errorMessage } from '../business/business.api';
export default function PrintSettingsPage() {
  const [settings, setSettings] = useState<PrintSettings>(readPrintSettings);
  const [companies, setCompanies] = useState<Master[]>([]),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    masterApis.companies
      .list()
      .then((rows) => {
        if (active) setCompanies(rows);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, []);
  function save(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      savePrintSettings(settings);
      setMessage('Print settings saved for this browser.');
    } catch {
      setError('Unable to save print settings. Check browser storage permissions.');
    }
  }
  return (
    <>
      <header>
        <h1>Print settings</h1>
        <p>Choose the seller details and paper size used on invoice and order printouts.</p>
      </header>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <form onSubmit={save}>
        <section className="control-card">
          {!!companies.length && (
            <label className="field">
              <span>Use company details</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  const c = companies.find((c) => c.id === Number(e.target.value));
                  if (c) setSettings({ ...settings, companyName: c.name, address: c.address });
                }}
              >
                <option value="">Choose company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="business-fields">
            {(
              [
                ['companyName', 'Company name'],
                ['phone', 'Phone'],
                ['email', 'Email'],
                ['taxNumber', 'Tax number'],
              ] as const
            ).map(([key, label]) => (
              <label className="field" key={key}>
                <span>{label}</span>
                <input
                  maxLength={255}
                  type={key === 'email' ? 'email' : 'text'}
                  value={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                />
              </label>
            ))}
            <label className="field">
              <span>Paper size</span>
              <select
                value={settings.paper}
                onChange={(e) =>
                  setSettings({ ...settings, paper: e.target.value === 'Letter' ? 'Letter' : 'A4' })
                }
              >
                <option>A4</option>
                <option>Letter</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Company address</span>
            <textarea
              maxLength={1000}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Footer / payment instructions</span>
            <textarea
              maxLength={2000}
              value={settings.footer}
              onChange={(e) => setSettings({ ...settings, footer: e.target.value })}
            />
          </label>
          <button>Save print settings</button>
        </section>
      </form>
      <section className="control-card">
        <h2>How to print</h2>
        <ol>
          <li>Save the seller details and paper size above.</li>
          <li>Open an invoice or order details page and choose Print preview.</li>
          <li>Choose Print / Save PDF, then select your printer or Save as PDF.</li>
          <li>
            Use the same paper size in the print dialog and turn browser headers and footers off for
            a clean document.
          </li>
        </ol>
        <p>
          Settings are saved in this browser. Document amounts and billing names come from the
          backend.
        </p>
      </section>
    </>
  );
}
