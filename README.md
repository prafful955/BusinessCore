# Full-stack Microservices Starter

Java 21 + Spring Boot + Spring Cloud Gateway + MySQL + Redis + Kafka + React/TypeScript/Vite.

## 1. Requirements
- Java 21
- Maven 3.9+
- Node.js 20+
- Docker Desktop

## 2. Start infrastructure
```bash
docker compose up -d
```

## 3. Start backend (8 terminals)
Start eureka-server first, then config-server, then user-service and wait for schema creation before sales-invoice-service.
```bash
cd backend/eureka-server && mvn spring-boot:run
cd backend/config-server && mvn spring-boot:run
cd backend/user-service && mvn spring-boot:run
cd backend/product-service && mvn spring-boot:run
cd backend/order-service && mvn spring-boot:run
cd backend/inventory-service && mvn spring-boot:run
cd backend/sales-invoice-service && mvn spring-boot:run
cd backend/api-gateway && mvn spring-boot:run
```

## 4. Start frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173
Gateway: http://localhost:8080
Eureka dashboard: http://localhost:8761 (Config Server and all six application services register here).
Gateway routes resolve service names through Eureka. Clients can override EUREKA_SERVER_URL; default: http://localhost:8761/eureka/. Registration and gateway discovery may take a short time after startup.

## Routes
- GET/POST `/api/users`
- GET/POST `/api/products`
- GET/POST `/api/orders`

Product reads are cached in Redis. Creating an order publishes an `order.created` Kafka event.

> This is a development starter, not production-ready security/deployment configuration.

## ERP UI framework additions
The frontend now includes a component playground with a reusable dynamic grid, global search, per-column multi-filtering, sorting, pagination, multi-row selection, column visibility settings, page-size settings, browser-persisted grid preferences, reset defaults, select, multi-select, autocomplete/lookup and confirmation dialog components.

Grid preferences are stored under `localStorage` keys beginning with `erp-grid:`. This is intentionally frontend-local for the foundation version; a future settings API can persist preferences per authenticated user.


## Inventory, sales invoice services and printing
See [backend/SERVICES_AND_PRINTING.md](backend/SERVICES_AND_PRINTING.md) for service ports, startup order, authentication, shared-data ownership and step-by-step invoice/order printing. Configure seller details and paper size in the frontend Print settings page, then use Print preview from document details.

## Central configuration

Config Server runs at http://localhost:8888 and registers with Eureka.
Start it before the six application services; their Config Server import is required.
Reload the Maven project in IntelliJ and run ConfigServerApplication after EurekaServerApplication.

Edit backend/config-server/src/main/resources/config-repo/database.yml to change the
shared MySQL URL, username and password for user-service, product-service, order-service,
inventory-service and sales-invoice-service. Each service still opens its own connection pool.
The gateway receives shared discovery settings only. Service ports and JPA schema settings
remain in each service's application.yml.

DB_URL, DB_USERNAME and DB_PASSWORD environment overrides apply in each database service.
CONFIG_SERVER_URL overrides the default http://localhost:8888 client endpoint.
CONFIG_REPO_LOCATION on Config Server can point to an external file directory, for example
file:///C:/BusinessCore-config/, containing application.yml and database.yml.
For the packaged classpath repository, restart Config Server after edits, then restart
clients to reload configuration. Existing database tests disable remote config and use H2.

Check served database configuration at:
http://localhost:8888/user-service,database/default
The same application-name,database pattern works for the other four database services.
Gateway configuration: http://localhost:8888/api-gateway/default
