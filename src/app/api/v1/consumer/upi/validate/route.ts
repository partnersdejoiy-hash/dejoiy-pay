import { NextRequest, NextResponse } from 'next/server';
import { validateVpa } from '@/lib/upi/spec';

export async function POST(req: NextRequest) {
  try {
    const { vpa } = await req.json();
    const check = validateVpa(vpa);
    return NextResponse.json(check);
  } catch {
    return NextResponse.json({ isValid: false, error: 'Invalid request' }, { status: 400 });
  }
}
