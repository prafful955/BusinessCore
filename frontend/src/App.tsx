import SettingsPage from './pages/settings/SettingsPage';
import { readAccountSettings } from './pages/settings/account.settings';
import { businessRoute } from './pages/business/BusinessRoute';
import { useEffect, useState } from 'react';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import EmployeeManager from './pages/employee/EmployeeManager';
import EmployeeDetails from './pages/employee/EmployeeDetails';
import EmployeeForm from './pages/employee/EmployeeForm';
import RoleManager from './pages/role/RoleManager';
import RoleForm from './pages/role/RoleForm';
import RoleDetails from './pages/role/RoleDetails';
import DashboardPage from './pages/dashboard/DashboardPage';

// Hash routes support direct links and browser history without extra dependencies.
function currentRoute() {
  return window.location.hash.slice(1) || '/login';
}
export default function App() {
  const [user, setUser] = useState('');
  const [oProfileL, setProfile] = useState(() => readAccountSettings(''));
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const updateRoute = () => setRoute(currentRoute());
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);
  if (!user || route === '/login')
    return (
      <LoginPage
        onLogin={(zEmailP) => {
          setUser(zEmailP);
          setProfile(readAccountSettings(zEmailP));
          window.location.hash = '/dashboard';
        }}
      />
    );
  const match = route.match(/^\/employees\/(\d+)(\/edit)?$/);
  const roleMatch = route.match(/^\/roles\/(\d+)(\/edit)?$/);
  const businessPage = businessRoute(route);
  let page;
  if (route === '/settings')
    page = <SettingsPage user={user} profile={oProfileL} onSave={setProfile} />;
  else if (route === '/dashboard') page = <DashboardPage />;
  else if (businessPage) page = businessPage;
  else if (route === '/employees') page = <EmployeeManager />;
  else if (route === '/roles') page = <RoleManager />;
  else if (route === '/roles/new') page = <RoleForm key="new-role" />;
  else if (roleMatch && Number.isSafeInteger(Number(roleMatch[1])) && Number(roleMatch[1]) > 0)
    page = roleMatch[2] ? (
      <RoleForm key={route} id={Number(roleMatch[1])} />
    ) : (
      <RoleDetails key={route} id={Number(roleMatch[1])} />
    );
  else if (route === '/employees/new') page = <EmployeeForm key="new" />;
  else if (match && Number.isSafeInteger(Number(match[1])) && Number(match[1]) > 0) {
    const id = Number(match[1]);
    page = match[2] ? (
      <EmployeeForm key={route} id={id} />
    ) : (
      <EmployeeDetails key={route} id={id} />
    );
  } else
    page = (
      <>
        <h1>Page not found</h1>
        <a href="#/employees">Back to employees</a>
      </>
    );
  return (
    <AppLayout
      user={user}
      profile={oProfileL}
      onSignOut={() => {
        setUser('');
        window.location.hash = '/login';
      }}
    >
      {page}
    </AppLayout>
  );
}
