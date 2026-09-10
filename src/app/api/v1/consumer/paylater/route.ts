import { NextRequest, NextResponse } from 'next/server';
import { advancedDb } from '@/lib/db/extended';

export async function GET() {
  const account = advancedDb.getPayLater();
  return NextResponse.json({ payLater: account });
}

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    const updated = advancedDb.repayPayLater(parseFloat(amount));
    return NextResponse.json({ success: true, payLater: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
