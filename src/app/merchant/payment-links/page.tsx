'use client';
import React, { useEffect, useState } from 'react';
import { PaymentLink } from '@/lib/types/payment';
import { formatINR, formatDate, formatRelativeTime } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { QrDisplay } from '@/components/qr/QrDisplay';
import { Link2, Plus, Copy, Check, QrCode, ExternalLink, RefreshCw } from 'lucide-react';

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQrLink, setSelectedQrLink] = useState<PaymentLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/payment-links');
      const data = await res.json();
      setLinks(data.paymentLinks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/v1/payment-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: num,
          description,
          customer: custName || custEmail ? { name: custName, email: custEmail, phone: custPhone } : undefined,
          expiresInDays: parseInt(expiresInDays, 10),
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setAmount('');
        setDescription('');
        setCustName('');
        setCustEmail('');
        setCustPhone('');
        fetchLinks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCheckoutUrl = (id: string) => {
    const url = `${window.location.origin}/checkout/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payment Links
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Shareable UPI & Multi-rail checkout links for invoices, messages, and social commerce
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={fetchLinks} isLoading={loading} className="text-xs h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="text-xs h-8">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create Payment Link
          </Button>
        </div>
      </div>

      {/* Links List */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Past Payment Links</CardTitle>
        </CardHeader>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
          {links.map(link => (
            <div key={link.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {link.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    link.status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700'
                      : link.status === 'ACTIVE'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {link.status}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{link.description}</p>
                <p className="font-mono font-bold text-base text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatINR(link.amount)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400">{link.visitsCount} visits</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedQrLink(link)} className="h-7 text-xs px-2">
                    <QrCode className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyCheckoutUrl(link.id)} className="h-7 text-xs px-2">
                    {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <a href={`/checkout/${link.id}`} target="_blank" rel="noreferrer">
                    <Button size="sm" className="h-7 text-xs px-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Link ID</th>
                <th className="py-3 px-4">Purpose / Description</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Visits</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Created</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {links.map(link => (
                <tr key={link.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                    {link.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                    {link.description}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {link.customer?.name || 'Open Link'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        link.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : link.status === 'ACTIVE'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {link.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-600">
                    {link.visitsCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatINR(link.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    {formatRelativeTime(link.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => setSelectedQrLink(link)}
                        title="Show QR Code"
                        className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyCheckoutUrl(link.id)}
                        title="Copy Checkout URL"
                        className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        {copiedId === link.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={`/checkout/${link.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open Checkout Page"
                        className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Payment Link Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Payment Link"
        description="Generate a high-converting, distraction-free checkout page URL."
      >
        <form onSubmit={handleCreateLink} className="space-y-4">
          <Input
            label="Amount (INR)"
            type="number"
            step="0.01"
            prefixText="₹"
            placeholder="2500.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <Input
            label="Purpose / Item Description"
            placeholder="e.g. Design Consulting Retainer or Invoice #409"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Customer Details (Optional)
            </span>
            <Input
              placeholder="Customer Full Name"
              value={custName}
              onChange={e => setCustName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Email Address"
                type="email"
                value={custEmail}
                onChange={e => setCustEmail(e.target.value)}
              />
              <Input
                placeholder="Phone (+91)"
                value={custPhone}
                onChange={e => setCustPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="w-1/2">
              Generate Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Preview Modal */}
      <Modal
        isOpen={Boolean(selectedQrLink)}
        onClose={() => setSelectedQrLink(null)}
        title="Payment Link QR Code"
      >
        {selectedQrLink && (
          <QrDisplay
            payload={selectedQrLink.qrPayload}
            title={selectedQrLink.description}
            amount={selectedQrLink.amount}
          />
        )}
      </Modal>
    </div>
  );
}
