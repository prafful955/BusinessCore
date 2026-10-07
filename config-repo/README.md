# Service configuration in Git

Config Server reads this folder from BusinessCore's main branch.
Each service fetches its own file using spring.application.name:
- user-service.yml: employees, roles, users and other user-service modules
- product-service.yml
- order-service.yml
- inventory-service.yml
- sales-invoice-service.yml
- api-gateway.yml: no database connection
application.yml contains discovery settings shared by all application services.

Each SQL file uses a database named after its service (hyphens become underscores, followed by _db), root as the default username and a required DB_PASSWORD environment variable.
DB_URL, DB_USERNAME and DB_PASSWORD environment overrides are evaluated by each client.
Edit the relevant file, commit and push to main, then restart the affected service.
Config Server refreshes its Git copy on configuration requests.

Start Eureka, Config Server, user-service (wait for schema creation), then the remaining services.
Example endpoint: http://localhost:8888/user-service/default
Config Server supports CONFIG_GIT_URI for another Git repository or local file URI.
For a private HTTPS repository, configure SPRING_CLOUD_CONFIG_SERVER_GIT_USERNAME and
SPRING_CLOUD_CONFIG_SERVER_GIT_PASSWORD in Config Server's environment.

New Docker MySQL volumes use the configured database/password. Existing volumes keep their
existing users and passwords; update the MySQL account explicitly or use DB_* overrides.

Set DB_PASSWORD in each database service's IntelliJ Run Configuration environment variables.
The ignored root .env file supplies Docker Compose only; Java does not load it automatically.
Copy .env.example to .env on a new checkout and set your own password.
Actual passwords are excluded from Git.
Database mapping:
| Service | Database |
|---|---|
| user-service (employees) | user_service_db |
| product-service | product_service_db |
| order-service | order_service_db |
| inventory-service | inventory_service_db |
| sales-invoice-service | sales_invoice_service_db |

New MySQL volumes create these databases using infrastructure/mysql/init/01-create-service-databases.sql.
Existing MySQL volumes can run that script manually; JDBC URLs also allow database creation.
Existing records are not migrated by a connection-string change.
Remove any DB_URL override to use these per-service defaults.

The application previously shared tables across services. Inventory's products projection and
sales invoices' customer/status projections need migration and synchronization for isolated databases.
sales-invoice-service retains ddl-auto:validate and requires its tables to be provisioned before startup.
Creating databases alone does not create those validated tables or synchronize reference data.