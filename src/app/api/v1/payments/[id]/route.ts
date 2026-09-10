import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const transaction = db.getTransactionById(params.id);
  if (!transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  return NextResponse.json({ transaction });
}
