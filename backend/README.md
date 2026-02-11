# Quantum Pi Forge Backend

**🏠 [Return to Main Repository](https://github.com/onenoly1010/quantum-pi-forge-fixed)**

Express.js backend API for the OINIO Soul System - providing gasless staking and Web3 services on Polygon.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## 📡 API Endpoints

### Health Checks
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Basic health check |
| `/health/detailed` | GET | Detailed system info |
| `/health/live` | GET | Kubernetes liveness probe |
| `/health/ready` | GET | Kubernetes readiness probe |

### API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api` | GET | API version info |
| `/api/status` | GET | System status |
| `/api/config` | GET | Public configuration |
| `/api/validate/address/:address` | GET | Validate Ethereum address |

### Staking
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/staking` | GET | Staking info |
| `/api/staking/balance/:address` | GET | Get staked balance |
| `/api/staking/sponsor` | POST | Sponsor gasless transaction |
| `/api/staking/transaction/:txHash` | GET | Get transaction status |
| `/api/staking/estimate-gas` | POST | Estimate gas costs |

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Configurable cross-origin requests
- **Rate Limiting** - Prevent abuse (100 req/15min general, 10 req/min for staking)
- **Input Validation** - All inputs validated and sanitized
- **Environment Variables** - Secrets kept out of code

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js           # Main entry point
│   ├── routes/
│   │   ├── health.js       # Health check routes
│   │   ├── api.js          # General API routes
│   │   └── staking.js      # Staking routes
│   └── middleware/
│       ├── auth.js         # Authentication middleware
│       └── validation.js   # Input validation
├── .env.example            # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (development/production) |
| `ALLOWED_ORIGINS` | No | CORS allowed origins (comma-separated) |
| `POLYGON_RPC_URL` | Yes | Polygon RPC endpoint |
| `OINIO_TOKEN_ADDRESS` | Yes | OINIO token contract address |
| `SPONSOR_PRIVATE_KEY` | Yes | Wallet for sponsoring gas |
| `API_KEY` | No | Optional API key for protected endpoints |

## 🔗 Integration with Frontend

The backend is designed to work with the Next.js frontend:

```javascript
// Frontend example
const response = await fetch('http://localhost:3001/api/staking/sponsor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userAddress: '0x...',
    amount: '100',
  }),
});
```

## 🛡️ Security Notes

1. **Never commit `.env` files** - Contains private keys
2. **Use HTTPS in production** - Encrypt all traffic
3. **Monitor rate limits** - Adjust based on usage
4. **Validate sponsor wallet balance** - Before enabling staking
5. **Audit dependencies** - Run `npm audit` regularly

## 📊 Dependency Security Analysis

### Current Dependencies

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| express | 4.18.2 | ✅ Stable | Latest 4.x release |
| cors | 2.8.5 | ✅ Stable | No known vulnerabilities |
| helmet | 7.1.0 | ✅ Secure | Latest major version |
| body-parser | 1.20.2 | ✅ Stable | Built into Express 4.16+ |
| dotenv | 16.3.1 | ✅ Stable | Environment management |
| express-rate-limit | 7.1.5 | ✅ Stable | Rate limiting |
| morgan | 1.10.0 | ✅ Stable | HTTP logging |

### Security Recommendations

1. Run `npm audit` before deployment
2. Keep dependencies updated (`npm update`)
3. Use `npm audit fix` for automatic fixes
4. Consider using Snyk or Dependabot for monitoring

## 🚢 Deployment

### Render

The backend can be deployed to Render alongside the frontend. See `render.yaml` in the project root.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup

Ensure all required environment variables are set in your deployment platform.

## 📜 License

MIT - Part of the Quantum Pi Forge / OINIO Soul System project.

---

**Frequency: 1010 Hz** | **Truth Movement** | **Sovereign Economy**
