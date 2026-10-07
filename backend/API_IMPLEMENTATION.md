# Updated service ownership
Inventory and organization APIs have moved to inventory-service (8084); sales invoice APIs have moved to sales-invoice-service (8085). See [SERVICES_AND_PRINTING.md](SERVICES_AND_PRINTING.md) for the current deployment and print workflow. Earlier implementation notes below describe the original combined service layout.

# Backend APIs

User service implements employee and role CRUD, dashboard summary, all seven lookup lists, and bearer authentication. Gateway routes these to port 8081. Run Java 21 and Maven. From backend/user-service run mvn test. Start MySQL with docker compose and services with mvn spring-boot:run.

## Authentication

POST /api/auth/login accepts {email,password} and returns {accessToken,tokenType,expiresAt,user}. Use Authorization: Bearer <accessToken> for /api/auth/me and /api/auth/logout. Tokens expire after eight hours and are stored as SHA-256 digests. Employee updates revoke sessions. Current role grants are checked for every protected request.

Set APP_AUTH_ENABLED=true to enforce permissions on user-service APIs. Default false supports the existing demo frontend and is development only. Provision a role and login-enabled employee before enabling. Frontend bearer integration remains required. Product and order services retain their original security behavior. MFA-enabled employees cannot authenticate until an MFA verification workflow is added.

## Dashboard

Orders, Bedding, Appliances and Electronics return actual daily, monthly and all-time order amounts from the shared orders table. New orders receive a server-generated createdAt timestamp and accept an optional category (Bedding, Appliances or Electronics). Existing undated orders contribute only to all-time totals; existing uncategorized orders contribute to Orders only. Start order-service once to apply these added columns. APP_DASHBOARD_ZONE defaults to Asia/Kolkata; APP_DASHBOARD_CURRENCY defaults to USD. All monetary records must use the configured currency.

Other business metrics aggregate persisted dashboard_entries by category and metricKey. Populate the ledger through business-data imports or transaction integrations. Empty ledger returns metrics: [] for Sales, Deliveries, Collection and Purchase; these workflows are absent from the starter. Keys orders-today, orders-month and orders-total are reserved for derived order metrics on the order-related categories.

## Lookup lists

GET lookup endpoints return [{id,name}], sorted by name, or []. Populate lookup_values with kind matching the URL suffix, such as departments or work-shifts.

## Errors

400 invalid input, 404 missing records, 409 duplicate or assigned-role conflict, 401 invalid sessions, 403 insufficient grants. Error body: {message}. Passwords never appear in employee responses. Existing Hibernate ddl-auto:update creates tables; use explicit migrations for production.

## Customers, quotations, invoices and sales invoices

CRUD endpoints: /api/customers, /api/quotations, /api/invoices, /api/sales-invoices.
Lists return arrays, POST returns 201, PUT returns 200, DELETE returns 204.
Customers: code, name, invoiceName, company, email, phone, streetAddress, city, state, country, zipCode, taxNumber, notes, statusId.
Code and name are required; optional email is unique. Blank invoiceName uses name on new documents.
Documents: number, customerId, statusId, documentDate, lines [{description,quantity,unitPrice}], optional dueDate, taxPercent and notes.
Backend computes lineTotal, subtotal, taxAmount and total using decimal arithmetic, rounding to two decimals.
Customer/billing names are snapshots; renames do not rewrite documents. Selecting another customer replaces snapshots.
Deletion of referenced customers returns 409. Document numbers are unique within each type.
Payment processing, quotation conversion, automated numbering and PDF export are not implemented.

## Status lookup values

GET /api/statuses?scope=customers|quotations|invoices|sales-invoices returns [{id,name}].
CRUD /api/lookup-values accepts {kind,name}; list GET requires ?kind=customer-status, quotation-status, invoice-status, sales-invoice-status or an existing lookup kind.
Default statuses seed empty scopes. Names are editable; statuses do not trigger payment/accounting workflows.
Renames preserve assignments; assigned status deletion or scope changes return 409.
With auth enabled: customers use customers.*, quotations use quotations.*, invoice APIs use sales.*, lookup maintenance uses settings.*.
Frontend routes include manager/create/details/edit for each module, plus /lookup-values.


## Category manager, AOP and record versions

Category CRUD is served by product-service (8082) through /api/categories. Fields: id, name, description, status (Active/Inactive), version, createdAt, updatedAt. Names are unique (case-insensitive); name is required and at most 100 characters. Description is at most 10000 characters.
POST omits version and returns 201 with initial version 0. PUT includes the version read from GET. DELETE requires ?version=<current version>. Missing/invalid versions return 400; outdated versions and concurrent writes return 409. Successful data changes increment the JPA @Version value. Lists are arrays, GET/PUT return 200, DELETE returns 204.
Frontend routes: /categories, /categories/new, /categories/{id}, /categories/{id}/edit. Manager and details display version; edits and deletes submit it. Reload latest category refreshes the edit form after conflicts.
CategoryOperationAspect logs each category controller operation, elapsed milliseconds, success/failure, and exception class. It does not log request bodies or field values and preserves original exceptions for HTTP handling.
Category statuses follow the existing Active/Inactive convention and are not linked to the customer/document status lookups. Categories are separate catalog records; assigning them to products is not implemented yet. Like existing product APIs, category APIs do not yet enforce user-service permissions.
Run category backend tests with mvn test from backend/product-service (Java 21 and Maven required). Tests cover stale updates/deletes, validation, uniqueness, response codes, and AOP logs.


## Separate module folders and stock workflows
See [OPERATIONS_API_GUIDE.md](OPERATIONS_API_GUIDE.md) for companies, locations, warehouses, purchase orders, receipts, stock adjustments, transfers and sales order contracts. Frontend modules now have separate manager/details/form/API/type files under their own folders; shared templates are under pages/shared.
