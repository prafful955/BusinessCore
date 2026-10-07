import { useState } from 'react';

export default function LoginPage({ onLogin: onLoginP }: { onLogin: (zEmailP: string) => void }) {
  const [zEmailL, setEmail] = useState('');
  const [zPasswordL, setPassword] = useState('');
  return (
    <div className="login-page">
      <section className="login-card">
        <span className="brand-mark">ERP Core</span>
        <h1>Welcome back</h1>
        <p>Sign in to open your business dashboard.</p>
        <form
          onSubmit={(oEventP) => {
            oEventP.preventDefault();
            onLoginP(zEmailL.trim());
            setPassword('');
          }}
        >
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={zEmailL}
              onChange={(oEventP) => setEmail(oEventP.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={zPasswordL}
              onChange={(oEventP) => setPassword(oEventP.target.value)}
            />
          </label>
          <button type="submit">Sign in</button>
        </form>
        <small>
          Demo login: use any email and a password of at least 6 characters. Backend authentication
          will be connected separately.
        </small>
      </section>
    </div>
  );
}
