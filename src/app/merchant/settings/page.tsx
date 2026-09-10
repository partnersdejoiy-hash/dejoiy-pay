'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building, ShieldCheck, CreditCard, Bell, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  // Profile Form
  const [businessName, setBusinessName] = useState('DejoiY Technologies Pvt Ltd');
  const [gstin, setGstin] = useState('07AABCD1234E1Z5');
  const [pan, setPan] = useState('AABCD1234E');
  const [supportEmail, setSupportEmail] = useState('support@dejoiypay.com');
  const [supportPhone, setSupportPhone] = useState('+91 80 4567 8900');

  // Bank Form
  const [bankName, setBankName] = useState('HDFC Bank Ltd');
  const [accountNumber, setAccountNumber] = useState('50200019284102');
  const [ifsc, setIfsc] = useState('HDFC0000050');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Merchant Settings & Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Entity verification, settlement bank account details, and branding configuration
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved and synchronized with banking partner!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Legal Entity */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <CardTitle>Business Identification & Tax</CardTitle>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Legal Business Name"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              required
            />
            <Input
              label="Merchant Category Code (MCC)"
              value="6012 - Financial Services / Software"
              readOnly
            />
            <Input
              label="GSTIN"
              value={gstin}
              onChange={e => setGstin(e.target.value)}
              required
            />
            <Input
              label="PAN"
              value={pan}
              onChange={e => setPan(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Settlement Bank Account */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <CardTitle>Settlement Bank Account</CardTitle>
            </div>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Penny-Drop Verified</span>
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Bank Name"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              required
            />
            <Input
              label="Account Number"
              type="password"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              required
            />
            <Input
              label="IFSC Code"
              value={ifsc}
              onChange={e => setIfsc(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Customer Support Information */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <CardTitle>Customer Support & Invoicing Contact</CardTitle>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Support Email (Shown on Receipts)"
              type="email"
              value={supportEmail}
              onChange={e => setSupportEmail(e.target.value)}
              required
            />
            <Input
              label="Support Helpline"
              value={supportPhone}
              onChange={e => setSupportPhone(e.target.value)}
              required
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="text-xs px-6">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
