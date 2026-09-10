'use client';
import React, { useEffect, useState } from 'react';
import { GstInvoice } from '@/lib/types/payment';
import { formatINR, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FileText, Plus, Download, Link2, Copy, Check, CheckCircle2 } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<GstInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custGstin, setCustGstin] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/merchant/invoices');
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(itemPrice);
    const qty = parseInt(itemQty, 10);
    if (isNaN(price) || isNaN(qty)) return;

    try {
      setIsSubmitting(true);
      const subtotal = price * qty;
      const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
      const totalAmount = subtotal + taxAmount;

      const res = await fetch('/api/v1/merchant/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: `INV-2026-09-${Math.floor(100 + Math.random() * 900)}`,
          merchantId: 'mer_dejoiypay_01',
          customer: {
            name: custName,
            email: custEmail,
            phone: '+91 98000 00000',
            gstin: custGstin || undefined,
          },
          items: [
            { id: 'it_new', description: itemDesc, quantity: qty, unitPrice: price, taxRate: 18, total: totalAmount },
          ],
          subtotal,
          taxAmount,
          totalAmount,
          dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setCustName('');
        setCustEmail('');
        setItemDesc('');
        setItemPrice('');
        fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInvoicePaymentLink = (inv: GstInvoice) => {
    const url = `${window.location.origin}/checkout/demo`;
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            GST Invoicing Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compliant B2B & B2C tax invoices with embedded online payment collection
          </p>
        </div>

        <Button size="sm" onClick={() => setShowCreateModal(true)} className="text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Issue GST Invoice
        </Button>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">GSTIN</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Subtotal</th>
                <th className="py-3.5 px-4 text-right">GST (18%)</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{inv.customer.name}</p>
                    <p className="text-[11px] text-slate-400">{inv.customer.email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {inv.customer.gstin || 'B2C (Unregistered)'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {formatINR(inv.subtotal)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                    {formatINR(inv.taxAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatINR(inv.totalAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => copyInvoicePaymentLink(inv)}
                        title="Copy Checkout URL"
                        className="p-1 rounded text-slate-500 hover:text-slate-900"
                      >
                        {copiedId === inv.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => alert(`Generating PDF for ${inv.invoiceNumber}`)}
                        title="Download Tax Invoice PDF"
                        className="p-1 rounded text-slate-500 hover:text-slate-900"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Issue New GST Invoice"
        description="Calculates 18% GST (CGST 9% + SGST 9%) with automated payment links."
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <Input
            label="Customer / Client Name"
            placeholder="e.g. Acme Corp India"
            value={custName}
            onChange={e => setCustName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Customer Email"
              type="email"
              placeholder="billing@acme.in"
              value={custEmail}
              onChange={e => setCustEmail(e.target.value)}
              required
            />
            <Input
              label="Customer GSTIN (Optional)"
              placeholder="e.g. 07AAACA1234F1Z9"
              value={custGstin}
              onChange={e => setCustGstin(e.target.value)}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Itemized Line Item
            </span>
            <Input
              label="Description"
              placeholder="e.g. Software SaaS License (1 Year)"
              value={itemDesc}
              onChange={e => setItemDesc(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Unit Price (Excl. GST)"
                type="number"
                prefixText="₹"
                placeholder="5000.00"
                value={itemPrice}
                onChange={e => setItemPrice(e.target.value)}
                required
              />
              <Input
                label="Quantity"
                type="number"
                value={itemQty}
                onChange={e => setItemQty(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="w-1/2">
              Generate & Send Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
