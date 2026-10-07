# Frontend structure

See [BACKEND_API_GUIDE.md](BACKEND_API_GUIDE.md) for the complete backend endpoint
list, request/response fields, role permissions and implementation checklist.

## Automatic formatting

Open this frontend folder in VS Code and install the recommended
**Prettier - Code formatter** extension (`esbenp.prettier-vscode`). Workspace
settings enable formatting on save, paste and type. `.prettierrc.json` shares
the same formatting rules with command-line Prettier.

Run `npm install`, then `npm run format` to format all existing files.
Run `npm run format:check` to check formatting without changing files.
Generated files and dependency directories are excluded by `.prettierignore`.

## Variable naming convention

Use a type prefix followed by a meaningful name, ending with `L` for a local
variable or `P` for a parameter. Strings use `z`, numbers `n`, booleans `b`,
arrays `a`, and objects `o`. Examples: `zFirstNameL`, `nEmployeeIdP`,
`bLoadingL`, `aRoleNamesL`, `oDraftP`. An employee ID represented as a string
is `zEmployeeIdP`; the current API uses numeric IDs, so it uses `nEmployeeIdP`.

Keep API properties and public React prop keys unchanged. Alias destructured
parameters, for example `({ id: nEmployeeIdP }: { id: number })`. Build payloads
with explicit properties, for example `{ firstName: zFirstNameL }`.
React components, functions, type names and React state setters retain their
descriptive names. Apply the variable convention to new and refactored code.

## Employee form

The employee create/update page uses the reference's stacked sections: personal
details and photo, address, login and user role, service settings, work settings,
and custom information. `EmployeeFields.tsx` contains shared field definitions;
`employee.types.ts` defines the extended API payload. The details page also shows
these values. Existing responses with only the original fields remain supported.

Add the optional fields in `employee.types.ts` to the backend DTO and database.
`name` is composed from first and last name; `code` is the employee number and
must be entered until server-side numbering is implemented. `status` represents
the Is active checkbox. Photo uses a URL; file uploads are not implemented.
Location, reporting manager, cash register, warehouse and work schedules are
text fields until their lookup APIs exist. Address finder/geocoding is not connected.

`hasLogin` controls login settings. When enabled, select a role from the roles
API and enter login ID; new employees also require a password of at least eight
characters. Password is write-only, sent only when entered, never displayed in
details, and must never be returned by the backend. An empty update password
means keep the current password. Disabled login submits an empty role and login
ID with no password. Backend validation, password hashing, MFA and operational
permission enforcement must be implemented in the corresponding services.

## User roles and access

Role CRUD has separate manager (`#/roles`), details (`#/roles/{id}`),
create (`#/roles/new`) and update (`#/roles/{id}/edit`) pages. `RoleDetails.tsx`
shows granted and denied actions; `DeleteRole.tsx` provides shared confirmation.
Implement DELETE `/api/roles/{id}` with a 204 response on success. Reject deletion
of assigned roles with a non-success response so existing employee access is
preserved. The frontend refreshes the manager only after successful deletion.

`pages/role/` contains `RoleManager.tsx`, `RoleForm.tsx`, `PermissionTree.tsx`,
`role.api.ts` and `role.types.ts`. Open User roles from the sidebar, create a role,
expand a module and choose View, Create, Update and Delete access. The All and
module checkboxes toggle their child permissions; partial selection is displayed.
Permissions start empty. Unchecking a parent removes all child grants.

Implement GET/POST `/api/roles`, GET/PUT `/api/roles/{id}`. List returns a role
array; get/create/update return a role object:

```json
{"id":1,"name":"Sales manager","permissions":["employees.view","sales.view","sales.create"]}
```

Create/update accept `name` and `permissions`, without `id`. Permission keys are
defined in `role.types.ts`. Enforce unique role names and validate keys on the
backend. Employee forms load role choices from this API and submit the selected
role name in the existing employee `role` field.

This frontend edits and assigns role definitions. Login is still a demo: it does
not load an authenticated user's permissions or restrict pages/actions yet.
When authentication is implemented, return the user's effective permissions,
use them to control frontend navigation/actions, and enforce every permission
on the backend. The backend should resolve employee role assignments to stored
roles (prefer immutable role IDs when adding the final database schema).

```text
src/
  main.tsx                  React entry point only
  App.tsx                   Login state and page routing
  api/client.ts             Shared fetch client and backend base URL
  layouts/AppLayout.tsx     Sidebar and application shell
  components/               Reusable controls, grid and dialog
  pages/
    auth/LoginPage.tsx
    employee/
      EmployeeManager.tsx   List, filters and toolbar
      EmployeeDetails.tsx   Single employee details
      EmployeeForm.tsx      Create and update form
      DeleteEmployee.tsx    Shared delete confirmation
      employee.api.ts       Employee HTTP calls
      employee.types.ts     Types and dropdown options
```

For another module, such as customers, create `pages/customer/` with its own
manager, details, form, API service and types. Keep reusable UI in `components/`
and shared application layout in `layouts/`. Register its routes in `App.tsx`.

## Backend contract to implement

Employee data is fetched from the backend. There are no sample employee rows or
localStorage employee writes. Until the endpoints exist, the pages show request
errors and allow retry. Login remains a demo until an authentication API exists.

Base URL: `http://localhost:8080/api`, configured in `src/api/client.ts`.
Allow the frontend origin (usually `http://localhost:5173`) through backend CORS,
including GET, POST, PUT, DELETE and Content-Type.

| Method | Path | Response |
| --- | --- | --- |
| GET | /employees | Employee array |
| GET | /employees/{id} | Employee object |
| POST | /employees | Created employee object, including server-generated id |
| PUT | /employees/{id} | Updated employee object |
| DELETE | /employees/{id} | 204 No Content |

Create/update body: `code`, `name`, `email`, `role`, `department`, `status`.
Employee responses also include numeric `id`. Status is `Active` or `Inactive`.
The backend should validate fields and enforce unique employee codes and emails.
Manager filters currently run on the fetched list in the browser.

Page URLs: `#/employees`, `#/employees/new`, `#/employees/1`,
`#/employees/1/edit`, `#/login`. Hash routing supports browser back/forward.

## Run

Install Node.js, then run `npm install`, `npm run dev`.
Use `npm run build` to check TypeScript and generate the production build.
