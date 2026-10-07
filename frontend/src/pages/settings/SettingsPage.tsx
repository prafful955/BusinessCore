import { useState, type FormEvent, type ChangeEvent } from 'react';
import type { AccountSettings } from './account.settings';

export default function SettingsPage({
  user,
  profile,
  onSave,
}: {
  user: string;
  profile: AccountSettings;
  onSave: (oProfileP: AccountSettings) => void;
}) {
  const [oDraftL, setDraft] = useState(profile);
  const [zMessageL, setMessage] = useState('');
  const [zErrorL, setError] = useState('');
  const [bReadingL, setReading] = useState(false);
  function choosePhoto(oEventP: ChangeEvent<HTMLInputElement>) {
    const oFileL = oEventP.target.files?.[0];
    oEventP.target.value = '';
    setError('');
    setMessage('');
    if (!oFileL) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(oFileL.type) ||
      oFileL.size > 2 * 1024 * 1024
    ) {
      setError('Choose a JPG, PNG, or WebP image smaller than 2 MB.');
      return;
    }
    setReading(true);
    const oReaderL = new FileReader();
    oReaderL.onload = () => {
      setDraft((oPreviousP) => ({ ...oPreviousP, photo: String(oReaderL.result) }));
      setReading(false);
    };
    oReaderL.onerror = () => {
      setError('Unable to read this image.');
      setReading(false);
    };
    oReaderL.readAsDataURL(oFileL);
  }
  function save(oEventP: FormEvent) {
    oEventP.preventDefault();
    setError('');
    setMessage('');
    if (bReadingL) return;
    const oProfileL = { ...oDraftL, name: oDraftL.name.trim() };
    if (!oProfileL.name) {
      setError('Enter your display name.');
      return;
    }
    try {
      localStorage.setItem('erp-account-' + user, JSON.stringify(oProfileL));
      onSave(oProfileL);
      setMessage('Account settings saved.');
    } catch {
      setError('Unable to save settings. Try a smaller image or check browser storage.');
    }
  }
  return (
    <>
      <header>
        <div>
          <h1>Settings</h1>
          <p>Manage your name and profile photo.</p>
        </div>
      </header>
      <nav className="settings-tabs" aria-label="Settings sections">
        <a href="#/settings" aria-current="page">
          Account
        </a>
        <a href="#/print-settings">Print settings</a>
      </nav>
      <section className="control-card account-settings">
        <form onSubmit={save}>
          <div className="profile-preview">
            {oDraftL.photo ? (
              <img src={oDraftL.photo} alt="Profile preview" />
            ) : (
              <span>{(oDraftL.name || user).charAt(0).toUpperCase()}</span>
            )}
          </div>
          <label className="field">
            <span>Profile photo</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={bReadingL}
              onChange={choosePhoto}
            />
            <small>JPG, PNG, or WebP. Maximum 2 MB.</small>
          </label>
          {oDraftL.photo && (
            <button
              type="button"
              className="secondary"
              disabled={bReadingL}
              onClick={() => setDraft({ ...oDraftL, photo: '' })}
            >
              Remove photo
            </button>
          )}
          <label className="field">
            <span>Display name</span>
            <input
              required
              maxLength={80}
              value={oDraftL.name}
              onChange={(oEventP) => setDraft({ ...oDraftL, name: oEventP.target.value })}
              autoComplete="name"
            />
          </label>
          <label className="field">
            <span>Login email</span>
            <input value={user} readOnly type="email" />
          </label>
          {zErrorL && (
            <p role="alert" className="notice">
              {zErrorL}
            </p>
          )}
          {zMessageL && (
            <p role="status" className="notice">
              {zMessageL}
            </p>
          )}
          <p className="settings-note">These settings are saved in this browser.</p>
          <button type="submit" disabled={bReadingL}>
            {bReadingL ? 'Reading image...' : 'Save changes'}
          </button>
        </form>
      </section>
    </>
  );
}
