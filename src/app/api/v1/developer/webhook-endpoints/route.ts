import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const createWebhookSchema = z.object({
  url: z.string().url('A valid HTTPS endpoint URL is required'),
  events: z.array(z.string()).min(1, 'Select at least one webhook event'),
});

export async function GET() {
  const endpoints = db.getWebhooks();
  const logs = db.getWebhookLogs();
  return NextResponse.json({ endpoints, logs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createWebhookSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { url, events } = validation.data;
    const endpoint = db.createWebhook(url, events);
    return NextResponse.json({ success: true, endpoint }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
