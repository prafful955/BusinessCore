import type { AccountSettings } from '../pages/settings/account.settings';
import { useState, type ReactNode } from 'react';
import { permissionModules } from '../pages/role/role.types';

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
  const zRouteL = window.location.hash.slice(1) || '/dashboard';
  const zTitleL =
    zRouteL === '/settings' || zRouteL === '/print-settings'
      ? 'Settings'
      : zRouteL.startsWith('/employees')
        ? 'Employees'
        : zRouteL.startsWith('/roles')
          ? 'User roles'
          : zRouteL.startsWith('/customers')
            ? 'Customers'
            : zRouteL.startsWith('/quotations')
              ? 'Quotations'
              : zRouteL.startsWith('/sales-invoices')
                ? 'Sales invoices'
                : zRouteL.startsWith('/invoices')
                  ? 'Invoices'
                  : zRouteL.startsWith('/lookup-values')
                    ? 'Lookup values'
                    : zRouteL.startsWith('/companies')
                      ? 'Companies'
                      : zRouteL.startsWith('/business-locations')
                        ? 'Business locations'
                        : zRouteL.startsWith('/warehouses')
                          ? 'Warehouses'
                          : zRouteL.startsWith('/orders')
                            ? 'Orders'
                            : zRouteL.startsWith('/purchase-orders')
                              ? 'Purchase orders'
                              : zRouteL.startsWith('/purchases')
                                ? 'Purchases'
                                : zRouteL.startsWith('/stock-transfers')
                                  ? 'Stock transfers'
                                  : zRouteL.startsWith('/stocks')
                                    ? 'Stock'
                                    : zRouteL.startsWith('/categories')
                                      ? 'Categories'
                                      : 'Dashboard';
  return (
    <div className="erp-layout">
      <header className="erp-topbar">
        <button
          className="sidebar-toggle"
          aria-label="Toggle navigation"
          aria-expanded={bSidebarOpenL}
          onClick={() => setSidebarOpen(!bSidebarOpenL)}
        >
          â˜°
        </button>
        <span>{zTitleL}</span>
        <div className="topbar-account">
          <a
            className="topbar-settings"
            href="#/settings"
            aria-current={
              zRouteL === '/settings' || zRouteL === '/print-settings' ? 'page' : undefined
            }
          >
            Settings
          </a>
          <span className="account-avatar" title={oProfileP.name || zUserP}>
            {oProfileP.photo ? (
              <img src={oProfileP.photo} alt={`${oProfileP.name || zUserP} profile`} />
            ) : (
              (oProfileP.name || zUserP).charAt(0).toUpperCase()
            )}
          </span>
          <span className="account-name" title={zUserP}>
            {oProfileP.name || zUserP}
          </span>
          <button type="button" className="signout-button" onClick={onSignOutP}>
            Sign out
          </button>{' '}
        </div>
      </header>
      <aside className={`erp-sidebar ${bSidebarOpenL ? 'sidebar-open' : ''}`}>
        <a className="erp-brand" href="#/dashboard" onClick={() => setSidebarOpen(false)}>
          ERP <strong>Core</strong>
        </a>
        <nav aria-label="Main navigation">
          <a href="#/print-settings" onClick={() => setSidebarOpen(false)}>
            Print settings
          </a>
          <a
            href="#/dashboard"
            className={zRouteL === '/dashboard' ? 'active' : ''}
            onClick={() => setSidebarOpen(false)}
          >
            Dashboards
          </a>
          <details open={zRouteL.startsWith('/employees')}>
            <summary>Employees</summary>
            <a
              href="#/employees"
              className={zRouteL === '/employees' ? 'active' : ''}
              onClick={() => setSidebarOpen(false)}
            >
              Manage employees
            </a>
            <a href="#/employees/new" onClick={() => setSidebarOpen(false)}>
              New employee
            </a>
          </details>
          <details open={zRouteL.startsWith('/roles')}>
            <summary>User roles</summary>
            <a
              href="#/roles"
              className={zRouteL === '/roles' ? 'active' : ''}
              onClick={() => setSidebarOpen(false)}
            >
              Manage roles
            </a>
            <a href="#/roles/new" onClick={() => setSidebarOpen(false)}>
              New role
            </a>
          </details>

          {[
            ['/companies', 'Companies'],
            ['/business-locations', 'Business locations'],
            ['/warehouses', 'Warehouses'],
            ['/orders', 'Orders'],
            ['/purchase-orders', 'Purchase orders'],
            ['/purchases', 'Purchases'],
            ['/stocks', 'Stock'],
            ['/stock-transfers', 'Stock transfers'],
          ].map(([path, label]) => (
            <details key={path} open={zRouteL.startsWith(path)}>
              <summary>{label}</summary>
              <a
                href={'#' + path}
                className={zRouteL === path ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                Manage {label.toLowerCase()}
              </a>
              <a href={'#' + path + '/new'} onClick={() => setSidebarOpen(false)}>
                {label === 'Stock' ? 'Adjust stock' : 'Add new'}
              </a>
            </details>
          ))}
          {[
            ['/categories', 'Categories'],
            ['/customers', 'Customers'],
            ['/quotations', 'Quotations'],
            ['/invoices', 'Invoices'],
            ['/sales-invoices', 'Sales invoices'],
          ].map(([path, label]) => (
            <details key={path} open={zRouteL.startsWith(path)}>
              <summary>{label}</summary>
              <a
                href={'#' + path}
                className={zRouteL === path ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                Manage {label.toLowerCase()}
              </a>
              <a href={'#' + path + '/new'} onClick={() => setSidebarOpen(false)}>
                New{' '}
                {label === 'Categories'
                  ? 'category'
                  : label === 'Customers'
                    ? 'customer'
                    : label === 'Quotations'
                      ? 'quotation'
                      : label === 'Invoices'
                        ? 'invoice'
                        : 'sales invoice'}
              </a>
            </details>
          ))}
          <a
            href="#/lookup-values"
            className={zRouteL === '/lookup-values' ? 'active' : ''}
            onClick={() => setSidebarOpen(false)}
          >
            Lookup values
          </a>
          {permissionModules
            .filter(
              (oModuleP) =>
                ![
                  'dashboards',
                  'employees',
                  'roles',
                  'customers',
                  'quotations',
                  'sales',
                  'orders',
                  'purchases',
                  'inventory',
                  'locations',
                  'settings',
                ].includes(oModuleP.key)
            )
            .map((oModuleP) => (
              <span
                className="nav-unavailable"
                key={oModuleP.key}
                title="Module not implemented yet"
              >
                {oModuleP.label}
                <small>Planned</small>
              </span>
            ))}
        </nav>
        <div className="sidebar-account">{zUserP}</div>
      </aside>
      <main className="erp-content">{oChildrenP}</main>
    </div>
  );
}
