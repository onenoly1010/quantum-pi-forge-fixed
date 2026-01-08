import { initServerTracing } from '@/lib/server-tracing';

export async function register() {
  // Initialize server-side tracing
  initServerTracing();
}