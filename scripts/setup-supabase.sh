#!/bin/bash

# Quantum Pi Forge - Supabase Setup Script
# This script helps set up Supabase for the Quantum Pi Forge project

echo "🔮 Quantum Pi Forge - Supabase Setup"
echo "===================================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "Please login to Supabase:"
    supabase login
fi

echo "📋 Available Supabase projects:"
supabase projects list

echo ""
echo "🚀 To set up a new Supabase project:"
echo "1. Go to https://supabase.com/dashboard"
echo "2. Create a new project"
echo "3. Go to Settings > API"
echo "4. Copy the Project URL and anon/public key"
echo "5. Update the .env file in fastapi/ directory"
echo ""
echo "📄 To run database migrations:"
echo "supabase db push"
echo ""
echo "🔗 Or manually execute the SQL in supabase/migrations/001_initial_schema.sql"
echo ""
echo "✅ Setup complete! Update your .env file with real credentials."