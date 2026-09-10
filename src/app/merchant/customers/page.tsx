'use client';
import React, { useEffect, useState } from 'react';
import { CustomerProfile } from '@/lib/types/payment';
import { formatINR, formatDate, formatRelativeTime } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Users, Mail, Phone } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // In production this fetches from database
    const initial: CustomerProfile[] = [
      {
        id: 'cust_delhi_01',
        merchantId: 'mer_dejoiypay_01',
        name: 'Rohan Verma',
        email: 'rohan.verma@example.com',
        phone: '+91 98112 34567',
        totalSpent: 42500,
        transactionCount: 12,
        lastPaymentAt: '2026-09-10T18:30:00.000Z',
        refundsCount: 0,
        createdAt: '2026-07-25T10:00:00.000Z',
      },
      {
        id: 'cust_bengaluru_02',
        merchantId: 'mer_dejoiypay_01',
        name: 'Priyanka Sundaram',
        email: 'priyanka.sundaram@techindia.org',
        phone: '+91 99001 88234',
        totalSpent: 87400,
        transactionCount: 28,
        lastPaymentAt: '2026-09-10T15:00:00.000Z',
        refundsCount: 1,
        createdAt: '2026-07-10T10:00:00.000Z',
      },
      {
        id: 'cust_mumbai_03',
        merchantId: 'mer_dejoiypay_01',
        name: 'Aditya Kapoor',
        email: 'aditya.kapoor@innovate.co',
        phone: '+91 98200 55432',
        totalSpent: 19800,
        transactionCount: 5,
        lastPaymentAt: '2026-09-09T11:00:00.000Z',
        refundsCount: 0,
        createdAt: '2026-08-20T10:00:00.000Z',
      },
      {
        id: 'cust_hyderabad_04',
        merchantId: 'mer_dejoiypay_01',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@startup.in',
        phone: '+91 97010 33412',
        totalSpent: 135000,
        transactionCount: 42,
        lastPaymentAt: '2026-09-08T16:20:00.000Z',
        refundsCount: 2,
        createdAt: '2026-06-12T10:00:00.000Z',
      },
    ];
    setCustomers(initial);
  }, []);

  const filtered = customers.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profiles, lifetime value (LTV), and transaction frequency across payment rails
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Profiles ({filtered.length})</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4 text-center">Transactions</th>
                <th className="py-3.5 px-4 text-right">Lifetime Spend</th>
                <th className="py-3.5 px-4 text-center">Refunds</th>
                <th className="py-3.5 px-4 text-right">Last Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {c.phone}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium">
                    {c.transactionCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatINR(c.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {c.refundsCount > 0 ? (
                      <span className="text-purple-600 font-mono font-semibold">{c.refundsCount}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    {c.lastPaymentAt ? formatRelativeTime(c.lastPaymentAt) : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
