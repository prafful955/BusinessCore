import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import {
  documentNames,
  errorMessage,
  type DocumentKind,
  type BusinessDocument,
} from '../business/business.api';
import { inventoryNames, type InventoryKind, type Inventory } from '../shared/operations.api';
import PrintableDocument, { type PrintDocument } from './PrintableDocument';
import { readPrintSettings } from './print.settings';
export default function DocumentPrintPage({
  kind,
  id,
}: {
  kind: DocumentKind | InventoryKind;
  id: number;
}) {
  const [document, setDocument] = useState<PrintDocument | null>(null),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0);
  const settings = readPrintSettings();
  const route = kind === 'sales-orders' ? 'orders' : kind;
  useEffect(() => {
    let active = true;
    setDocument(null);
    setError('');
    const load = async () => {
      if (kind === 'purchase-orders' || kind === 'purchases' || kind === 'stock-transfers') {
        const row = await apiRequest<Inventory>('/' + kind + '/' + id + '/print');
        return {
          title: inventoryNames[kind],
          number: row.number,
          date: row.documentDate,
          dueDate: '',
          status: row.status,
          customerName: row.supplierName || '',
          billingAddress: '',
          notes: row.notes,
          currency: row.currency,
          lines: row.lines.map((l) => ({
            description: l.productName || 'Product',
            quantity: l.quantity,
            unitPrice: l.unitCost,
            amount: l.lineTotal,
          })),
          subtotal: row.total,
          taxAmount: 0,
          taxPercent: 0,
          total: row.total,
        };
      }
      const row = await apiRequest<BusinessDocument>('/' + kind + '/' + id + '/print');
      return {
        title: documentNames[kind],
        number: row.number,
        date: row.documentDate,
        dueDate: row.dueDate,
        status: row.status,
        customerName: row.invoiceName || row.customerName,
        billingAddress: row.billingAddress || '',
        notes: row.notes,
        currency: row.currency,
        lines: row.lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          amount: l.lineTotal,
        })),
        subtotal: row.subtotal,
        taxAmount: row.taxAmount,
        taxPercent: row.taxPercent,
        total: row.total,
      };
    };
    load()
      .then((d) => {
        if (active) setDocument(d);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [kind, id, retry]);
  useEffect(() => {
    if (!document) return;
    const previous = window.document.title;
    window.document.title = document.title + ' ' + document.number;
    return () => {
      window.document.title = previous;
    };
  }, [document]);
  return (
    <>
      <div className="print-toolbar toolbar">
        <a href={'#/' + route + '/' + id}>Back to details</a>
        <a href="#/print-settings">Print settings</a>
        <button disabled={!document} onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>
      {!settings.companyName && (
        <p className="print-toolbar notice">
          Set your company name in <a href="#/print-settings">Print settings</a> before printing.
        </p>
      )}
      {error ? (
        <>
          <p role="alert" className="notice">
            {error}
          </p>
          <button onClick={() => setRetry((x) => x + 1)}>Retry</button>
        </>
      ) : !document ? (
        <p role="status">Loading print preview...</p>
      ) : (
        <PrintableDocument document={document} settings={settings} />
      )}
    </>
  );
}
