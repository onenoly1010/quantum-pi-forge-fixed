# 🚀 Quantum Pi Forge - Sovereign Economy Dashboard

A revolutionary gasless staking platform for the OINIO token ecosystem, built with Next.js, TypeScript, and Web3 integration.

## 🌐 Live Demo

**Dashboard**: https://quantum-pi-forge-fixed.vercel.app/dashboard

## ✨ Features

- 🔗 **MetaMask Integration** - Seamless wallet connection
- ⛽ **Gasless Transactions** - Sponsor-covered staking fees
- 📊 **Real-time Balance** - Live OINIO token balance display
- 🎨 **Modern UI** - Beautiful gradient design with glassmorphism
- 🔒 **Secure API** - Production-ready backend validation
- 📱 **Responsive** - Mobile-first design

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Web3**: Ethers.js, MetaMask
- **Blockchain**: Polygon Network
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

1. **MetaMask Wallet** - Install from [metamask.io](https://metamask.io)
2. **Polygon Network** - Add to MetaMask:
   - Network Name: Polygon Mainnet
   - RPC URL: https://polygon-rpc.com
   - Chain ID: 137
   - Currency: MATIC

### Environment Setup

Set these environment variables in your Vercel dashboard:

```env
SPONSOR_PRIVATE_KEY=<dedicated-sponsor-wallet-private-key>
POLYGON_RPC_URL=https://polygon-rpc.com
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
```

### Sponsor Wallet Setup

1. Create a new MetaMask wallet (NEVER use main wallet)
2. Fund with MATIC for gas fees
3. Fund with OINIO tokens for sponsoring stakes
4. Export private key securely

## 🎯 How to Use

1. **Connect Wallet**: Click "Connect MetaMask" and approve
2. **Enter Amount**: Input OINIO amount to stake (0.01 - 10000)
3. **Stake Gasless**: Click "Stake with Gasless Transaction"
4. **Confirm**: Transaction completes without gas fees
5. **View Result**: Success message with PolygonScan link

## 🏗️ Project Structure

```
quantum-pi-forge-fixed/
├── app/
│   ├── api/sponsor-transaction/route.ts  # Gasless staking API
│   ├── dashboard/page.tsx               # Dashboard page
│   ├── globals.css                      # Global styles
│   └── layout.tsx                       # Root layout
├── src/components/
│   └── Dashboard.tsx                    # Main dashboard component
├── public/                              # Static assets
├── package.json                         # Dependencies
└── tailwind.config.ts                   # Tailwind config
```

## 🔧 API Endpoints

### POST `/api/sponsor-transaction`

Sponsors gasless OINIO token transfers.

**Request Body:**
```json
{
  "amount": "100.5",
  "userAddress": "0x1234...abcd"
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x5678...efgh",
  "amount": 100.5,
  "userAddress": "0x1234...abcd",
  "message": "Staking transaction sponsored successfully"
}
```

## 🔒 Security Features

- ✅ Environment variable validation
- ✅ Ethereum address validation
- ✅ Amount limits (0.01 - 10000 OINIO)
- ✅ Sponsor balance checks
- ✅ Error handling without sensitive data leaks
- ✅ Client-side input sanitization

## 🎨 UI Components

Built with shadcn/ui and Tailwind CSS:

- Glassmorphism design
- Responsive grid layout
- Loading states with spinners
- Error/success notifications
- Transaction hash display
- PolygonScan integration

## 🚀 Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Manual Deployment

```bash
npm install
npm run build
npm start
```

## 🧪 Testing

### Local Development

```bash
npm run dev
# Visit http://localhost:3000/dashboard
```

### Build Testing

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is part of the Quantum Pi Forge ecosystem - a sovereign economy platform.

## 🆘 Support

For issues or questions:
- Check browser console for errors
- Verify MetaMask connection
- Ensure Polygon network is selected
- Confirm environment variables are set

## 🎭 The Vision

Quantum Pi Forge represents the future of decentralized economies - where users can participate in staking and governance without the barrier of gas fees. Through sponsored transactions, we make DeFi accessible to everyone, regardless of their financial situation.

**Join the sovereign economy revolution!** 🚀✨