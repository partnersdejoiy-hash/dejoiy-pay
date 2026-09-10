'use client';
import React, { useEffect, useState } from 'react';
import { QrCodeDetails } from '@/lib/types/payment';
import { formatINR, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { QrDisplay } from '@/components/qr/QrDisplay';
import { QrCode, Plus, Volume2, ShieldCheck, Printer, Download } from 'lucide-react';

export default function QrCodesPage() {
  const [qrList, setQrList] = useState<QrCodeDetails[]>([]);
  const [selectedQr, setSelectedQr] = useState<QrCodeDetails | null>(null);
  const [showDynamicModal, setShowDynamicModal] = useState(false);

  // Dynamic QR Form State
  const [dynTitle, setDynTitle] = useState('');
  const [dynAmount, setDynAmount] = useState('');
  const [dynMins, setDynMins] = useState('15');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQrs = async () => {
    try {
      const staticQr: QrCodeDetails = {
        id: 'dj_qr_counter_01',
        merchantId: 'mer_dejoiypay_01',
        type: 'static',
        title: 'Storefront Billing Counter QR',
        vpa: 'dejoiypay.merchant@icici',
        merchantName: 'DejoiY Technologies Pvt Ltd',
        mcc: '6012',
        currency: 'INR',
        status: 'ACTIVE',
        qrPayload: 'upi://pay?pa=dejoiypay.merchant@icici&pn=DejoiY%20Technologies%20Pvt%20Ltd&mc=6012&cu=INR&mode=01',
        totalCollected: 184500.0,
        transactionCount: 88,
        createdAt: '2026-08-01T10:00:00.000Z',
      };
      setQrList([staticQr]);
      setSelectedQr(staticQr);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQrs();
  }, []);

  const handleCreateDynamicQr = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(dynAmount);
    if (isNaN(amt) || amt <= 0) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/v1/qr/dynamic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dynTitle,
          amount: amt,
          expiresInMinutes: parseInt(dynMins, 10),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQrList(prev => [data.qrCode, ...prev]);
        setSelectedQr(data.qrCode);
        setShowDynamicModal(false);
        setDynTitle('');
        setDynAmount('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            QR Codes & Audio Soundbox
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Static merchant counter standees, dynamic bill QRs, and instant audio speaker alerts
          </p>
        </div>

        <Button size="sm" onClick={() => setShowDynamicModal(true)} className="text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Generate Dynamic Bill QR
        </Button>
      </div>

      {/* Main Grid: Standee Preview + QR Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive QR Display Standee */}
        <div className="lg:col-span-5">
          {selectedQr ? (
            <QrDisplay
              payload={selectedQr.qrPayload}
              title={selectedQr.title}
              amount={selectedQr.amount}
              vpa={selectedQr.vpa}
              merchantName={selectedQr.merchantName}
              showSoundboxTest={true}
            />
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">Select a QR code to preview</div>
          )}
        </div>

        {/* Right: List of QR Codes & Soundbox Settings */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Merchant QR Terminals</CardTitle>
            </CardHeader>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {qrList.map(qr => (
                <div
                  key={qr.id}
                  onClick={() => setSelectedQr(qr)}
                  className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                    selectedQr?.id === qr.id ? 'bg-slate-50 dark:bg-slate-800/60' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{qr.title}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          qr.type === 'static' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {qr.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{qr.vpa}</p>
                    <p className="text-[11px] text-slate-500">
                      Total Collected: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{formatINR(qr.totalCollected)}</span> ({qr.transactionCount} payments)
                    </p>
                  </div>

                  <div className="text-right">
                    {qr.amount && (
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 block">
                        {formatINR(qr.amount)}
                      </span>
                    )}
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase">{qr.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Soundbox Device Information */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  DejoiY Smart Soundbox Device #SBX-8821
                </h4>
                <p className="text-xs text-slate-500">Connected &bull; 4G SIM + Wi-Fi &bull; 100% Battery</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every successful QR payment triggers instantaneous voice announcements in Hindi, English, or regional languages. No app refresh required.
            </p>
          </Card>
        </div>
      </div>

      {/* Dynamic QR Modal */}
      <Modal
        isOpen={showDynamicModal}
        onClose={() => setShowDynamicModal(false)}
        title="Generate Dynamic Invoice QR"
        description="Creates a single-use QR with exact amount and automated invoice reconciliation."
      >
        <form onSubmit={handleCreateDynamicQr} className="space-y-4">
          <Input
            label="Invoice or Purpose Title"
            placeholder="e.g. Table 4 Dining Bill or Invoice #9012"
            value={dynTitle}
            onChange={e => setDynTitle(e.target.value)}
            required
          />
          <Input
            label="Exact Amount (INR)"
            type="number"
            step="0.01"
            prefixText="₹"
            placeholder="750.00"
            value={dynAmount}
            onChange={e => setDynAmount(e.target.value)}
            required
          />
          <Input
            label="Auto-Expire After (Minutes)"
            type="number"
            value={dynMins}
            onChange={e => setDynMins(e.target.value)}
            required
          />
          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowDynamicModal(false)} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="w-1/2">
              Generate QR
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
