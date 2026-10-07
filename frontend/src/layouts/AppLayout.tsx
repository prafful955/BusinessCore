import { useState, type ReactNode } from 'react';
import type { AccountSettings } from '../pages/settings/account.settings';

export function UiIcon({ name }: { name: string }) {
  const aPathsL: Record<string, string> = {
    dashboard: 'M3 10 12 3l9 7v10h-6v-6H9v6H3Z',
    masters: 'M4 4h16v16H4ZM8 4v16M12 8h5M12 12h5M12 16h5',
    sales: 'M3 3h3l3 12h10l2-8H7M10 20h.01M18 20h.01',
    inventory: 'm3 7 9-4 9 4v10l-9 4-9-4ZM3 7l9 4 9-4M12 11v10',
    settings:
      'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z',
    menu: 'M4 6h16M4 12h16M4 18h16',
    search: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM15 15l6 6',
    edit: 'm15 4 5 5M4 20l4-1L21 6l-4-4L4 15Z',
    view: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    delete: 'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7',
    chevron: 'm9 6 6 6-6 6',
    cloud: 'M6 19a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5 5 0 0 1 0 11Z',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={aPathsL[name] || aPathsL.masters} />
    </svg>
  );
}
const aGroupsL = [
  {
    title: 'Masters',
    icon: 'masters',
    links: [
      ['/customers', 'Customers'],
      ['/categories', 'Categories'],
      ['/employees', 'Employees'],
      ['/roles', 'User roles'],
      ['/companies', 'Companies'],
      ['/business-locations', 'Business locations'],
      ['/warehouses', 'Warehouses'],
      ['/lookup-values', 'Lookup values'],
    ],
  },
  {
    title: 'Sales',
    icon: 'sales',
    links: [
      ['/quotations', 'Quotations'],
      ['/orders', 'Orders'],
      ['/invoices', 'Invoices'],
      ['/sales-invoices', 'Sales invoices'],
    ],
  },
  {
    title: 'Purchase',
    icon: 'sales',
    links: [
      ['/purchase-orders', 'Purchase orders'],
      ['/purchases', 'Purchases'],
    ],
  },
  {
    title: 'Inventory',
    icon: 'inventory',
    links: [
      ['/stocks', 'Stock'],
      ['/stock-transfers', 'Stock transfers'],
    ],
  },
  {
    title: 'Settings',
    icon: 'settings',
    links: [
      ['/settings', 'Account settings'],
      ['/print-settings', 'Print settings'],
    ],
  },
];
export default function AppLayout({
  user: zUserP,
  profile: oProfileP,
  onSignOut: onSignOutP,
  children: oChildrenP,
}: {
  user: string;
  profile: AccountSettings;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const [bSidebarOpenL, setSidebarOpen] = useState(false);
  const [zSearchL, setSearch] = useState('');
  const zRouteL = window.location.hash.slice(1) || '/dashboard';
  const oGroupL = aGroupsL.find((oGroupP) =>
    oGroupP.links.some(([zPathP]) => zRouteL === zPathP || zRouteL.startsWith(zPathP + '/'))
  );
  const aLinkL = oGroupL?.links.find(
    ([zPathP]) => zRouteL === zPathP || zRouteL.startsWith(zPathP + '/')
  );
  const aSearchL = [
    ['/dashboard', 'Dashboard'],
    ...aGroupsL.flatMap((oGroupP) => oGroupP.links),
  ].filter(([, zLabelP]) => zLabelP.toLowerCase().includes(zSearchL.toLowerCase()));
  function navigate() {
    setSearch('');
    setSidebarOpen(false);
  }
  return (
    <div className={`erp-layout ${bSidebarOpenL ? 'navigation-toggled' : ''}`}>
      <header className="erp-topbar">
        <a className="topbar-brand" href="#/dashboard" onClick={navigate}>
          <UiIcon name="cloud" />
          <span>
            Cloud <strong>ERP</strong>
          </span>
        </a>
        <button
          type="button"
          className="sidebar-toggle"
          aria-label="Toggle navigation"
          onClick={() => setSidebarOpen(!bSidebarOpenL)}
        >
          <UiIcon name="menu" />
        </button>
        <div
          className="menu-search"
          onBlur={(oEventP) => {
            if (!oEventP.currentTarget.contains(oEventP.relatedTarget as Node)) setSearch('');
          }}
        >
          <UiIcon name="search" />
          <input
            type="search"
            aria-label="Search navigation"
            placeholder="Search menu, customers, orders..."
            value={zSearchL}
            onChange={(oEventP) => setSearch(oEventP.target.value)}
            onKeyDown={(oEventP) => {
              if (oEventP.key === 'Escape') setSearch('');
              if (oEventP.key === 'Enter' && aSearchL.length) {
                window.location.hash = aSearchL[0][0];
                navigate();
              }
            }}
          />
          {zSearchL && (
            <div className="menu-search-results">
              {aSearchL.length ? (
                aSearchL.map(([zPathP, zLabelP]) => (
                  <a key={zPathP} href={'#' + zPathP} onClick={navigate}>
                    {zLabelP}
                    <UiIcon name="chevron" />
                  </a>
                ))
              ) : (
                <p>No matching pages.</p>
              )}
            </div>
          )}
        </div>
        <div className="topbar-account">
          <a className="topbar-settings" href="#/settings" aria-label="Account settings">
            <UiIcon name="settings" />
          </a>
          <a href="#/settings" className="account-profile">
            <span className="account-avatar">
              {oProfileP.photo ? (
                <img src={oProfileP.photo} alt={`${oProfileP.name || zUserP} profile`} />
              ) : (
                (oProfileP.name || zUserP).charAt(0).toUpperCase()
              )}
            </span>
            <span className="account-copy">
              <strong className="account-name">{oProfileP.name || zUserP}</strong>
              <small title={zUserP}>{zUserP}</small>
            </span>
          </a>
          <button type="button" className="signout-button" onClick={onSignOutP}>
            Sign out
          </button>
        </div>
      </header>
      {bSidebarOpenL && (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className="erp-sidebar">
        <nav aria-label="Main navigation">
          <a
            href="#/dashboard"
            className={zRouteL === '/dashboard' ? 'active' : ''}
            onClick={navigate}
          >
            <UiIcon name="dashboard" />
            Dashboard
          </a>
          {aGroupsL.map((oGroupP) => (
            <details key={oGroupP.title} open={oGroupL?.title === oGroupP.title}>
              <summary className={oGroupL?.title === oGroupP.title ? 'active-group' : ''}>
                <UiIcon name={oGroupP.icon} />
                <span>{oGroupP.title}</span>
                <UiIcon name="chevron" />
              </summary>
              {oGroupP.links.map(([zPathP, zLabelP]) => (
                <a
                  key={zPathP}
                  href={'#' + zPathP}
                  className={zRouteL === zPathP || zRouteL.startsWith(zPathP + '/') ? 'active' : ''}
                  onClick={navigate}
                >
                  {zLabelP}
                </a>
              ))}
            </details>
          ))}
        </nav>
        <div className="sidebar-account">
          <span className="workspace-dot" />
          Your workspace<small>BusinessCore</small>
        </div>
      </aside>
      <main className="erp-content">
        <div className="page-breadcrumb">
          <span>{oGroupL?.title || 'Workspace'}</span>
          <UiIcon name="chevron" />
          <span>{aLinkL?.[1] || 'Dashboard'}</span>
          {zRouteL.endsWith('/new') && (
            <>
              <UiIcon name="chevron" />
              <span>New</span>
            </>
          )}
          {zRouteL.endsWith('/edit') && (
            <>
              <UiIcon name="chevron" />
              <span>Edit</span>
            </>
          )}
        </div>
        {oChildrenP}
      </main>
    </div>
  );
}
