import { NextResponse } from 'next/server';

// Required for static export compatibility
export const dynamic = "force-static";
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'operational',
      blockchain: 'pending_check',
      staking: 'ready'
    },
    chain: {
      name: '0G Aristotle',
      id: 16661,
      rpc: 'https://evmrpc.0g.ai'
    },
    uptime: process.uptime()
  };

  // Quick RPC check
  try {
    const rpcResponse = await fetch('https://evmrpc.0g.ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1
      }),
      signal: AbortSignal.timeout(5000)
    });
    
    if (rpcResponse.ok) {
      const data = await rpcResponse.json();
      if (data.result === '0x4115') {
        health.services.blockchain = 'operational';
      }
    }
  } catch {
    health.services.blockchain = 'degraded';
  }

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
