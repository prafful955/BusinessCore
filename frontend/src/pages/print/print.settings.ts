export type PrintSettings = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  footer: string;
  paper: 'A4' | 'Letter';
};
export const defaultPrintSettings: PrintSettings = {
  companyName: '',
  address: '',
  phone: '',
  email: '',
  taxNumber: '',
  footer: 'Thank you for your business.',
  paper: 'A4',
};
const KEY = 'erp-print-settings-v1';
export function readPrintSettings(): PrintSettings {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!raw || typeof raw !== 'object') return { ...defaultPrintSettings };
    const data = raw as Record<string, unknown>,
      result = { ...defaultPrintSettings };
    for (const key of ['companyName', 'address', 'phone', 'email', 'taxNumber', 'footer'] as const)
      if (typeof data[key] === 'string') result[key] = data[key] as string;
    result.paper = data.paper === 'Letter' ? 'Letter' : 'A4';
    return result;
  } catch {
    return { ...defaultPrintSettings };
  }
}
export function savePrintSettings(settings: PrintSettings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
