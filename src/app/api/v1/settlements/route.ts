import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';

export async function GET() {
  const settlements = db.getSettlements();
  return NextResponse.json({ settlements });
}

export async function POST() {
  try {
    const batch = db.triggerSettlement();

    recordAuditLog({
      actor: 'merchant_finance',
      action: 'SETTLEMENT_BATCH_PROCESSED',
      entityType: 'settlement',
      entityId: batch.id,
      changes: { netSettled: { old: 0, new: batch.netSettled } },
    });

    return NextResponse.json({ success: true, settlement: batch });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process settlement', message: err.message }, { status: 500 });
  }
}
