'use client';
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatINR } from '@/lib/utils';
import { Download, Copy, Check, Volume2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

interface QrDisplayProps {
  payload: string;
  title?: string;
  amount?: number;
  vpa?: string;
  merchantName?: string;
  showSoundboxTest?: boolean;
}

export function QrDisplay({
  payload,
  title,
  amount,
  vpa = 'dejoiypay.merchant@icici',
  merchantName = 'DejoiY Technologies Pvt Ltd',
  showSoundboxTest = true,
}: QrDisplayProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(url => setQrUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [payload]);

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `dejoiypay-qr-${Date.now()}.png`;
    a.click();
  };

  const simulateSoundboxAudio = () => {
    setSoundPlaying(true);
    if ('speechSynthesis' in window) {
      const amtStr = amount ? `${amount} rupaye` : 'bhugtan';
      const utterance = new SpeechSynthesisUtterance(`DejoiY Pay par ${amtStr} prapt hue.`);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.onend = () => setSoundPlaying(false);
      utterance.onerror = () => setSoundPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setSoundPlaying(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Brand Header */}
      <div className="bg-slate-900 text-white p-4 text-center">
        <div className="flex items-center justify-center space-x-1.5 mb-1">
          <span className="font-bold tracking-tight text-sm">DEJOIY</span>
          <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider">
            PAY
          </span>
        </div>
        <p className="text-xs text-slate-300 font-medium truncate">{merchantName}</p>
        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{vpa}</p>
      </div>

      {/* QR Canvas Area */}
      <div className="p-6 text-center flex flex-col items-center bg-slate-50/50 dark:bg-slate-950/20">
        {amount && (
          <div className="mb-3 text-center">
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
              Pay Exact Amount
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {formatINR(amount)}
            </div>
          </div>
        )}

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm relative">
          {qrUrl ? (
            <img src={qrUrl} alt="UPI Payment QR Code" className="w-52 h-52 object-contain" />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">Generating QR...</div>
          )}
          {/* Center UPI Logo Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow text-[9px] font-bold text-slate-800">
              UPI
            </div>
          </div>
        </div>

        {title && <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 font-medium">{title}</p>}

        {/* Accepted Payment Apps Indicator */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3 w-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Scan with Google Pay, PhonePe, Paytm, BHIM</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="w-full text-xs">
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied' : 'Copy UPI Link'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="w-full text-xs">
            <Download className="w-3.5 h-3.5 mr-1" />
            Download QR
          </Button>
        </div>

        {showSoundboxTest && (
          <Button
            variant="secondary"
            size="sm"
            onClick={simulateSoundboxAudio}
            disabled={soundPlaying}
            className="w-full text-xs flex items-center justify-center"
          >
            <Volume2 className={`w-3.5 h-3.5 mr-1.5 ${soundPlaying ? 'text-emerald-500 animate-pulse' : ''}`} />
            {soundPlaying ? 'Playing Soundbox Notification...' : 'Test DejoiY Soundbox Alert'}
          </Button>
        )}
      </div>
    </div>
  );
}
