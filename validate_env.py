#!/usr/bin/env python3
"""
🌀 ENVIRONMENT VALIDATOR
Validates all required environment variables for Quantum Pi Forge
"""

import os
from dotenv import load_dotenv

# Explicitly load .env.local
load_dotenv('.env.local')

def validate_env():
    """Validate all environment variables."""
    print("🌀 QUANTUM PI FORGE - ENVIRONMENT VALIDATION")
    print("=" * 60)

    # Required variables
    required_vars = {
        'SPONSOR_PRIVATE_KEY': 'Sponsor wallet for gasless transactions',
        'POLYGON_RPC_URL': 'Polygon network RPC endpoint',
        'OINIO_TOKEN_ADDRESS': 'OINIO token contract address',
        'DEEPSEEK_API_KEY': 'DeepSeek AI API key',
        'NEXTAUTH_SECRET': 'NextAuth secret for sessions',
        'NEXT_PUBLIC_CHAIN_ID': 'Blockchain chain ID',
    }

    # Optional but recommended variables
    optional_vars = {
        'GITHUB_CLIENT_ID': 'GitHub OAuth client ID',
        'GITHUB_CLIENT_SECRET': 'GitHub OAuth client secret',
        'SUPABASE_URL': 'Supabase database URL',
        'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key',
        'STRIPE_SECRET_KEY': 'Stripe payment secret key',
        'RESEND_API_KEY': 'Email service API key',
        'DEPLOYER_PRIVATE_KEY': 'Contract deployment wallet',
        'ZERO_G_RPC_URL': '0G network RPC endpoint',
        'XAI_API_KEY': 'XAI API key',
        'PI_API_KEY': 'Pi Network API key',
    }

    all_good = True

    print("🔴 REQUIRED VARIABLES:")
    print("-" * 30)
    for var, desc in required_vars.items():
        value = os.getenv(var)
        if value and value != 'your_' + var.lower() + '_here' and not var.lower().startswith('your_'):
            print(f"✅ {var}: Configured ({desc})")
        else:
            print(f"❌ {var}: MISSING or INVALID ({desc})")
            all_good = False

    print("\n🟡 OPTIONAL VARIABLES:")
    print("-" * 30)
    for var, desc in optional_vars.items():
        value = os.getenv(var)
        if value and value != 'your_' + var.lower() + '_here' and not var.lower().startswith('your_'):
            print(f"✅ {var}: Configured ({desc})")
        else:
            print(f"⚠️  {var}: Not configured ({desc})")

    print("\n" + "=" * 60)
    if all_good:
        print("🎉 ALL REQUIRED ENVIRONMENT VARIABLES ARE CONFIGURED!")
        print("🚀 Ready for deployment")
    else:
        print("⚠️  SOME REQUIRED ENVIRONMENT VARIABLES ARE MISSING!")
        print("📋 Please configure the missing variables in .env.local")
        print("🔗 Check .env.example for guidance")

    print("=" * 60)

    # Check for security issues
    print("\n🔒 SECURITY CHECK:")
    print("-" * 20)

    sponsor_key = os.getenv('SPONSOR_PRIVATE_KEY', '')
    if len(sponsor_key) < 64:
        print("⚠️  SPONSOR_PRIVATE_KEY appears to be invalid (too short)")
        all_good = False
    else:
        print("✅ SPONSOR_PRIVATE_KEY format appears valid")

    deepseek_key = os.getenv('DEEPSEEK_API_KEY', '')
    if not deepseek_key.startswith('sk-proj-'):
        print("⚠️  DEEPSEEK_API_KEY format may be invalid")
    else:
        print("✅ DEEPSEEK_API_KEY format appears valid")

    return all_good

if __name__ == "__main__":
    success = validate_env()
    exit(0 if success else 1)