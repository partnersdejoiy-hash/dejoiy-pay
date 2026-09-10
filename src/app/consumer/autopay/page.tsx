'use client';
import React, { useEffect, useState } from 'react';
import { UpiMandate } from '@/lib/types/payment';
import { formatINR, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  RotateCcw,
  Calendar,
  ShieldCheck,
  Pause,
  Play,
  XCircle,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function ConsumerAutoPayPage() {
  const [mandates, setMandates] = useState<UpiMandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [merchantName, setMerchantName] = useState('');
  const [vpa, setVpa] = useState('');
  const [amountCap, setAmountCap] = useState('');
  const [frequency, setFrequency] = useState<'MONTHLY' | 'WEEKLY' | 'DAILY'>('MONTHLY');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMandates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/consumer/mandates');
      const data = await res.json();
      setMandates(data.mandates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandates();
  }, []);

  const handleToggleStatus = async (id: string, newStatus: 'ACTIVE' | 'PAUSED' | 'REVOKED') => {
    try {
      const res = await fetch('/api/v1/consumer/mandates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', id, status: newStatus }),
      });
      if (res.ok) fetchMandates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(amountCap);
    if (isNaN(cap) || cap <= 0) return;

    try {
      setIsSubmitting(true);
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();

      const res = await fetch('/api/v1/consumer/mandates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr_dejoiypay_01',
          merchantName,
          vpa,
          amountCap: cap,
          frequency,
          startDate,
          endDate,
          purpose,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setMerchantName('');
        setVpa('');
        setAmountCap('');
        setPurpose('');
        fetchMandates();
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
            UPI AutoPay & Subscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage automated recurring mandates with maximum debit limits
          </p>
        </div>

        <Button size="sm" onClick={() => setShowCreateModal(true)} className="text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Setup New Mandate
        </Button>
      </div>

      {/* Mandates List */}
      <div className="space-y-3">
        {mandates.map(m => (
          <Card key={m.id} className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                  {m.merchantName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{m.merchantName}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{m.vpa}</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  m.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : m.status === 'PAUSED'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {m.status}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Max Debit Cap:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatINR(m.amountCap)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frequency:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{m.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Next Execution:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{formatDate(m.nextExecutionDate)}</span>
              </div>
              {m.purpose && (
                <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-500">
                  {m.purpose}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-1">
              {m.status === 'ACTIVE' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(m.id, 'PAUSED')}
                  className="text-xs h-7 px-2.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                >
                  <Pause className="w-3 h-3 mr-1" />
                  Pause
                </Button>
              ) : m.status === 'PAUSED' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(m.id, 'ACTIVE')}
                  className="text-xs h-7 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Resume
                </Button>
              ) : null}

              {m.status !== 'REVOKED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(m.id, 'REVOKED')}
                  className="text-xs h-7 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Cancel Mandate
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Setup Mandate Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Authorize New AutoPay Mandate"
        description="Creates an NPCI UPI 2.0 e-Mandate with safe spending caps."
      >
        <form onSubmit={handleCreateMandate} className="space-y-4">
          <Input
            label="Merchant / Service Name"
            placeholder="e.g. Spotify India, Gym, Housing Society"
            value={merchantName}
            onChange={e => setMerchantName(e.target.value)}
            required
          />
          <Input
            label="Merchant UPI ID"
            placeholder="e.g. spotify.mandate@icici"
            value={vpa}
            onChange={e => setVpa(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Maximum Amount Cap (INR)"
              type="number"
              prefixText="₹"
              placeholder="1000.00"
              value={amountCap}
              onChange={e => setAmountCap(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="DAILY">Daily</option>
              </select>
            </div>
          </div>
          <Input
            label="Purpose Note"
            placeholder="e.g. Monthly music streaming subscription"
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            required
          />

          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white">
              Authorize Mandate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
