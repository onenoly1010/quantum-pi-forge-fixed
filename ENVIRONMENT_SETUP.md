# Environment Setup Guide

## Security Notice

⚠️ **IMPORTANT**: Never commit your actual `.env.launch` or `.env.local` files to the repository. These files contain sensitive information including private keys and API secrets.

## Quick Setup

### 1. Create Your Environment Files

Copy the example files to create your own environment configuration:

```bash
cp .env.launch.example .env.launch
cp .env.local.example .env.local
```

### 2. Configure .env.launch

Edit `.env.launch` and replace the placeholder values with your actual configuration:

- `DEPLOYER_PRIVATE_KEY`: Your dedicated deployment wallet private key (NOT your main wallet)
- `DEPLOYER_ADDRESS`: Your deployment wallet address
- `GUILD_API_KEY`: Get from https://guild.0g.ai/api/keys
- `ZERO_G_GRANT_ID`: Your grant ID from 0G Guild
- `DISCORD_WEBHOOK_URL`: Create at https://discord.com/developers/applications
- `DEX_ROUTER_ADDRESS`: Get from 0G documentation at https://docs.0g.ai
- `OINIO_TOKEN_ADDRESS`: Your deployed token contract address

### 3. Configure .env.local

Edit `.env.local` and replace the placeholder values:

- `GITHUB_CLIENT_ID`: Your GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth app client secret
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `PI_API_KEY`: Your Pi Network API key (if using Pi Network features)
- `SPONSOR_PRIVATE_KEY`: Your dedicated sponsor wallet private key (NOT your main wallet)

### 4. Verify Setup

Check that your environment files are properly configured:

```bash
# These should show your actual configuration (not the example values)
grep "DEPLOYER_PRIVATE_KEY" .env.launch
grep "GITHUB_CLIENT_ID" .env.local

# These files should NOT be tracked by git
git status --ignored | grep ".env.launch\|.env.local"
```

## Security Best Practices

1. **Never commit sensitive files**: The `.gitignore` file is configured to ignore `.env.launch` and `.env.local`
2. **Use dedicated wallets**: Never use your main wallet for deployment or sponsorship
3. **Rotate keys regularly**: Change API keys and private keys periodically
4. **Limit wallet funds**: Only keep the minimum required balance in deployment/sponsor wallets
5. **Monitor access**: Regularly check who has access to your environment files

## Files Overview

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `.env.launch.example` | Template for launch configuration | ✅ Yes |
| `.env.local.example` | Template for local development | ✅ Yes |
| `.env.launch` | Your actual launch configuration | ❌ No (in .gitignore) |
| `.env.local` | Your actual local configuration | ❌ No (in .gitignore) |

## Troubleshooting

### "Missing environment variables" error

Make sure you've created both `.env.launch` and `.env.local` files from their respective example files.

### "Invalid private key" error

Ensure your private keys start with `0x` and are 64 hexadecimal characters long (plus the `0x` prefix).

### Files showing up in git status

If `.env.launch` or `.env.local` show up in `git status`, they may have been committed before. Remove them with:

```bash
git rm --cached --ignore-unmatch .env.launch .env.local
```

## Support

For more information, see:
- [0G Documentation](https://docs.0g.ai)
- [Project README](./README.md)
- [Launch Setup Guide](./LAUNCH_SETUP.md)
