# Pi Network Integration

The Pi Network Integration provides complete connectivity between QuantumPiForge and the Pi ecosystem, enabling authentication, payments, and identity mapping.

## Features

- **Authentication**: Pi Browser login and session management
- **Payments**: Pi transaction creation, verification, and webhooks
- **Identity**: Pi user profile mapping to OINIO soul system
- **API Client**: Full Pi Platform API wrapper

## Environment Variables

Required environment variables for Pi integration:

```bash
# Required
PI_API_KEY=your_pi_api_key
PI_APP_ID=your_pi_app_id

# Optional
PI_API_BASE_URL=https://api.pi.network
PI_WEBHOOK_SECRET=your_webhook_secret
PI_SANDBOX=true
PI_APP_NAME=Quantum Pi Forge
PI_APP_DESCRIPTION=OINIO Soul System on Pi Network
PI_API_TIMEOUT=10000
PI_AUTH_TIMEOUT=30000
PI_CACHE_TIMEOUT=300000
```

## Usage

```javascript
import pi from './integrations/pi';

// Initialize SDK
await pi.config.initSDK();

// Authenticate user
const auth = await pi.auth.connect.authenticate(['username']);

// Create payment
const payment = await pi.payments.createPayment({
  amount: 1.00,
  memo: 'OINIO Staking'
});

// Map Pi profile to OINIO identity
const identity = await pi.identity.mapProfile(auth.user);
```

## Architecture

- **auth/**: Authentication and session management
- **payments/**: Payment creation, verification, and webhooks
- **identity/**: Pi to OINIO profile mapping
- **api/**: Pi Platform API client and endpoints
- **config/**: SDK setup and environment configuration
- **tests/**: Integration tests

## Development Mode

When Pi SDK is not available (development), the integration provides demo simulations for all functionality.

## Webhook Handling

Payment webhooks are handled at `/api/pi/webhooks` endpoint. Ensure `PI_WEBHOOK_SECRET` is set for signature verification.

## Integration with Oracle

The Pi integration connects to the OINIO Oracle Engine for:
- Soul signature verification during authentication
- Personality trait mapping for new users
- Payment validation for oracle readings