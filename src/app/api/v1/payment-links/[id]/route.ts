import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const link = db.getPaymentLinkById(params.id);
  if (!link) {
    return NextResponse.json({ error: 'Payment link not found' }, { status: 404 });
  }

  db.incrementPaymentLinkVisit(params.id);
  return NextResponse.json({ paymentLink: link });
}
