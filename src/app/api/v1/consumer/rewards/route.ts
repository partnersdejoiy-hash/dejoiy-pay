import { NextRequest, NextResponse } from 'next/server';
import { advancedDb } from '@/lib/db/extended';

export async function GET() {
  const rewards = advancedDb.getRewards();
  return NextResponse.json({ rewards });
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const reward = advancedDb.scratchReward(id);
    return NextResponse.json({ success: true, reward });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
