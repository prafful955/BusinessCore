# Backend APIs to implement

This guide describes the contract used by the current frontend. Implement the
employee and role endpoints first. Authentication and lookup APIs below are
future integration work; the frontend does not call them yet.

## 1. Base URL and gateway

### Dashboard summary — new frontend endpoint

After demo sign-in the frontend opens `#/dashboard`. Implement
`GET /api/dashboard/summary?category=Bedding` (permission `dashboards.view`).
Categories are Bedding, Appliances, Electronics, Sales, Orders, Deliveries,
Collection and Purchase. Add a gateway route for `/api/dashboard/**`.
Return the requested category's metrics as an object:

```json
{
  "currency": "USD",
  "updatedAt": "2026-10-07T08:00:00Z",
  "metrics": [
    { "key": "orders-today", "label": "Orders Today (STOREWIDE)", "amount": 0 },
    { "key": "orders-month", "label": "Orders This Month", "amount": 59803.49 }
  ]
}
```

Use a valid currency code, ISO timestamp, unique metric keys and numeric amounts.
Calculate actual totals on the backend. The frontend displays a loading/error
state until this API exists; no example totals are built into the UI. Login still
uses the existing demo behavior until the authentication integration in section 4.

The frontend calls `http://localhost:8080/api`, configured in `src/api/client.ts`.
All paths below include `/api`. JSON request/response properties must keep the
names shown here; the frontend variable naming convention does not change them.

The existing gateway routes only users, products and orders. Add gateway routes
for `/api/employees` and `/api/employees/**`, and `/api/roles` and `/api/roles/**`
to the services where you implement these controllers. Add authentication routes
later. Existing gateway CORS allows `http://localhost:5173`; update the origin if
your frontend runs on another port. Handle OPTIONS preflight and allow
Content-Type plus Authorization when bearer authentication is introduced.

## 2. Employee CRUD — required now

| Method | Endpoint              | Success response             | Permission after authentication is connected |
| ------ | --------------------- | ---------------------------- | -------------------------------------------- |
| GET    | `/api/employees`      | 200, Employee array          | `employees.view`                             |
| GET    | `/api/employees/{id}` | 200, Employee object         | `employees.view`                             |
| POST   | `/api/employees`      | 201, created Employee object | `employees.create`                           |
| PUT    | `/api/employees/{id}` | 200, updated Employee object | `employees.update`                           |
| DELETE | `/api/employees/{id}` | 204, no response body        | `employees.delete`                           |

IDs are positive, server-generated numbers. List must return a plain array,
such as `[]` when empty; do not wrap it in `{ data: ... }` or a paginated object.
The manager currently searches and filters this array in the browser.
GET/POST/PUT return the same Employee shape, including `id`.

### Create/update request example

```json
{
  "code": "EMP001",
  "name": "Aarav Sharma",
  "firstName": "Aarav",
  "lastName": "Sharma",
  "email": "aarav@example.com",
  "role": "Sales manager",
  "department": "Sales",
  "status": "Active",
  "hasLogin": true,
  "loginId": "aarav@example.com",
  "password": "example-password-change-me",
  "phone": "+91 9000000000",
  "joiningDate": "2026-10-07",
  "city": "Mumbai",
  "country": "India",
  "hourlyRate": 250,
  "salesCommissionPercent": 5
}
```

The response contains these employee fields and `id`, but **never password or
password hash**. Password is an optional write-only request property. On update,
an omitted password means keep the current password. On create with login
enabled, the form requires a password of at least eight characters. Store a
secure password hash rather than the submitted password.

### All employee fields

The exact TypeScript contract is `src/pages/employee/employee.types.ts`.

