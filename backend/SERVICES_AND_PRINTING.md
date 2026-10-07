# Separate services and printing

## Service ownership

| Service | Port | Owns |
| --- | --- | --- |
| config-server | 8888 | Shared MySQL and Eureka configuration |
| eureka-server | 8761 | Service registry and discovery dashboard |
| api-gateway | 8080 | Frontend routing and CORS |
| user-service | 8081 | Users, employees, roles, authentication, customers, quotations, regular invoices, sales orders, status lookups, dashboard |
| product-service | 8082 | Products and categories |
| order-service | 8083 | Original legacy product/user order endpoints |
| inventory-service | 8084 | Companies, business locations, warehouses, stock balances, movement history, adjustments, purchase orders, purchase receipts and stock transfers |
| sales-invoice-service | 8085 | Sales invoice CRUD and print data |

Inventory and sales invoices are separate Spring Boot applications with their own POM, controllers, services,
repositories, application.yml and tests. Their controllers have been removed from user-service.
The gateway keeps existing public API URLs, so frontend API addresses do not change.

The connection defaults now select one database per service (see config-repo/README.md). Existing rows are not migrated automatically. The original implementation was a service ownership split,
not database isolation. Inventory writes its organization/stock/purchasing tables; products remain a read projection
of the product table. Sales-invoice-service owns business_documents rows with kind=sales-invoices and reads
customer/status data as immutable projections. Other commercial documents remain owned by user-service.
A database-per-service design would additionally require replicated customer/product references, migration and
cross-service workflow coordination.

## Start the applications

Requirements: Java 21, Maven 3.9+, Node.js and Docker Desktop.

1. From the project root, run docker compose up -d.
2. Start eureka-server (EurekaServerApplication), then config-server (ConfigServerApplication), then start user-service and wait for it to finish creating/updating tables.
3. Start product-service and inventory-service.
4. Start sales-invoice-service, order-service and api-gateway.
5. Start the frontend with npm.cmd run dev from frontend on Windows, or npm run dev on other shells.

Run each backend application from its own folder in a separate terminal:

    cd backend/user-service
    mvn spring-boot:run

Start eureka-server from backend/eureka-server with the same command before ConfigServerApplication and the application services.
Repeat for product-service, inventory-service, sales-invoice-service, order-service and api-gateway.
Sales-invoice-service uses ddl-auto:validate because user-service owns the shared customer/status/document schema.
Start user-service again after this update to add the new billing-address snapshot column.
Inventory-service uses ddl-auto:update to add its currency column.

All services default to the existing MySQL credentials. The new services support DB_URL, DB_USERNAME and
DB_PASSWORD overrides. APP_DASHBOARD_CURRENCY should be consistent across the services.
With APP_AUTH_ENABLED=true, inventory and sales-invoice services validate every bearer session through
USER_SERVICE_URL (default http://localhost:8081) and apply the existing module permissions.
Authentication still defaults off for compatibility with the demo frontend.
Invoice printing does not issue invoices or consume stock.

From backend, run mvn test to test all eight modules, or run mvn test inside an individual service directory.

## Set up printing

1. Sign in and open Print settings in the sidebar.
2. Select a company to copy its name/address, or enter the seller details manually.
3. Set phone, email, tax number, footer/payment instructions and A4 or Letter paper.
4. Choose Save print settings. These settings belong to the current browser.
5. Open an invoice, sales invoice, order, quotation, purchase order or purchase details page.
6. Choose Print preview, then Print / Save PDF.
7. In the browser print dialog, select a printer or Save as PDF. Match the selected paper size,
   disable browser headers/footers, and use the preview to check margins and page breaks.

Printouts include document number/date/status, billing name/address, item quantities, prices, line totals,
subtotal, tax, grand total and notes. The navigation/sidebar/action buttons are hidden when printing.
Long tables repeat their headings. Seller details/footer use the current browser's print settings.
New customer documents store billing names and addresses as snapshots, preserving them through later customer edits.
Older records have no billing-address snapshot and are not automatically backfilled.

## Print API endpoints

GET /api/invoices/{id}/print
GET /api/sales-invoices/{id}/print
GET /api/sales-orders/{id}/print
GET /api/quotations/{id}/print
GET /api/purchase-orders/{id}/print
GET /api/purchases/{id}/print

These endpoints return printable JSON data, with backend-calculated amounts. The React preview renders this data;
the browser generates the physical print job or PDF. There is no server-side PDF generation endpoint.
Print data uses the same view permission as its document.

Frontend implementation: frontend/src/pages/print.
Service tests: backend/inventory-service/src/test and backend/sales-invoice-service/src/test.

## Eureka discovery

Reload backend/pom.xml in IntelliJ to import eureka-server and config-server. Run EurekaServerApplication first, then ConfigServerApplication, then the six application services. Open http://localhost:8761 and wait for API-GATEWAY, USER-SERVICE, PRODUCT-SERVICE, ORDER-SERVICE, INVENTORY-SERVICE, SALES-INVOICE-SERVICE and CONFIG-SERVER to appear as UP. The standalone registry does not register itself. Gateway routes use lb:// service names. EUREKA_SERVER_URL overrides the clients' default http://localhost:8761/eureka/ endpoint. Existing test configurations disable Eureka so database tests do not need a registry.

## Service SQL configuration in Git

Config Server reads config-repo on BusinessCore's main branch. Each SQL service has its
own file named after spring.application.name; employees use user-service.yml and orders
use order-service.yml. These files select databases named after each service
and environment-based MySQL credentials. The gateway receives shared discovery settings only.
Start Config Server before the clients. Push configuration changes to main and restart
affected clients. See config-repo/README.md for service mappings and Git/DB overrides.

Separate database URLs require schema/data migration and reference-data synchronization. Inventory still reads a products projection and sales invoices read customer/status projections. sales-invoice-service keeps schema validation; provision its tables before starting it against a new empty database.
