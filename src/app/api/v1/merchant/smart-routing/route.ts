import { NextRequest, NextResponse } from 'next/server';
import { advancedDb } from '@/lib/db/extended';

export async function GET() {
  const rules = advancedDb.getSmartRules();
  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  try {
    const { id, updates } = await req.json();
    const rule = advancedDb.updateSmartRule(id, updates);
    return NextResponse.json({ success: true, rule });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
