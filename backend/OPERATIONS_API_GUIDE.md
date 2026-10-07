# Current deployment
Inventory/organization/purchasing APIs now run in inventory-service (8084). Sales invoices run in sales-invoice-service (8085). Other customer documents remain in user-service (8081). The gateway preserves all public paths. See [SERVICES_AND_PRINTING.md](SERVICES_AND_PRINTING.md) for startup and print instructions.

# Frontend modules and operations APIs

Every module has a separate folder under frontend/src/pages:
customer, order, quotation, category, invoice, sales-invoice, purchase-order, purchase,
stock, stock-transfer, warehouse, business-location and company.
Each contains its own Manager.tsx, Details.tsx, Form.tsx, .api.ts and .types.ts files.
pages/shared contains reusable grid, document, organization, inventory and stock templates.
The combined CustomerPages.tsx, CategoryPages.tsx and DocumentPages.tsx files have been replaced.

## Organization setup
Create a company at /api/companies, then its business location at /api/business-locations,
then a warehouse at /api/warehouses. Body: {code,name,address,status,parentId}; omit parentId for companies.
Responses include id, version, parentId and parentName. PUT supplies version; DELETE requires ?version=.
Warehouse and location parent assignments are immutable after creation. Parent/assigned-record deletion returns 409.
The warehouse GET endpoint now returns authoritative warehouse records (each includes id/name), replacing the old free-text warehouse lookup.

## Products and stock
Products remain owned by product-service: POST /api/products with {name,price}.
GET /api/stock-products supplies product choices for inventory forms.
GET /api/stocks lists balances. GET /api/stocks/{id} returns a balance and version.
GET /api/stocks/{id}/movements returns signed movements with date, reason and source.
POST /api/stocks/adjustments: {productId,warehouseId,quantity,reason,version}.
quantity is a signed change, not the replacement balance. Existing balances require the loaded version;
a new product/warehouse balance omits version. Negative resulting stock returns 409.
Stock balances/movements cannot be edited or deleted directly. Use adjustments with reasons.
Balances support three quantity decimal places. Warehouses, locations and companies must be active for stock operations.

## Purchasing and transfers
CRUD: /api/purchase-orders, /api/purchases, /api/stock-transfers.
Create body: {number,supplierName,documentDate,warehouseId,destinationId,purchaseOrderId,notes,
lines:[{productId,quantity,unitCost}]}.
supplierName is required for purchasing; destinationId is required for transfers and must belong to the same company.
purchaseOrderId is optional for purchases. Linked purchases must use the ordered PO's supplier and warehouse.
PUT includes version and is permitted only in Draft. DELETE requires ?version= and only deletes unreferenced drafts.
POST /api/{module}/{id}/post?version= posts exactly once:
- Purchase order becomes Ordered, without changing stock.
- Purchase becomes Received and adds stock to the warehouse.
- Stock transfer becomes Posted and subtracts from source/adds to destination atomically.
Linked receipts support partial quantities and cannot exceed quantities ordered, accounting for earlier receipts.
Warehouse locks serialize stock changes; transfers lock warehouses in ID order. Insufficient stock rolls back every line and movement.
Amounts use decimal arithmetic. Unit costs support four decimal places; line totals round to two decimals.
Posted documents are immutable. Purchase returns, reversals, cancellation, inventory valuation, multi-currency accounting
and automatic sales-invoice stock consumption are not implemented. Customer invoices remain commercial documents.

## Customer orders
The /orders frontend module calls /api/sales-orders and uses the same customer, billing-name snapshot,
status lookup and line-total contract as quotations/invoices. Status scope sales-orders uses order-status lookups.
The original starter /api/orders endpoints in order-service are retained. They are separate legacy product/user orders;
dashboard order totals still read those original records.

## Permissions and verification
With APP_AUTH_ENABLED=true, organizations use settings.* for companies and locations.* for locations/warehouses;
purchase workflows use purchases.*, inventory workflows use inventory.*, and sales orders use orders.*.
Posting and stock adjustments require update grants. Product/category security remains the earlier product-service behavior.
Backend tests: mvn test in backend/user-service, backend/product-service, backend/inventory-service and backend/sales-invoice-service using Java 21.
InventoryIntegrationTest covers receipt limits, repeat posting, atomic rollback, transfer conservation and stale stock versions.