| Group         | Fields                                                                                                                                                                                         | JSON type                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Basic         | `code`, `name`, `email`, `role`, `department`, `status`                                                                                                                                        | string                                   |
| Personal      | `firstName`, `lastName`, `photoUrl`, `gender`, `phone`                                                                                                                                         | string                                   |
| Dates         | `dateOfBirth`, `joiningDate`                                                                                                                                                                   | string, `YYYY-MM-DD` or empty when unset |
| Organization  | `businessLocation`, `cashRegister`, `reportsTo`, `associatedEmailAccount`                                                                                                                      | string                                   |
| Address       | `streetAddress`, `streetAddressLine2`, `city`, `state`, `county`, `country`, `zipCode`                                                                                                         | string                                   |
| Login         | `hasLogin`                                                                                                                                                                                     | boolean                                  |
| Login         | `loginId`, `thirdPartyLoginEmails`                                                                                                                                                             | string                                   |
| Login flags   | `maintainLoginHistory`, `viewOthersTimeCaptures`, `requireMfa`, `preventOthersTimeCapture`                                                                                                     | boolean                                  |
| Service flags | `notAnEmployee`, `assignedToServices`, `captureInvoiceSignature`, `captureOrderSignature`, `deliverOrders`, `canHaveAppointments`, `performServices`, `seeRepeatServices`, `serviceLaborTimer` | boolean                                  |
| Service       | `maximumDailyServices`                                                                                                                                                                         | nonnegative integer                      |
| Service       | `warehouse`                                                                                                                                                                                    | string                                   |
| Work          | `workShift`, `holidaySchedule`                                                                                                                                                                 | string                                   |
| Work          | `hourlyRate`                                                                                                                                                                                   | nonnegative number                       |
| Work          | `salesCommissionPercent`                                                                                                                                                                       | number from 0 to 100                     |
| Extra         | `customFields`                                                                                                                                                                                 | string, currently free-text information  |

Fields after the basic group are optional. Missing optional values should not
break older records; use false for omitted booleans and an unset value for
optional numbers/dates. The current form submits empty strings for unfilled text
fields and omits cleared numeric fields. Normalize empty dates in the backend.
PUT should apply the submitted editable state, including clearing optional
fields; password omission remains the exception described above.

### Employee validation and role assignment

- Require a nonblank employee code and name and a valid email. Enforce unique
  employee code and email. The frontend currently asks the user to enter the code.
- `status` must be `Active` or `Inactive`. Validate dates and numeric limits.
- `hasLogin: true` requires a login ID and an existing role. Enforce unique login
  IDs and the password rules for new login accounts.
- The frontend currently submits the **role name**, not a role ID. Resolve it to
  a stored role. Prefer an immutable role foreign key in the database, while
  keeping the current JSON contract or coordinating a frontend change.
- With login disabled, the form sends empty `role` and `loginId` and omits
  `password`. Disable the account and revoke its access on the backend.
- Location, reporting manager, warehouse and schedules currently accept text.
  Photo is a URL; there is no file upload or address lookup call yet.

## 3. Role CRUD — required now

| Method | Endpoint          | Success response         | Permission after authentication is connected |
| ------ | ----------------- | ------------------------ | -------------------------------------------- |
| GET    | `/api/roles`      | 200, Role array          | `roles.view`                                 |
| GET    | `/api/roles/{id}` | 200, Role object         | `roles.view`                                 |
| POST   | `/api/roles`      | 201, created Role object | `roles.create`                               |
| PUT    | `/api/roles/{id}` | 200, updated Role object | `roles.update`                               |
| DELETE | `/api/roles/{id}` | 204, no response body    | `roles.delete`                               |

Create/update body:

```json
{
  "name": "Sales manager",
  "permissions": ["employees.view", "sales.view", "sales.create"]
}
```

Response object:

```json
{
  "id": 1,
  "name": "Sales manager",
  "permissions": ["employees.view", "sales.view", "sales.create"]
}
```

List returns a plain array of these objects. Require a unique, nonblank role name
of at most 100 characters. `permissions` may be empty; validate keys and remove
duplicates. PUT replaces the permission list so unchecked permissions are removed.
Reject deletion of roles assigned to employees with 409 Conflict. Role renames
must preserve employee assignments; resolve returned employee role names from
the stored role relationship.

### Permission keys

Each permission is `<module>.<action>`, where action is `view`, `create`,
`update` or `delete`. The frontend source of truth is
`src/pages/role/role.types.ts`. Supported module keys:

```text
dashboards, locations, employees, roles, products, customers, quotations,
orders, sales, purchases, inventory, manufacturing, deliveries, finance,
appointments, tasks, system, settings
```

The permission tree sends a flat list of grants. All/module checkboxes toggle
their child grants; there is no separate parent permission or inheritance value.
New roles start with no grants. Store grants by role and enforce them in the
backend when authentication is added. Defining permission keys for a module does
not mean its backend endpoints or frontend pages already exist.

