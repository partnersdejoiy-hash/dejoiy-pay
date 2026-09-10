/**
 * NPCI UPI Specification v1.6 and UPI Deep Linking Reference Implementation
 */

export interface UpiPaymentIntentParams {
  pa: string;           // Payee VPA / UPI ID (e.g. merchant@icici)
  pn: string;           // Payee Name (e.g. DejoiY Technologies)
  mc?: string;          // Merchant Category Code (e.g. 6012, 5411)
  tid?: string;         // Terminal ID / Transaction ID
  tr: string;           // Transaction Reference ID (internal order ID)
  tn?: string;          // Transaction Note / Description
  am: number;           // Amount in INR
  cu?: 'INR';           // Currency Code (always INR)
  url?: string;         // Reference URL
  mode?: string;        // 00 = Default, 01 = QR, 02 = Intent
  purpose?: string;     // 00 = Standard
}

export function validateVpa(vpa: string): { isValid: boolean; error?: string; provider?: string } {
  if (!vpa || typeof vpa !== 'string') {
    return { isValid: false, error: 'VPA is required' };
  }

  const clean = vpa.trim().toLowerCase();
  // Standard NPCI VPA format: [username]@[bank_handle]
  const vpaRegex = /^[a-zA-Z0-9._-]{2,100}@[a-zA-Z0-9]{2,50}$/;

  if (!vpaRegex.test(clean)) {
    return { isValid: false, error: 'Invalid UPI ID format (e.g. yourname@okhdfcbank)' };
  }

  const [username, handle] = clean.split('@');
  if (username.length < 2) {
    return { isValid: false, error: 'UPI ID username too short' };
  }

  const knownHandles: Record<string, string> = {
    okhdfcbank: 'Google Pay (HDFC)',
    okaxis: 'Google Pay (Axis)',
    oksbi: 'Google Pay (SBI)',
    okicici: 'Google Pay (ICICI)',
    ybl: 'PhonePe (YES Bank)',
    ibl: 'PhonePe (IndusInd)',
    axl: 'PhonePe (Axis)',
    paytm: 'Paytm Payments Bank',
    barodampay: 'Bank of Baroda',
    upi: 'BHIM NPCI',
    icici: 'iMobile ICICI',
    postbank: 'India Post Payments Bank',
    kotak: 'Kotak 811',
    dejoiypay: 'DejoiY Pay Network',
  };

  return {
    isValid: true,
    provider: knownHandles[handle] || `Bank UPI (${handle.toUpperCase()})`,
  };
}

export function buildUpiUri(params: UpiPaymentIntentParams): string {
  const search = new URLSearchParams();
  search.set('pa', params.pa);
  search.set('pn', params.pn);
  if (params.mc) search.set('mc', params.mc);
  if (params.tid) search.set('tid', params.tid);
  search.set('tr', params.tr);
  if (params.tn) search.set('tn', params.tn);
  search.set('am', params.am.toFixed(2));
  search.set('cu', params.cu || 'INR');
  if (params.mode) search.set('mode', params.mode);
  if (params.purpose) search.set('purpose', params.purpose);
  if (params.url) search.set('url', params.url);

  return `upi://pay?${search.toString()}`;
}

export function getAppSpecificUpiIntent(app: 'gpay' | 'phonepe' | 'paytm' | 'cred' | 'generic', uri: string): string {
  switch (app) {
    case 'gpay':
      return uri.replace('upi://pay', 'gpay://upi/pay');
    case 'phonepe':
      return uri.replace('upi://pay', 'phonepe://pay');
    case 'paytm':
      return uri.replace('upi://pay', 'paytmmp://pay');
    case 'cred':
      return uri.replace('upi://pay', 'cred://upi/pay');
    case 'generic':
    default:
      return uri;
  }
}
