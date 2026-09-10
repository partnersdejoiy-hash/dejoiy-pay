import Link from 'next/link';
import {
  Wallet,
  Building2,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';
import { providerRegistry } from '@/lib/providers';

export default function HomePage() {
  const providers = providerRegistry.list();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Banner */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="font-extrabold tracking-tight text-xl text-slate-900 dark:text-white">
              DEJOIY
            </span>
            <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider">
              PAY
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/consumer"
              className="text-xs font-semibold px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Consumer Wallet
            </Link>
            <Link
              href="/merchant"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              Merchant Dashboard &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Production-Grade Fintech Infrastructure &bull; NPCI UPI 2.0 Ready</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Unified Payment Gateway & Consumer Wallet System
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            DejoiY Pay powers modern commerce with a pluggable provider abstraction layer, direct NPCI UPI routing, instant bank settlements, dynamic counter QR, and biometric mobile wallets.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/merchant"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              <span>Launch Merchant Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/consumer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Open Consumer Wallet</span>
            </Link>

            <Link
              href="/checkout/demo"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Test Hosted Checkout</span>
            </Link>
          </div>
        </div>

        {/* Portals Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/consumer"
            className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm space-y-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
              <span>Consumer Wallet</span>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Scan any QR, send money via UPI IDs, pay utility bills, transfer to bank accounts, and inspect detailed passbooks.
            </p>
          </Link>

          <Link
            href="/merchant"
            className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm space-y-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
              <span>Merchant Dashboard</span>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track real-time GMV, transaction success rates, refund timelines, settlement batches, and customer analytics.
            </p>
          </Link>

          <Link
            href="/merchant/developers"
            className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm space-y-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
              <span>Developer & Webhooks</span>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Masked API keys, HMAC signature verification, idempotent payloads, event delivery logs, and webhook retry triggers.
            </p>
          </Link>
        </div>

        {/* Integrated Payment Providers Section */}
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Supported Provider Abstractions</h2>
              <p className="text-xs text-slate-500">
                Switch providers or route dynamically without altering application business logic.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold">6 Integrations Active</span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {providers.map(p => (
              <div
                key={p.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    {p.name}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      p.isConfigured
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}
                  >
                    {p.isConfigured ? 'Configured' : 'Sandbox Mode'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1">
                  {p.supportedMethods.map(m => (
                    <span
                      key={m}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <p>DejoiY Pay &copy; 2026 DejoiY Technologies Pvt Ltd. Bank-grade fintech infrastructure.</p>
      </footer>
    </div>
  );
}
