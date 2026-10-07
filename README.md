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

Config Server runs at http://localhost:8888 and reads the config-repo folder from
https://github.com/prafful955/BusinessCore.git on main.
Each database service has its own SQL connection file in config-repo, including
user-service.yml for employees and order-service.yml for orders.
See config-repo/README.md for the complete mapping and environment overrides.
Edit, commit and push configuration updates, then restart the affected clients.

Start EurekaServerApplication, ConfigServerApplication, UserApplication (wait for startup),
then the other services. Each client requests configuration by spring.application.name.
Example: http://localhost:8888/user-service/default.
CONFIG_SERVER_URL overrides the client endpoint; CONFIG_GIT_URI overrides Config Server's
Git repository. Config Server does not execute SQL: every database service has its own pool.

## Gateway resilience and monitoring

The reactive gateway uses a 2-second connection timeout and 3-second response timeout.
Employee routes (/api/employees and /api/employees/**) still target user-service.
Employees and departments are currently part of user-service, not separate applications.
The employee circuit breaker counts upstream 500/502/503/504 responses and connection failures;
after at least 5 calls, a 50% failure rate opens the circuit for 10 seconds, followed by 2 trial calls.
The fallback returns HTTP 503 with code EMPLOYEE_SERVICE_UNAVAILABLE for every HTTP method.
Authentication and validation errors pass through normally. The circuit time limiter is 4 seconds
so the 3-second HTTP response timeout can take effect first.

Discovery locator routes are enabled with lowercase service IDs, alongside the existing /api routes.
This also exposes discovered services under /service-id/** with the service prefix stripped.

Monitoring endpoints on the gateway:
- /actuator/health
- /actuator/gateway/routes
- /actuator/metrics
- /actuator/prometheus
- /actuator/info, /actuator/env, /actuator/beans

These development monitoring endpoints and discovery routes have no gateway authentication;
restrict access before public deployment. Configuration and Eureka remain supplied by Config Server.
Run gateway checks with mvn -pl api-gateway test from backend.

## Table naming and audit history

All application tables use tbl_dyn_. The five database services share common-audit for
creator/modifier metadata and API action history in tbl_dyn_audit_events.
See backend/AUDITING.md for identity handling, tests, migration scripts and running the shared module.
