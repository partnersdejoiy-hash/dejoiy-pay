import { NextRequest, NextResponse } from 'next/server';
import { advancedDb } from '@/lib/db/extended';

export async function GET() {
  const plans = advancedDb.getSubscriptions();
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = advancedDb.createSubscriptionPlan(body);
    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
