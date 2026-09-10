import { ProviderType } from '../types/payment';
import { IPaymentProvider } from './types';
import { DirectUpiProvider } from './direct-upi.provider';
import { RazorpayProvider } from './razorpay.provider';
import { StripeProvider } from './stripe.provider';
import { PaytmProvider } from './paytm.provider';
import { PaytmBusinessProvider } from './paytm-business.provider';
import { AmazonPayProvider } from './amazon-pay.provider';

class ProviderRegistry {
  private providers: Map<ProviderType, IPaymentProvider> = new Map();

  constructor() {
    this.register(new DirectUpiProvider());
    this.register(new RazorpayProvider());
    this.register(new StripeProvider());
    this.register(new PaytmProvider());
    this.register(new PaytmBusinessProvider());
    this.register(new AmazonPayProvider());
  }

  register(provider: IPaymentProvider): void {
    this.providers.set(provider.providerName, provider);
  }

  get(name?: ProviderType): IPaymentProvider {
    const target = name || (process.env.DEFAULT_PROVIDER as ProviderType) || 'direct-upi';
    const provider = this.providers.get(target);
    if (!provider) {
      // Fallback to direct-upi if requested provider is not found
      return this.providers.get('direct-upi')!;
    }
    return provider;
  }

  list(): Array<{
    id: ProviderType;
    name: string;
    description: string;
    isConfigured: boolean;
    supportedMethods: string[];
    supportedCurrencies: string[];
  }> {
    return [
      {
        id: 'direct-upi',
        name: 'DejoiY Direct UPI (NPCI)',
        description: 'Native Indian UPI 2.0 gateway with 0% MDR, dynamic QR & instant bank settlement.',
        isConfigured: this.get('direct-upi').isConfigured(),
        supportedMethods: ['UPI Intent', 'Dynamic QR', 'VPA Collect'],
        supportedCurrencies: ['INR'],
      },
      {
        id: 'razorpay',
        name: 'Razorpay Standard',
        description: 'All-in-one payment gateway for Cards, Netbanking, UPI, and PayLater in India.',
        isConfigured: this.get('razorpay').isConfigured(),
        supportedMethods: ['Cards', 'UPI', 'Netbanking', 'Wallets', 'EMI'],
        supportedCurrencies: ['INR', 'USD'],
      },
      {
        id: 'stripe',
        name: 'Stripe Global',
        description: 'International card processing, 3DS2, Apple Pay, Google Pay, and multi-currency payouts.',
        isConfigured: this.get('stripe').isConfigured(),
        supportedMethods: ['International Cards', 'Apple Pay', 'Google Pay'],
        supportedCurrencies: ['USD', 'INR', 'EUR', 'GBP'],
      },
      {
        id: 'paytm',
        name: 'Paytm Consumer Gateway',
        description: 'Paytm Wallet, Paytm Postpaid, and bank-grade QR checkout engine.',
        isConfigured: this.get('paytm').isConfigured(),
        supportedMethods: ['Paytm Wallet', 'UPI', 'Cards', 'Netbanking'],
        supportedCurrencies: ['INR'],
      },
      {
        id: 'paytm-business',
        name: 'Paytm Business All-in-One',
        description: 'Merchant counter QR, instant audio soundbox confirmation, and POS terminal integration.',
        isConfigured: this.get('paytm-business').isConfigured(),
        supportedMethods: ['Merchant QR', 'Audio Soundbox', 'UPI'],
        supportedCurrencies: ['INR'],
      },
      {
        id: 'amazon-pay',
        name: 'Amazon Pay India',
        description: 'Amazon Pay Balance, 1-click checkout, and Amazon Pay ICICI credit card rewards.',
        isConfigured: this.get('amazon-pay').isConfigured(),
        supportedMethods: ['Amazon Pay Balance', 'Saved Cards', 'UPI'],
        supportedCurrencies: ['INR'],
      },
    ];
  }
}

export const providerRegistry = new ProviderRegistry();
export function getPaymentProvider(name?: ProviderType): IPaymentProvider {
  return providerRegistry.get(name);
}
