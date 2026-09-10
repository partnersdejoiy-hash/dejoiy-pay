'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatINR } from '@/lib/utils';
import {
  ShieldCheck,
  KeyRound,
  Sliders,
  Fingerprint,
  Smartphone,
  Building,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function ConsumerSecurityPage() {
  const [dailyLimit, setDailyLimit] = useState(100000);
  const [perTxnLimit, setPerTxnLimit] = useState(50000);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Pin Modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (newPin.length !== 6) {
      setPinError('New PIN must be 6 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('New PINs do not match');
      return;
    }

    setPinSuccess('UPI PIN updated successfully!');
    setTimeout(() => {
      setShowPinModal(false);
      setPinSuccess('');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Security & UPI Limits
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Bank-grade encryption, transaction safety limits, and PIN controls
        </p>
      </div>

      {/* UPI PIN & Authentication */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">6-Digit UPI PIN</h3>
              <p className="text-xs text-slate-500">Configured with NPCI Unified Payments Interface</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowPinModal(true)} className="text-xs h-8">
            Reset PIN
          </Button>
        </div>

        {/* Biometric Toggle */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Fingerprint className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100">Biometric App Lock</h3>
              <p className="text-[11px] text-slate-500">Require fingerprint/FaceID on app open</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={biometricEnabled}
            onChange={e => setBiometricEnabled(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
          />
        </div>
      </Card>

      {/* Transaction Safety Limits */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Transaction Velocity Limits</h3>
        </div>

        {/* Daily Limit */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Daily UPI Spending Limit:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatINR(dailyLimit)}</span>
          </div>
          <input
            type="range"
            min={10000}
            max={100000}
            step={5000}
            value={dailyLimit}
            onChange={e => setDailyLimit(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        {/* Per Transaction Limit */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Single Transaction Cap:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatINR(perTxnLimit)}</span>
          </div>
          <input
            type="range"
            min={5000}
            max={50000}
            step={2500}
            value={perTxnLimit}
            onChange={e => setPerTxnLimit(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>
      </Card>

      {/* Linked Bank Accounts */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Linked Bank Accounts</h3>
          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
            2 Accounts Active
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-slate-600" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">HDFC Bank Ltd</p>
                <p className="text-[11px] text-slate-400 font-mono">•••• •••• 4092 &bull; IFSC: HDFC0000128</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">PRIMARY</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-slate-600" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">State Bank of India</p>
                <p className="text-[11px] text-slate-400 font-mono">•••• •••• 9918 &bull; IFSC: SBIN0001824</p>
              </div>
            </div>
            <button className="text-[11px] text-emerald-600 font-medium hover:underline">Set Primary</button>
          </div>
        </div>
      </Card>

      {/* Change Pin Modal */}
      <Modal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        title="Reset UPI PIN"
        description="Verify your current PIN before setting a new 6-digit credential."
        maxWidth="sm"
      >
        {pinSuccess ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{pinSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleChangePin} className="space-y-4">
            <Input
              label="Current 6-Digit PIN"
              type="password"
              maxLength={6}
              placeholder="••••••"
              value={oldPin}
              onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))}
              required
            />
            <Input
              label="New 6-Digit PIN"
              type="password"
              maxLength={6}
              placeholder="••••••"
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              required
            />
            <Input
              label="Confirm New PIN"
              type="password"
              maxLength={6}
              placeholder="••••••"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              required
            />
            {pinError && <p className="text-xs text-rose-600 font-medium">{pinError}</p>}
            <div className="flex space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowPinModal(false)} className="w-1/2">
                Cancel
              </Button>
              <Button type="submit" className="w-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                Update PIN
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
