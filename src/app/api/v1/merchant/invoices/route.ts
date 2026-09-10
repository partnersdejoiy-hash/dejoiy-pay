import { NextRequest, NextResponse } from 'next/server';
import { advancedDb } from '@/lib/db/extended';

export async function GET() {
  const invoices = advancedDb.getInvoices();
  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoice = advancedDb.createInvoice(body);
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
