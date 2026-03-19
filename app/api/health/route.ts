import { NextResponse } from "next/server";
import { trace } from "@opentelemetry/api";

export async function GET() {
  const tracer = trace.getTracer("quantum-pi-forge-health");

  return tracer.startActiveSpan("health-check", async (span) => {
    try {
      const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        services: {
          api: "operational",
          blockchain: "pending_check",
          staking: "ready",
        },
        chain: {
          name: "0G Aristotle",
          id: 16661,
          rpc: "https://evmrpc.0g.ai",
        },
        uptime: process.uptime(),
      };

      span.setAttributes({
        "health.status": health.status,
        "health.uptime": health.uptime,
        "health.services.api": health.services.api,
        "health.services.staking": health.services.staking,
        "blockchain.chain_id": health.chain.id,
        "blockchain.rpc_url": health.chain.rpc,
        "quantum.operation": "health-check",
      });

      // Quick RPC check
      try {
        const rpcResponse = await fetch("https://evmrpc.0g.ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_chainId",
            params: [],
            id: 1,
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (rpcResponse.ok) {
          const data = await rpcResponse.json();
          if (data.result === "0x4115") {
            health.services.blockchain = "operational";
            span.setAttribute("health.services.blockchain", "operational");
            span.setAttribute("blockchain.rpc_status", "connected");
          } else {
            health.services.blockchain = "mismatch";
            span.setAttribute("health.services.blockchain", "mismatch");
            span.setAttribute("blockchain.rpc_status", "chain_id_mismatch");
          }
        } else {
          health.services.blockchain = "unreachable";
          span.setAttribute("health.services.blockchain", "unreachable");
          span.setAttribute("blockchain.rpc_status", "http_error");
        }
      } catch (error) {
        health.services.blockchain = "degraded";
        span.setAttribute("health.services.blockchain", "degraded");
        span.setAttribute("blockchain.rpc_status", "timeout");
        span.recordException(error as Error);
      }

      span.setStatus({ code: 0 }); // OK
      return NextResponse.json(health, {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 1, message: "Health check failed" });
      throw error;
    } finally {
      span.end();
    }
  });
}
