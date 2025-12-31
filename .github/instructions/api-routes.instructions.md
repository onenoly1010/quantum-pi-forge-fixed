---
description: "API routes and server-side code guidelines for Next.js 14 App Router"
applyTo: "app/api/**/*.{ts,js}"
---

# API Routes Instructions (Next.js 14)

## Route Handler Structure

Next.js 14 uses App Router with route handlers in `app/api/`:

```typescript
// app/api/endpoint/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Handle GET request
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { success: false, error: 'Missing required field' },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await processData(body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Input Validation

**ALWAYS** validate all inputs on the server side:

```typescript
function validateAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function validateAmount(amount: number, min: number, max: number): boolean {
  return typeof amount === 'number' && 
         !isNaN(amount) && 
         amount >= min && 
         amount <= max;
}

export async function POST(request: Request) {
  const { address, amount } = await request.json();
  
  if (!validateAddress(address)) {
    return NextResponse.json(
      { success: false, error: 'Invalid Ethereum address' },
      { status: 400 }
    );
  }
  
  if (!validateAmount(amount, 0.01, 10000)) {
    return NextResponse.json(
      { success: false, error: 'Amount must be between 0.01 and 10000' },
      { status: 400 }
    );
  }
  
  // Process validated data
}
```

## Environment Variables

Access environment variables securely:

```typescript
// Server-side only
const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY;
const rpcUrl = process.env.POLYGON_RPC_URL;
const tokenAddress = process.env.OINIO_TOKEN_ADDRESS;

// Validate before use
if (!sponsorPrivateKey || !rpcUrl || !tokenAddress) {
  throw new Error('Missing required environment variables');
}
```

**NEVER** expose sensitive environment variables to the client.

## Blockchain Interactions

### Ethers.js v6 Pattern

```typescript
import { ethers } from 'ethers';

export async function POST(request: Request) {
  // Initialize provider
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  
  // Create wallet from private key
  const sponsorWallet = new ethers.Wallet(
    process.env.SPONSOR_PRIVATE_KEY!,
    provider
  );
  
  // Connect to contract
  const tokenContract = new ethers.Contract(
    process.env.OINIO_TOKEN_ADDRESS!,
    ['function transfer(address to, uint256 amount) returns (bool)'],
    sponsorWallet
  );
  
  try {
    // Execute transaction
    const tx = await tokenContract.transfer(recipientAddress, amount);
    const receipt = await tx.wait();
    
    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    return NextResponse.json(
      { success: false, error: 'Transaction failed' },
      { status: 500 }
    );
  }
}
```

## Error Handling

### User-Facing Errors
```typescript
// ❌ DON'T expose sensitive details
return NextResponse.json(
  { error: 'Database connection failed at 192.168.1.1' },
  { status: 500 }
);

// ✅ DO provide generic, helpful messages
return NextResponse.json(
  { error: 'Unable to process request. Please try again.' },
  { status: 500 }
);
```

### Logging
```typescript
// Log detailed errors server-side
console.error('API Error:', {
  endpoint: '/api/sponsor-transaction',
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
});

// Return safe error to client
return NextResponse.json(
  { success: false, error: 'Transaction failed' },
  { status: 500 }
);
```

## Response Format

Maintain consistent response structure:

```typescript
// Success response
{
  "success": true,
  "data": {
    // Response data
  }
}

// Error response
{
  "success": false,
  "error": "Error message"
}
```

## Rate Limiting (Future Enhancement)

Consider adding rate limiting for production:

```typescript
// Example with simple in-memory store
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit: number = 10): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}
```

## Security Checklist

Before deploying any API route:
- [ ] All inputs are validated
- [ ] Error messages don't leak sensitive info
- [ ] Environment variables are checked
- [ ] Ethereum addresses are validated
- [ ] Transaction amounts are within expected ranges
- [ ] Private keys are never logged or exposed
- [ ] CORS is configured if needed
- [ ] Rate limiting is considered

## Testing

Test API routes manually:

```bash
# POST request
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# GET request
curl http://localhost:3000/api/endpoint
```

## DON'Ts

- ❌ Don't expose private keys or sensitive data
- ❌ Don't skip input validation
- ❌ Don't return detailed error messages to clients
- ❌ Don't trust client-side validation alone
- ❌ Don't use environment variables without validation
- ❌ Don't log sensitive information (private keys, user data)
- ❌ Don't allow unlimited transaction amounts
