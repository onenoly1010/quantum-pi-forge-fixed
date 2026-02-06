# Supabase Configuration for Quantum Pi Forge

## Database Schema

The database consists of the following tables:

### users
- Stores user wallet information and staking statistics
- Tracks total staked amount and transaction count

### transactions
- Records all staking/unstaking activities
- Links to blockchain transactions via hash
- Tracks transaction status and metadata

### staking_pools
- Defines different staking pools with reward rates
- Supports multiple pool configurations

### staking_positions
- Advanced staking position tracking
- Links users to specific pools

## Environment Variables Required

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

## Setup Instructions

1. Create a new Supabase project at https://supabase.com
2. Go to Settings > API to get your URL and anon key
3. Run the migration: `supabase db push`
4. Or execute the SQL in `migrations/001_initial_schema.sql` manually

## API Endpoints

The FastAPI backend provides the following database endpoints:

- `GET /api/database/status` - Check database connection
- `POST /api/users` - Create new user
- `GET /api/users/{wallet_address}` - Get user info
- `POST /api/transactions` - Record transaction
- `GET /api/transactions/{wallet_address}` - Get user transactions
- `GET /api/stats` - Get platform statistics

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Public read access for staking pool information
- All sensitive operations require proper authentication