## 4. Authentication — proposed next step, not connected yet

Login currently accepts demo input and does not contact the backend. Suggested
authentication endpoints for the next integration:

| Method | Endpoint           | Purpose                                             |
| ------ | ------------------ | --------------------------------------------------- |
| POST   | `/api/auth/login`  | Authenticate email and password; establish session  |
| GET    | `/api/auth/me`     | Return current user, role and effective permissions |
| POST   | `/api/auth/logout` | End session / revoke refresh credentials            |

Proposed login body: `{ "email": "aarav@example.com", "password": "..." }`.
Choose session cookies or bearer tokens before implementing the response and
connecting the frontend. The current fetch client sends neither a bearer token
nor cross-origin cookies. Update it and `LoginPage.tsx`/`App.tsx` during integration.
Return effective permission keys from `/me` and use them for frontend navigation
and action visibility. Backend permission checks are still required on every
protected request. Inactive employees and disabled login accounts cannot sign in.
If `requireMfa` is enabled, a separate MFA challenge/verification flow is needed.

## 5. Optional lookup APIs — future work

Use these when replacing current text inputs with backend dropdowns:

```text
GET /api/departments
GET /api/locations
GET /api/cash-registers
GET /api/email-accounts
GET /api/warehouses
GET /api/work-shifts
GET /api/holiday-schedules
```

Define lookup response shapes and IDs together with the frontend changes.
Reporting-manager choices can use the employee list. Photo upload, address
search, MFA and time-capture/service workflows need their own APIs if implemented;
the current employee checkboxes only store configuration values.

## 6. Errors and implementation checklist

Return 400 for invalid input, 404 for missing records, and 409 for duplicate codes,
emails, role names or assigned-role deletion. Once authentication is connected,
return 401 for missing/invalid login and 403 for insufficient permissions.
A suggested error body is `{ "message": "Employee code already exists" }`.
The current client displays only the HTTP status and a generic error; displaying
the backend message requires a frontend client change.

Implement in this order:

1. Role table, permission storage and role CRUD controllers/services/repositories.
2. Employee table, role relationship and employee CRUD with the full DTO above.
3. Gateway routes and verify requests from the frontend origin.
4. Confirm lists return arrays, create/update return objects with numeric IDs,
   deletes return 204, and passwords never appear in responses.
5. Authentication, permission enforcement and corresponding frontend integration.
6. Lookup APIs and optional workflows as needed.

For the existing Spring project, keep controllers, services, repositories,
entities and request/response DTOs separate. Add backend integration tests for
validation, role assignment, deletion conflicts and permission enforcement.


## 7. Customer and document APIs

Implemented CRUD: /api/customers, /api/quotations, /api/invoices and /api/sales-invoices.
These pages use numeric customerId and statusId references. Lists return plain arrays.
Customers include an optional invoiceName; documents retain customer/invoice names as snapshots.
Document totals are calculated by the backend from quantity, unitPrice and taxPercent.
Status dropdowns call GET /api/statuses?scope=customers|quotations|invoices|sales-invoices.
The Lookup values page manages statuses and other dropdown values through /api/lookup-values.
See ../backend/API_IMPLEMENTATION.md for field contracts and permissions.


## 8. Categories

Product-service implements /api/categories CRUD with {name,description,status,version}. POST omits version; PUT sends the loaded version. DELETE sends ?version=<loaded version>. Outdated edits/deletes return 409. GET responses include version, createdAt and updatedAt. Category manager/details show the record version. AOP logs operations and elapsed time on the backend.


## 9. Organization and inventory workflows
Frontend module folders: company, business-location, warehouse, purchase-order, purchase, stock, stock-transfer, order, customer, quotation, category, invoice and sales-invoice. Each has separate manager/details/form/API/type files. See ../backend/OPERATIONS_API_GUIDE.md for endpoint contracts, posting actions and version rules.


## 10. Dedicated services and printing
Inventory APIs are routed to inventory-service (8084) and sales invoices to sales-invoice-service (8085). Public frontend URLs are unchanged. GET /api/{document-module}/{id}/print provides JSON for print previews. Configure seller details in #/print-settings and choose Print preview from a document details page. See ../backend/SERVICES_AND_PRINTING.md for setup.
