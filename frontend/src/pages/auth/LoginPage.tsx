import { useRef, useState } from 'react';
import { UiIcon } from '../../layouts/AppLayout';
import './login.css';

function CloudMark() {
  return (
    <svg viewBox="0 0 76 52" aria-hidden="true">
      <path fill="#eaf6ff" d="M25 43C5 43 2 20 18 17 21-2 49-4 55 17c21 0 22 26 3 26Z" />
      <path fill="#009dff" d="M33 45c-17 0-20-22-5-25 2-18 27-20 33-3 20-1 22 28 2 28Z" />
      <circle cx="31" cy="33" r="11" fill="#35ceff" opacity=".65" />
    </svg>
  );
}
function OfficeIllustration() {
  return (
    <svg
      className="login-office"
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="office-glass" x2="1" y2="1">
          <stop stopColor="#0d335d" />
          <stop offset="1" stopColor="#062046" />
        </linearGradient>
        <linearGradient id="office-sky" x2="0" y2="1">
          <stop stopColor="#2b66b3" stopOpacity="0" />
          <stop offset="1" stopColor="#80a9ec" stopOpacity=".6" />
        </linearGradient>
        <pattern id="office-windows" width="25" height="27" patternUnits="userSpaceOnUse">
          <rect x="2" y="2" width="20" height="22" fill="#538cc9" opacity=".5" />
          <rect x="3" y="16" width="18" height="7" fill="#ffe0a0" opacity=".8" />
        </pattern>
      </defs>
      <path fill="url(#office-sky)" d="M0 0h400v260H0Z" />
      <path fill="#173962" d="m70 210 67-39 44 12v77H70Z" />
      <path
        fill="url(#office-glass)"
        stroke="#021932"
        strokeWidth="3"
        d="m178 116 137-100 83 35v209H178Z"
      />
      <path fill="url(#office-windows)" opacity=".9" d="m186 120 126-92v232H186Z" />
      <path fill="url(#office-windows)" opacity=".7" d="m322 32 66 27v201h-66Z" />
      <path
        stroke="#031c3e"
        strokeWidth="3"
        d="M315 16v244M178 160l137-71 83 19M178 207l137-39 83 12M209 96v164M244 70v190M278 43v217M351 31v229M377 41v219"
      />
      <path fill="#092641" d="M0 248h400v12H0Z" />
      {[20, 45, 80, 115, 150].map((nValueP) => (
        <g key={nValueP}>
          <path stroke="#17364e" strokeWidth="4" d={`M${nValueP} 260v-24`} />
          <circle cx={nValueP} cy="231" r="14" fill="#15474b" />
          <circle cx={nValueP + 6} cy="239" r="10" fill="#1e5954" />
        </g>
      ))}
    </svg>
  );
}
export default function LoginPage({ onLogin: onLoginP }: { onLogin: (zEmailP: string) => void }) {
  const [zEmailL, setEmail] = useState(() => {
    try {
      return localStorage.getItem('erp-remembered-email') || '';
    } catch {
      return '';
    }
  });
  const [zPasswordL, setPassword] = useState('');
  const [bVisibleL, setVisible] = useState(false);
  const [bRememberL, setRemember] = useState(() => {
    try {
      return !!localStorage.getItem('erp-remembered-email');
    } catch {
      return false;
    }
  });
  const oHelpRefL = useRef<HTMLDialogElement>(null);
  return (
    <div className="cloud-login-page">
      <div className="login-decoration one" />
      <div className="login-decoration two" />
      <div className="login-decoration three" />
      <section className="cloud-login-card" aria-label="Cloud ERP sign in">
        <aside className="login-story">
          <div className="story-brand">
            <CloudMark />
            <div>
              <strong>
                Cloud <em>ERP</em>
              </strong>
              <span>Manage &middot; Automate &middot; Grow</span>
            </div>
          </div>
          <div className="story-accent" />
          <h2>
            All Your Business
            <br />
            Operations in One Place
          </h2>
          <p>
            Sales, Purchase, Inventory, Finance,
            <br />
            HR and more &mdash; on Cloud.
          </p>
          <div className="story-features">
            {[
              ['dashboard', 'Real-time Insights', 'Make data-driven decisions'],
              ['sales', 'End-to-End Management', 'Sales, Purchase, Inventory'],
              ['masters', 'Secure & Role Based', 'Control access with ease'],
              ['cloud', 'Access Anywhere', 'Work from any device'],
            ].map(([zIconP, zTitleP, zDetailP]) => (
              <div className="story-feature" key={zTitleP}>
                <span>
                  <UiIcon name={zIconP} />
                </span>
                <div>
                  <strong>{zTitleP}</strong>
                  <small>{zDetailP}</small>
                </div>
              </div>
            ))}
          </div>
          <OfficeIllustration />
        </aside>
        <div className="login-signin">
          <span className="login-language" aria-label="Language: English">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <ellipse cx="12" cy="12" rx="4" ry="9" />
              <path d="M3 12h18M5 6h14M5 18h14" />
            </svg>
            English<span aria-hidden="true">&#8964;</span>
          </span>
          <div className="signin-heading">
            <div className="signin-brand">
              <CloudMark />
              <h1>
                Cloud <span>ERP</span>
              </h1>
            </div>
            <p>Sign in to your account</p>
          </div>
          <form
            onSubmit={(oEventP) => {
              oEventP.preventDefault();
              try {
                if (bRememberL) localStorage.setItem('erp-remembered-email', zEmailL.trim());
                else localStorage.removeItem('erp-remembered-email');
              } catch {
                /* Sign-in remains available when storage is restricted. */
              }
              onLoginP(zEmailL.trim());
              setPassword('');
            }}
          >
            <label className="login-field">
              <span>Email address</span>
              <div className="login-input">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M4 21v-3a8 8 0 0 1 16 0v3Z" />
                </svg>
                <input
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="Enter your email"
                  value={zEmailL}
                  onChange={(oEventP) => setEmail(oEventP.target.value)}
                />
              </div>
            </label>
            <label className="login-field">
              <span>Password</span>
              <div className="login-input">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3" />
                </svg>
                <input
                  type={bVisibleL ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  minLength={6}
                  placeholder="Enter your password"
                  value={zPasswordL}
                  onChange={(oEventP) => setPassword(oEventP.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={bVisibleL ? 'Hide password' : 'Show password'}
                  aria-pressed={bVisibleL}
                  onClick={() => setVisible(!bVisibleL)}
                >
                  <UiIcon name="view" />
                </button>
              </div>
            </label>
            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  checked={bRememberL}
                  onChange={(oEventP) => setRemember(oEventP.target.checked)}
                />
                Remember email
              </label>
              <button
                type="button"
                className="login-text-button"
                onClick={() => oHelpRefL.current?.showModal()}
              >
                Forgot password?
              </button>
            </div>
            <button type="submit" className="login-submit">
              Sign In <span aria-hidden="true">&#8594;</span>
            </button>
          </form>
          <div className="login-divider">
            <span />
            OR
            <span />
          </div>
          <div className="login-providers">
            <button type="button" disabled title="Microsoft sign-in is not available yet">
              <span className="microsoft-mark" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              Sign in with Microsoft
            </button>
            <button type="button" disabled title="Google sign-in is not available yet">
              <span className="google-mark" aria-hidden="true">
                G
              </span>
              Sign in with Google
            </button>
          </div>
          <small className="login-demo-note">
            Demo: use any email and a password of 6+ characters.
            <br />
            Microsoft and Google sign-in are not available yet.
          </small>
          <div className="login-help">
            Need help?{' '}
            <button
              type="button"
              className="login-text-button"
              onClick={() => oHelpRefL.current?.showModal()}
            >
              Sign-in help
            </button>
          </div>
        </div>
      </section>
      <dialog
        ref={oHelpRefL}
        className="dialog login-help-dialog"
        aria-labelledby="login-help-title"
      >
        <h2 id="login-help-title">Sign-in help</h2>
        <p>
          This preview uses demo sign-in. Enter <strong>admin@example.com</strong> and{' '}
          <strong>admin123</strong>, or any valid email with a password of at least 6 characters.
        </p>
        <p>Password recovery and external sign-in are not available in this preview.</p>
        <button type="button" onClick={() => oHelpRefL.current?.close()}>
          Got it
        </button>
      </dialog>
    </div>
  );
}
