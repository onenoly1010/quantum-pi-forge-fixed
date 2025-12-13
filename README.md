# Quantum Pi Forge

A Next.js application integrating Pi Network authentication with Ethereum blockchain functionality, enabling secure user authentication and wallet linking for the OINIO sovereign economy.

## Features

- ✅ **Pi Network Authentication**: Secure login via Pi Browser SDK
- ✅ **JWT Token Management**: Server-side token issuance and validation
- ✅ **Session Persistence**: Automatic session restoration
- ✅ **Protected Routes**: Component-level access control
- ✅ **Ethereum Wallet Linking**: Connect Pi identity to Ethereum addresses
- ✅ **Type-Safe Implementation**: Full TypeScript support
- ✅ **SSR Compatible**: Next.js 13+ App Router with proper client/server separation

## Tech Stack

- **Framework**: Next.js 13.5+
- **Language**: TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Authentication**: Pi Browser SDK
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Pi Browser (for full functionality)
- Backend API server (see Backend Requirements below)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/onenoly1010/quantum-pi-forge-fixed.git
cd quantum-pi-forge-fixed
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Set to 'true' for Pi testnet, 'false' for mainnet
NEXT_PUBLIC_PI_SANDBOX=true

# Your backend API URL
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in Pi Browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
quantum-pi-forge-fixed/
├── app/
│   ├── layout.tsx          # Root layout with PiAuthProvider
│   ├── page.tsx            # Home page with authentication demo
│   └── globals.css         # Global styles
├── components/
│   ├── PiAuthButton.tsx    # Login/logout button component
│   ├── ProtectedRoute.tsx  # Route protection wrapper
│   └── ui/                 # Reusable UI components
├── contexts/
│   └── PiAuthContext.tsx   # Authentication state management
├── lib/
│   ├── pi-sdk.ts           # Pi SDK wrapper functions
│   ├── pi-types.ts         # TypeScript type definitions
│   └── utils.ts            # Utility functions
├── .env.example            # Environment variables template
├── PI_AUTH_SETUP.md        # Detailed setup documentation
└── README.md               # This file
```

## Usage

### Authentication Button

Add the authentication button to any component:

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

### Using Authentication Context

Access authentication state:

```tsx
'use client';

import { usePiAuth } from '@/contexts/PiAuthContext';

export default function MyComponent() {
  const { isAuthenticated, user, login, logout } = usePiAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login with Pi</button>
      )}
    </div>
  );
}
```

### Protected Routes

Restrict access to authenticated users:

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### Making Authenticated API Calls

```tsx
'use client';

import { usePiAuth } from '@/contexts/PiAuthContext';

export default function DataFetcher() {
  const { jwtToken } = usePiAuth();

  const fetchData = async () => {
    const response = await fetch('/api/data', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    });
    return response.json();
  };

  // ...
}
```

## Backend Requirements

The backend must implement these REST API endpoints:

### POST /api/auth/login
- Accepts: `{ piUid, username, accessToken }`
- Verifies Pi access token with Pi Network API
- Returns: `{ jwtToken, user }`

### POST /api/auth/verify
- Accepts: `Authorization: Bearer <jwt>`
- Verifies JWT signature and expiration
- Returns: `200 OK` or `401 Unauthorized`

### POST /api/auth/link-wallet
- Accepts: `{ ethereumAddress, signature }`
- Links Ethereum address to Pi UID
- Returns: `{ success: true }`

For detailed backend implementation, see [PI_AUTH_SETUP.md](./PI_AUTH_SETUP.md)

## Security Features

- ✅ JWT token-based authentication
- ✅ Token verification on every request
- ✅ Secure token storage in localStorage
- ✅ Server-side Pi token validation
- ✅ Protected route access control
- ✅ Session expiration handling
- ✅ No security vulnerabilities (CodeQL verified)

## Documentation

- **[PI_AUTH_SETUP.md](./PI_AUTH_SETUP.md)**: Complete setup and usage guide
- **[.env.example](./.env.example)**: Environment configuration template

## Development

### Running Linter

```bash
npm run lint
```

### Building

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

## Troubleshooting

**Issue**: "Pi SDK not available"
- **Solution**: Open the app in Pi Browser, not a regular browser

**Issue**: "Backend authentication failed"
- **Solution**: Verify `NEXT_PUBLIC_BACKEND_URL` in `.env.local` and ensure backend is running

**Issue**: Token expired
- **Solution**: Logout and login again

For more troubleshooting tips, see [PI_AUTH_SETUP.md](./PI_AUTH_SETUP.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: onenoly1010

## Acknowledgments

- Pi Network for the authentication SDK
- Next.js team for the amazing framework
- Radix UI for accessible components
