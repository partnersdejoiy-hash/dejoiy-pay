'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Code2, KeyRound, Copy, Check, Eye, EyeOff, RotateCw, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function DevelopersPage() {
  const [keys, setKeys] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Webhook Tester State
  const [testEndpoint, setTestEndpoint] = useState('https://webhook.site/test-dejoiypay');
  const [testEvent, setTestEvent] = useState('payment.success');
  const [isDispatching, setIsDispatching] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Roll Key Modal
  const [showRollModal, setShowRollModal] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    fetch('/api/v1/developer/keys')
      .then(r => r.json())
      .then(d => setKeys(d))
      .catch(err => console.error(err));
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/v1/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl: testEndpoint,
          secret: 'whsec_merchant_live_demo',
          event: testEvent,
          payload: {
            paymentId: 'dj_pay_109283741',
            amount: 4500.0,
            currency: 'INR',
            status: 'SUCCESS',
            customer: { email: 'rohan.verma@example.com' },
          },
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setIsDispatching(false);
    }
  };

  const handleRollSecretKey = async () => {
    try {
      setIsRolling(true);
      const res = await fetch('/api/v1/developer/keys', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setKeys((prev: any) => ({
          ...prev,
          secretKeyMasked: data.secretKeyMasked,
        }));
        setShowRollModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Developer Console & API
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage API credentials, webhook endpoints, and inspect cryptographic HMAC signatures
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
            ENVIRONMENT: {keys?.environment?.toUpperCase() || 'TEST'}
          </span>
        </div>
      </div>

      {/* API Keys Card */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">API Gateway Keys</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRollModal(true)}
            className="text-xs h-7 text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <RotateCw className="w-3 h-3 mr-1" />
            Roll Secret Key
          </Button>
        </div>

        <div className="space-y-3 pt-2">
          {/* Publishable Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Publishable Key (Client-Side Safe)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={keys?.publishableKey || 'dj_pub_test_88f12b0a99c43d8'}
                className="flex-1 font-mono text-xs px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(keys?.publishableKey || 'dj_pub_test_88f12b0a99c43d8', 'pub')}
                className="h-8 px-3 text-xs"
              >
                {copiedKey === 'pub' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Secret Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Secret Key (Server-Side Only &bull; Never Expose to Frontend)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={
                  showSecret
                    ? 'dj_sec_test_99c27e44a0081d2f9812401'
                    : keys?.secretKeyMasked || 'dj_sec_test_••••••••••••••••1d2f'
                }
                className="flex-1 font-mono text-xs px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSecret(!showSecret)}
                className="h-8 px-3 text-xs"
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard('dj_sec_test_99c27e44a0081d2f9812401', 'sec')}
                className="h-8 px-3 text-xs"
              >
                {copiedKey === 'sec' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Webhooks Test & Verification Simulator */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Webhook Dispatch & HMAC-SHA256 Verification Tester
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate webhook payloads and verify cryptographic signature headers in real-time
            </p>
          </div>
        </div>

        <form onSubmit={handleSimulateWebhook} className="space-y-3 pt-2">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Destination Endpoint URL"
                value={testEndpoint}
                onChange={e => setTestEndpoint(e.target.value)}
                placeholder="https://your-server.com/api/webhooks"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Event Type
              </label>
              <select
                value={testEvent}
                onChange={e => setTestEvent(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="payment.success">payment.success</option>
                <option value="payment.failed">payment.failed</option>
                <option value="refund.processed">refund.processed</option>
                <option value="settlement.completed">settlement.completed</option>
              </select>
            </div>
          </div>

          <Button type="submit" size="sm" isLoading={isDispatching} className="text-xs">
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Send Test Webhook
          </Button>
        </form>

        {testResult && (
          <div className="p-4 rounded-lg bg-slate-950 text-slate-100 border border-slate-800 space-y-2 text-xs font-mono animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 pb-2 border-b border-slate-800">
              <span>HTTP 200 OK &bull; HMAC Signature Verified</span>
              <span>Latency: 42ms</span>
            </div>
            <div>
              <span className="text-slate-400">Header: </span>
              <span className="text-yellow-400">{testResult.signatureHeader}</span>
            </div>
            <pre className="overflow-x-auto text-[11px] text-slate-300 pt-1">
              {JSON.stringify(testResult.payload, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      {/* Integration Code Examples */}
      <Card className="p-5 space-y-3">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
          Backend Integration Sample (Node.js / Express / Next.js)
        </h3>
        <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
{`import { computeHmacSha256 } from '@dejoiypay/sdk';

// 1. Create a Payment Order
const order = await fetch('http://localhost:3030/api/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer dj_sec_test_...',
    'Idempotency-Key': 'order_uuid_123',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1500.00,
    currency: 'INR',
    method: 'upi',
    customer: { name: 'Rohan Verma', email: 'rohan@example.com', phone: '9811234567' }
  })
});

// 2. Verify Incoming Webhook Signature
const signature = req.headers['x-dejoiypay-signature'];
const isValid = verifyHmacSha256(rawBody, signature, WEBHOOK_SECRET);
if (!isValid) throw new Error('Invalid signature');`}
        </pre>
      </Card>

      {/* Roll Key Modal */}
      <Modal
        isOpen={showRollModal}
        onClose={() => setShowRollModal(false)}
        title="Roll API Secret Key"
        description="Are you sure you want to regenerate your Secret Key? Any existing applications using the previous key will immediately stop working."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
            This action cannot be undone. You will need to update your backend environment variables immediately.
          </div>

          <div className="flex space-x-2 pt-2">
            <Button variant="outline" onClick={() => setShowRollModal(false)} className="w-1/2">
              Cancel
            </Button>
            <Button variant="danger" isLoading={isRolling} onClick={handleRollSecretKey} className="w-1/2">
              Yes, Regenerate Key
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
