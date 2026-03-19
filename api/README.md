# Quantum Pi Forge - Unified API

The Unified API serves as the nervous system connecting all four pillars of Quantum Pi Forge: Oracle Engine, Pi Bridge, Identity System, and iNFT Protocol. It provides RESTful endpoints for authentication, soul management, oracle readings, iNFT operations, and payment processing.

## Architecture

The API is built with:

- **Express.js** - Web framework
- **MongoDB** - Primary database
- **JWT** - Authentication tokens
- **Joi** - Request validation
- **Winston** - Structured logging
- **Pi Network API** - Payment processing

## Authentication

The API uses unified authentication combining:

- **Pi Network** authentication for user identity
- **OINIO Soul** signatures for ownership verification
- **JWT tokens** for session management

### Authentication Flow

1. User authenticates with Pi Network
2. Receives JWT token for API access
3. Links OINIO soul to account via signature
4. Subsequent requests use JWT + soul signatures as needed

## API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/login`

Authenticate with Pi Network token.

**Request:**

```json
{
  "piToken": "pi_token_here",
  "userInfo": {
    "username": "user123",
    "email": "user@example.com",
    "avatar": "https://..."
  }
}
```

**Response:**

```json
{
  "success": true,
  "user": { ... },
  "token": "jwt_token_here",
  "session": { ... }
}
```

#### POST `/api/auth/refresh`

Refresh JWT token.

**Request:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST `/api/auth/logout`

Destroy user session.

#### GET `/api/auth/me`

Get current user profile.

### Souls (`/api/souls`)

#### GET `/api/souls/:soulId`

Get soul by ID.

#### PUT `/api/souls/:soulId`

Update soul metadata (requires ownership signature).

**Request:**

```json
{
  "updates": {
    "name": "New Soul Name",
    "description": "Updated description"
  },
  "signature": "signature_here",
  "message": "message_here"
}
```

#### POST `/api/souls/:soulId/link`

Link soul to user account.

#### GET `/api/souls/:soulId/infts`

Get iNFTs owned by soul.

### Oracle (`/api/oracle`)

#### POST `/api/oracle/reading`

Generate oracle reading.

**Request:**

```json
{
  "soulId": "soul_id_here",
  "type": "general|love|career|spiritual|health",
  "options": { ... }
}
```

**Response:**

```json
{
  "readingId": "reading_id",
  "soulId": "soul_id",
  "type": "general",
  "content": { ... },
  "metadata": { ... }
}
```

#### GET `/api/oracle/reading/:id`

Get oracle reading by ID.

#### GET `/api/oracle/readings`

Get readings for authenticated user.

### iNFT (`/api/inft`)

#### POST `/api/inft/mint`

Mint new iNFT.

**Request:**

```json
{
  "soulId": "soul_id_here",
  "oracleReadingId": "reading_id_here",
  "metadata": {
    "name": "My iNFT",
    "description": "Description"
  }
}
```

#### GET `/api/inft/:tokenId`

Get iNFT by token ID.

#### POST `/api/inft/:tokenId/evolve`

Evolve iNFT (requires ownership signature).

**Request:**

```json
{
  "evolutionData": { ... },
  "signature": "signature_here",
  "message": "message_here"
}
```

#### GET `/api/inft/:tokenId/memory`

Get iNFT memory.

#### POST `/api/inft/:tokenId/memory`

Add memory to iNFT.

### Payments (`/api/payments`)

#### POST `/api/payments/create`

Create Pi Network payment.

**Request:**

```json
{
  "amount": 10.5,
  "currency": "PI",
  "metadata": {
    "description": "iNFT Minting",
    "productId": "inft_mint",
    "inftId": "token_id"
  }
}
```

#### POST `/api/payments/verify`

Verify payment completion.

**Request:**

```json
{
  "paymentId": "payment_id_here"
}
```

#### GET `/api/payments/:paymentId`

Get payment details.

#### POST `/api/payments/webhook`

Pi Network webhook endpoint (internal).

### Health (`/api/health`)

#### GET `/api/health`

Basic health check.

#### GET `/api/health/detailed`

Detailed health check with component status.

#### GET `/api/health/ready`

Readiness probe.

#### GET `/api/health/live`

Liveness probe.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": { ... }
  }
}
```

## Rate Limiting

- Oracle readings: 100 per hour per soul
- General API: 100 requests per 15 minutes per IP
- Authentication: 10 attempts per minute per IP

## Security

- All requests validated with Joi schemas
- Sensitive operations require cryptographic signatures
- JWT tokens expire in 24 hours
- CORS configured for allowed origins
- Request logging and audit trails

## Environment Variables

Required environment variables:

```env
# Server
PORT=3001
HOST=localhost
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret
PI_WEBHOOK_SECRET=your_webhook_secret

# Database
DATABASE_URL=mongodb://localhost:27017/quantumpiforge
DATABASE_NAME=quantumpiforge

# Pi Network
PI_API_KEY=your_pi_api_key
PI_APP_ID=your_pi_app_id
PI_SANDBOX=true

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com/
SOUL_REGISTRY_ADDRESS=0x...
HYBRID_NFT_ADDRESS=0x...

# Features
ORACLE_ENABLED=true
ENABLE_MINTING=true
ENABLE_EVOLUTION=true
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Testing

The API includes comprehensive tests:

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Monitoring

Health endpoints provide monitoring data:

- Database connectivity
- Service dependencies
- Performance metrics
- Error rates

## Deployment

The API is designed for deployment on:

- **Vercel** - Serverless functions
- **Docker** - Containerized deployment
- **Kubernetes** - Orchestrated deployment

## Integration

The API integrates with:

- **Pi Network** - Payment processing
- **Polygon** - Blockchain interactions
- **IPFS** - Decentralized storage
- **MongoDB** - Data persistence
- **Redis** - Caching and sessions

## Contributing

1. Follow the established patterns
2. Add comprehensive tests
3. Update documentation
4. Use TypeScript types
5. Validate all inputs
6. Log security events

## License

This API is part of the Quantum Pi Forge system.
