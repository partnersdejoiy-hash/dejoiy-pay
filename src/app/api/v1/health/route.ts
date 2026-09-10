import { NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers';

export async function GET() {
  const providers = providerRegistry.list();
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DejoiY Pay API Gateway',
    version: '1.0.0',
    environment: process.env.PAYMENT_ENV || 'test',
    providers: providers.map(p => ({
      id: p.id,
      name: p.name,
      status: p.isConfigured ? 'configured' : 'sandbox_ready',
      supportedMethods: p.supportedMethods,
    })),
  });
}
