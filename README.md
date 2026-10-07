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

## 3. Start backend (7 terminals)
Start eureka-server first, then user-service and wait for schema creation before sales-invoice-service.
```bash
cd backend/eureka-server && mvn spring-boot:run
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
Eureka dashboard: http://localhost:8761 (all six application services register here).
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
