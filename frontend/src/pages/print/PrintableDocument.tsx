import type { PrintSettings } from './print.settings';
export type PrintLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};
export type PrintDocument = {
  title: string;
  number: string;
  date: string;
  dueDate: string;
  status: string;
  customerName: string;
  billingAddress: string;
  notes: string;
  currency: string;
  lines: PrintLine[];
  subtotal: number;
  taxAmount: number;
  taxPercent: number;
  total: number;
};
export default function PrintableDocument({
  document: d,
  settings,
}: {
  document: PrintDocument;
  settings: PrintSettings;
}) {
  const money = (value: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: d.currency }).format(value);
  return (
    <article className="print-document">
      <style>{'@page { size: ' + settings.paper + '; margin: 15mm; }'}</style>
      <header className="print-document-heading">
        <div>
          <h1>{settings.companyName || 'Company'}</h1>
          {settings.address && <p>{settings.address}</p>}
          {settings.phone && <p>{settings.phone}</p>}
          {settings.email && <p>{settings.email}</p>}
          {settings.taxNumber && <p>Tax number: {settings.taxNumber}</p>}
        </div>
        <div>
          <h2>{d.title}</h2>
          <p>
            <strong>{d.number}</strong>
          </p>
          <p>Date: {d.date}</p>
          {d.dueDate && <p>Due / valid until: {d.dueDate}</p>}
          <p>Status: {d.status}</p>
        </div>
      </header>
      <section className="print-billing">
        <h3>{d.title === 'Purchase order' || d.title === 'Purchase' ? 'Supplier' : 'Bill to'}</h3>
        <strong>{d.customerName}</strong>
        {d.billingAddress && <p>{d.billingAddress}</p>}
      </section>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th className="numeric">Quantity</th>
            <th className="numeric">Unit price</th>
            <th className="numeric">Amount</th>
          </tr>
        </thead>
        <tbody>
          {d.lines.map((line, index) => (
            <tr key={index}>
              <td>{line.description}</td>
              <td className="numeric">{line.quantity}</td>
              <td className="numeric">{money(line.unitPrice)}</td>
              <td className="numeric">{money(line.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <section className="print-totals">
        <p>
          <span>Subtotal</span>
          <strong>{money(d.subtotal)}</strong>
        </p>
        <p>
          <span>Tax ({d.taxPercent}%)</span>
          <strong>{money(d.taxAmount)}</strong>
        </p>
        <p className="print-grand-total">
          <span>Total</span>
          <strong>{money(d.total)}</strong>
        </p>
      </section>
      {d.notes && (
        <section className="print-notes">
          <h3>Notes</h3>
          <p>{d.notes}</p>
        </section>
      )}
      {settings.footer && <footer>{settings.footer}</footer>}
    </article>
  );
}
