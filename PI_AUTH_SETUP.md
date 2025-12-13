# Pi SDK Authentication Setup Guide

This guide explains how to use the Pi Network authentication system in Quantum Pi Forge.

## Overview

The Pi SDK authentication system provides:
- Secure user authentication via Pi Network
- JWT token management
- Protected routes and components
- Session persistence

## Architecture

### Components

1. **lib/pi-sdk.ts** - Pi SDK wrapper functions
   - `initializePiSDK()` - Initialize the Pi SDK
   - `authenticateWithPi()` - Trigger Pi authentication flow
   - `createPiPayment()` - Create Pi Network payments
   - `isPiSDKAvailable()` - Check if SDK is available

2. **contexts/PiAuthContext.tsx** - Global authentication state
   - Manages user session
   - Handles JWT token storage
   - Provides authentication hooks

3. **components/PiAuthButton.tsx** - Login/logout UI
   - Shows connection button when logged out
   - Displays user info when authenticated
   - Handles logout action

4. **components/ProtectedRoute.tsx** - Route protection
   - Restricts access to authenticated users only
   - Shows loading state during initialization
   - Custom fallback content

## Usage

### 1. Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# Pi Network Configuration
NEXT_PUBLIC_PI_SANDBOX=true  # true for testnet, false for mainnet

# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://pi-forge-backend.up.railway.app
```

### 2. Using the Authentication Button

Add the button to any component:

```tsx
import { PiAuthButton } from '@/components/PiAuthButton';

export default function Header() {
  return (
    <header>
      <PiAuthButton />
    </header>
  );
}
```

### 3. Using the Authentication Context

Access authentication state in any component:

```tsx
'use client';

import { usePiAuth } from '@/contexts/PiAuthContext';

export default function MyComponent() {
  const { isAuthenticated, user, jwtToken, login, logout } = usePiAuth();

  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 4. Protecting Routes/Components

Wrap protected content with the ProtectedRoute component:

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        {/* Only authenticated users can see this */}
        <h1>Dashboard</h1>
      </div>
    </ProtectedRoute>
  );
}
```

With custom fallback:

```tsx
<ProtectedRoute 
  fallback={<div>Please login to continue</div>}
>
  <SecretContent />
</ProtectedRoute>
```

### 5. Making Authenticated API Calls

Use the JWT token for backend requests:

```tsx
'use client';

import { usePiAuth } from '@/contexts/PiAuthContext';

export default function MyComponent() {
  const { jwtToken } = usePiAuth();

  const fetchData = async () => {
    const response = await fetch('/api/data', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    });
    const data = await response.json();
    return data;
  };

  // ...
}
```

## Backend Integration

The backend must implement these endpoints:

### POST /api/auth/login

**Request:**
```json
{
  "piUid": "string",
  "username": "string",
  "accessToken": "string"
}
```

**Process:**
1. Verify the Pi access token with Pi Network API: `https://api.minepi.com/v2/me`
2. Create or update user record in database
3. Generate JWT token with payload: `{ piUid, username, ethereumAddress? }`

**Response:**
```json
{
  "jwtToken": "string",
  "user": {
    "piUid": "string",
    "username": "string",
    "ethereumAddress": "string | null"
  }
}
```

### POST /api/auth/verify

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Process:**
1. Verify JWT signature
2. Check token expiration

**Response:**
- `200 OK` - Token is valid
- `401 Unauthorized` - Token is invalid/expired

### POST /api/auth/link-wallet

**Request:**
```json
{
  "ethereumAddress": "string",
  "signature": "string"
}
```

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Process:**
1. Verify JWT token
2. Verify signature proves ownership of Ethereum address
3. Link address to authenticated Pi UID in database

**Response:**
```json
{
  "success": true
}
```

## Pi SDK Notes

- The Pi SDK is loaded via the Pi Browser and accessed through `window.Pi`
- Not available in standard browsers (development mode will show warnings)
- To test locally, use Pi Browser mobile app or Pi Testnet Browser
- The SDK requires user interaction to trigger authentication

## Security Considerations

1. **JWT Token Storage**: Stored in localStorage with key `oinio_jwt`
2. **Token Refresh**: Implement token refresh logic in your backend
3. **HTTPS Only**: Always use HTTPS in production
4. **Token Expiration**: Set appropriate expiration times
5. **Backend Verification**: Always verify Pi access tokens server-side

## Testing

### Local Development

1. Build the project:
```bash
npm run build
```

2. Start development server:
```bash
npm run dev
```

3. Open in Pi Browser to test authentication flow

### Production

Deploy to production and access via Pi Browser to enable full Pi SDK functionality.

## Troubleshooting

**Issue**: "Pi SDK not available"
- **Solution**: Open the app in Pi Browser, not a regular browser

**Issue**: "Backend authentication failed"
- **Solution**: Verify backend URL in `.env.local` and ensure backend is running

**Issue**: Token expired
- **Solution**: Logout and login again, or implement token refresh

**Issue**: Protected content not showing after login
- **Solution**: Check browser console for errors, verify JWT token is stored in localStorage
