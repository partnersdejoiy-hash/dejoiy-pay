import { NextRequest, NextResponse } from 'next/server';
import { advancedDb } from '@/lib/db/extended';

export async function GET() {
  const mandates = advancedDb.getMandates();
  return NextResponse.json({ mandates });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'status') {
      const updated = advancedDb.updateMandateStatus(body.id, body.status);
      return NextResponse.json({ success: true, mandate: updated });
    }
    const mandate = advancedDb.createMandate(body);
    return NextResponse.json({ success: true, mandate }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
