# Shared table naming and auditing

All application tables and element-collection tables use tbl_dyn_, for example
tbl_dyn_employees, tbl_dyn_employee_roles, tbl_dyn_products and tbl_dyn_orders.
Hibernate's schema-history tables, if introduced later, are infrastructure rather than application tables.

The common-audit Maven module is used by user, product, order, inventory and sales-invoice services.
Writable entities extend AuditedEntity. Read-only projections remain immutable.
Every writable record has these additional database columns:
- created_by and audit_created_at
- last_modified_by and audit_modified_at
- created_service and last_modified_service
- last_action and last_client_address

JPA callbacks set metadata when records are actually inserted or changed.
Existing createdAt/updatedAt fields and API response contracts remain unchanged.
Audit fields cannot be supplied through JSON request bodies.

AOP records API controller operations in tbl_dyn_audit_events in each service database.
The history includes service, validated actor, action (CREATE/UPDATE/DELETE/VIEW), time,
record ID when available, resource path, HTTP method, client address, duration and outcome.
Delete events remain after the business record is removed. Failed controller operations
are recorded without retaining their arguments, bodies, tokens, passwords or exception messages.
Authentication endpoints are excluded. Requests rejected before controller invocation are not logged here.
Record-level metadata participates in the business transaction and rolls back with it.
Controller history is written separately after execution. If audit storage is unavailable,
the original response is preserved and an audit persistence error is logged; history is best effort.

User, inventory and sales-invoice access interceptors attach the verified employee ID
as employee:<id> after session validation. A servlet-authenticated principal is also supported.
Demo/unauthenticated requests are anonymous; background entity writes use system.
When no identity was attached by an access interceptor, the shared audit interceptor validates
a supplied bearer token through user-service /api/auth/me. This also covers product and order.
Missing, invalid or unavailable sessions remain anonymous; audit enrichment does not grant
permissions or change a service's authorization behavior. app.audit.resolve-bearer=false disables
this optional lookup; app.audit.user-service-url sets its endpoint (default localhost:8081).
User-supplied identity headers are never accepted as proof of identity.
Client address is the actual socket peer, which may be the gateway rather than the browser.

## Building and running

Reload backend/pom.xml in IntelliJ to import common-audit.
From backend, run mvn -pl common-audit install before running individual services through Maven.
The usual service startup order remains unchanged.

## Existing databases

Renaming Java entity mappings does not migrate existing data. Stop the services and back up
each service database before applying infrastructure/mysql/migrations/table-prefix-template.sql
to that database. It conditionally renames legacy tables, adds missing audit columns and creates
tbl_dyn_audit_events. It stops if both old and prefixed names exist; reconcile the data first.
Legacy rows retain unknown/null audit metadata; do not invent historic creators.
This migration script is supplied for review and has not been executed against your databases.

Services using ddl-auto:update create new prefixed tables and audit columns in fresh databases.
sales-invoice-service uses validate: provision its business/reference tables, audit columns and
tbl_dyn_audit_events before startup. audit-events.sql provides the audit-table DDL separately.
The previously documented separate-database reference-data migration/synchronization is still required.

## Verification

Run mvn -pl common-audit test for creation, update, deletion, rollback and identity-spoofing checks.
Run service integration tests from the backend reactor to include their shared dependency.
