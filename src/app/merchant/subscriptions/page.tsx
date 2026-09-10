'use client';
import React, { useEffect, useState } from 'react';
import { SubscriptionPlan } from '@/lib/types/payment';
import { formatINR } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Repeat, Plus, Users, CheckCircle2 } from 'lucide-react';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/merchant/subscriptions');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/v1/merchant/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: desc,
          amount: amt,
          currency: 'INR',
          interval,
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setName('');
        setDesc('');
        setAmount('');
        fetchPlans();
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
            Subscriptions & Recurring Billing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create automated recurring billing tiers with UPI AutoPay & credit card tokenization
          </p>
        </div>

        <Button size="sm" onClick={() => setShowCreateModal(true)} className="text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Create Plan Tier
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map(p => (
          <Card key={p.id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{p.name}</h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                  {p.interval}
                </span>
              </div>
              <p className="text-xs text-slate-500 min-h-[36px]">{p.description}</p>
              <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 pt-2">
                {formatINR(p.amount)} <span className="text-xs font-normal text-slate-400">/{p.interval === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {p.activeSubscribers} active subscribers
              </span>
              <button className="text-emerald-600 font-semibold hover:underline">Copy Link &rarr;</button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Plan Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Subscription Plan"
        description="Automates recurring billing collection via UPI AutoPay or saved cards."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <Input
            label="Plan Name"
            placeholder="e.g. Pro Developer Tier"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            label="Description"
            placeholder="e.g. Full API access, 24/7 support"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (INR)"
              type="number"
              prefixText="₹"
              placeholder="1999.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Billing Interval
              </label>
              <select
                value={interval}
                onChange={e => setInterval(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="w-1/2">
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
