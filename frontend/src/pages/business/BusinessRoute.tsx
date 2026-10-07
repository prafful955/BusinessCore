import PrintSettingsPage from '../print/PrintSettingsPage';
import DocumentPrintPage from '../print/DocumentPrintPage';
import LookupManager from '../shared/LookupManager';
import CustomerManager from '../customer/CustomerManager';
import CustomerDetails from '../customer/CustomerDetails';
import CustomerForm from '../customer/CustomerForm';
import CategoryManager from '../category/CategoryManager';
import CategoryDetails from '../category/CategoryDetails';
import CategoryForm from '../category/CategoryForm';
import OrderManager from '../order/OrderManager';
import OrderDetails from '../order/OrderDetails';
import OrderForm from '../order/OrderForm';
import QuotationManager from '../quotation/QuotationManager';
import QuotationDetails from '../quotation/QuotationDetails';
import QuotationForm from '../quotation/QuotationForm';
import InvoiceManager from '../invoice/InvoiceManager';
import InvoiceDetails from '../invoice/InvoiceDetails';
import InvoiceForm from '../invoice/InvoiceForm';
import SalesInvoiceManager from '../sales-invoice/SalesInvoiceManager';
import SalesInvoiceDetails from '../sales-invoice/SalesInvoiceDetails';
import SalesInvoiceForm from '../sales-invoice/SalesInvoiceForm';
import PurchaseOrderManager from '../purchase-order/PurchaseOrderManager';
import PurchaseOrderDetails from '../purchase-order/PurchaseOrderDetails';
import PurchaseOrderForm from '../purchase-order/PurchaseOrderForm';
import PurchaseManager from '../purchase/PurchaseManager';
import PurchaseDetails from '../purchase/PurchaseDetails';
import PurchaseForm from '../purchase/PurchaseForm';
import StockTransferManager from '../stock-transfer/StockTransferManager';
import StockTransferDetails from '../stock-transfer/StockTransferDetails';
import StockTransferForm from '../stock-transfer/StockTransferForm';
import CompanyManager from '../company/CompanyManager';
import CompanyDetails from '../company/CompanyDetails';
import CompanyForm from '../company/CompanyForm';
import BusinessLocationManager from '../business-location/BusinessLocationManager';
import BusinessLocationDetails from '../business-location/BusinessLocationDetails';
import BusinessLocationForm from '../business-location/BusinessLocationForm';
import WarehouseManager from '../warehouse/WarehouseManager';
import WarehouseDetails from '../warehouse/WarehouseDetails';
import WarehouseForm from '../warehouse/WarehouseForm';
import StockManager from '../stock/StockManager';
import StockDetails from '../stock/StockDetails';
import StockForm from '../stock/StockForm';
export function businessRoute(route: string) {
  if (route === '/print-settings') return <PrintSettingsPage />;
  const preview = route.match(
    /^\/(orders|quotations|invoices|sales-invoices|purchase-orders|purchases)\/(\d+)\/print$/
  );
  if (preview) {
    const id = Number(preview[2]);
    if (!Number.isSafeInteger(id) || id <= 0) return null;
    const kind = preview[1] === 'orders' ? 'sales-orders' : preview[1];
    return (
      <DocumentPrintPage
        key={route}
        kind={
          kind as
            | 'sales-orders'
            | 'quotations'
            | 'invoices'
            | 'sales-invoices'
            | 'purchase-orders'
            | 'purchases'
        }
        id={id}
      />
    );
  }
  if (route === '/lookup-values') return <LookupManager />;
  const parts = route.split('/');
  if (parts[0] !== '' || parts.length > 4) return null;
  const kind = parts[1],
    part = parts[2],
    edit = parts[3];
  if (edit !== undefined && edit !== 'edit') return null;
  if (part === 'new' && edit) return null;
  let id: number | undefined;
  if (part !== undefined && part !== 'new') {
    if (!/^\d+$/.test(part)) return null;
    id = Number(part);
    if (!Number.isSafeInteger(id) || id <= 0) return null;
  }
  switch (kind) {
    case 'customers':
      if (part === undefined) return <CustomerManager key={route} />;
      if (part === 'new' || edit) return <CustomerForm key={route} id={id} />;
      return <CustomerDetails key={route} id={id!} />;
    case 'categories':
      if (part === undefined) return <CategoryManager key={route} />;
      if (part === 'new' || edit) return <CategoryForm key={route} id={id} />;
      return <CategoryDetails key={route} id={id!} />;
    case 'orders':
      if (part === undefined) return <OrderManager key={route} />;
      if (part === 'new' || edit) return <OrderForm key={route} id={id} />;
      return <OrderDetails key={route} id={id!} />;
    case 'quotations':
      if (part === undefined) return <QuotationManager key={route} />;
      if (part === 'new' || edit) return <QuotationForm key={route} id={id} />;
      return <QuotationDetails key={route} id={id!} />;
    case 'invoices':
      if (part === undefined) return <InvoiceManager key={route} />;
      if (part === 'new' || edit) return <InvoiceForm key={route} id={id} />;
      return <InvoiceDetails key={route} id={id!} />;
    case 'sales-invoices':
      if (part === undefined) return <SalesInvoiceManager key={route} />;
      if (part === 'new' || edit) return <SalesInvoiceForm key={route} id={id} />;
      return <SalesInvoiceDetails key={route} id={id!} />;
    case 'purchase-orders':
      if (part === undefined) return <PurchaseOrderManager key={route} />;
      if (part === 'new' || edit) return <PurchaseOrderForm key={route} id={id} />;
      return <PurchaseOrderDetails key={route} id={id!} />;
    case 'purchases':
      if (part === undefined) return <PurchaseManager key={route} />;
      if (part === 'new' || edit) return <PurchaseForm key={route} id={id} />;
      return <PurchaseDetails key={route} id={id!} />;
    case 'stock-transfers':
      if (part === undefined) return <StockTransferManager key={route} />;
      if (part === 'new' || edit) return <StockTransferForm key={route} id={id} />;
      return <StockTransferDetails key={route} id={id!} />;
    case 'companies':
      if (part === undefined) return <CompanyManager key={route} />;
      if (part === 'new' || edit) return <CompanyForm key={route} id={id} />;
      return <CompanyDetails key={route} id={id!} />;
    case 'business-locations':
      if (part === undefined) return <BusinessLocationManager key={route} />;
      if (part === 'new' || edit) return <BusinessLocationForm key={route} id={id} />;
      return <BusinessLocationDetails key={route} id={id!} />;
    case 'warehouses':
      if (part === undefined) return <WarehouseManager key={route} />;
      if (part === 'new' || edit) return <WarehouseForm key={route} id={id} />;
      return <WarehouseDetails key={route} id={id!} />;
    case 'stocks':
      if (part === undefined) return <StockManager key={route} />;
      if (part === 'new' || edit) return <StockForm key={route} id={id} />;
      return <StockDetails key={route} id={id!} />;
    default:
      return null;
  }
}
