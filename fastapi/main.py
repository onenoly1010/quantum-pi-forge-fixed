from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from supabase import create_client, Client
import stripe
from dotenv import load_dotenv

# OpenTelemetry tracing setup
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import Urllib3Instrumentor

# Initialize tracing
def setup_tracing():
    """Set up OpenTelemetry tracing for FastAPI Quantum Conduit"""
    trace.set_tracer_provider(TracerProvider())
    tracer_provider = trace.get_tracer_provider()

    # Configure OTLP exporter to AI Toolkit
    otlp_exporter = OTLPSpanExporter(
        endpoint="http://localhost:4317",  # gRPC endpoint for AI Toolkit
        insecure=True
    )

    # Add batch span processor
    span_processor = BatchSpanProcessor(otlp_exporter)
    tracer_provider.add_span_processor(span_processor)

    # Instrument libraries
    RequestsInstrumentor().instrument()
    Urllib3Instrumentor().instrument()

    print("🔍 Tracing initialized for FastAPI Quantum Conduit")

# Setup tracing at module level
setup_tracing()

# Load environment variables
load_dotenv()

# Import rate limiting middleware
try:
    from middleware.rate_limit import RateLimitMiddleware, create_rate_limiter, get_rate_limit_status
    RATE_LIMITING_ENABLED = True
except ImportError:
    RATE_LIMITING_ENABLED = False
    print("Warning: Rate limiting middleware not available")

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# Initialize Stripe
stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
if stripe_secret_key:
    stripe.api_key = stripe_secret_key


app = FastAPI(
    title="Quantum Pi Forge API",
    description="Backend API for Quantum Pi Forge - Sovereign Staking Protocol",
    version="2.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
rate_limiter = None
if RATE_LIMITING_ENABLED:
    rate_limiter = create_rate_limiter()
    app.add_middleware(RateLimitMiddleware, rate_limiter=rate_limiter)

# Instrument FastAPI app for tracing
FastAPIInstrumentor.instrument_app(app)


# ==================== HEALTH & STATUS ENDPOINTS ====================

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "rate_limiting": RATE_LIMITING_ENABLED,
    }


@app.get("/api/health-shields")
def health_shields():
    """
    Shields.io compatible endpoint for dynamic status badge.
    The Living Sigil - shows the world the Forge is breathing.
    """
    return {
        "schemaVersion": 1,
        "label": "Forge Status",
        "message": "SOVEREIGN",
        "color": "7D3FFF",
        "style": "for-the-badge",
        "namedLogo": "ethereum",
        "logoColor": "white"
    }


@app.get("/api/rate-limit-status")
async def rate_limit_status(request: Request):
    """Get current rate limit status for the requesting client."""
    if not RATE_LIMITING_ENABLED or not rate_limiter:
        return {"rate_limiting": False, "message": "Rate limiting is not enabled"}
    
    status = get_rate_limit_status(rate_limiter, request)
    return {
        "rate_limiting": True,
        **status,
    }


# ==================== DATA ENDPOINTS ====================


@app.get("/api/data")
def get_sample_data():
    return {
        "data": [
            {"id": 1, "name": "Sample Item 1", "value": 100},
            {"id": 2, "name": "Sample Item 2", "value": 200},
            {"id": 3, "name": "Sample Item 3", "value": 300}
        ],
        "total": 3,
        "timestamp": "2024-01-01T00:00:00Z"
    }


@app.get("/api/items/{item_id}")
def get_item(item_id: int):
    return {
        "item": {
            "id": item_id,
            "name": "Sample Item " + str(item_id),
            "value": item_id * 100
        },
        "timestamp": "2024-01-01T00:00:00Z"
    }


# ==================== CREATOR PAYOUT ENDPOINTS ====================

@app.post("/api/creator/payout")
async def creator_payout(request: Request):
    """
    Process creator payout from template usage burn
    """
    if not supabase or not stripe_secret_key:
        raise HTTPException(status_code=503, detail="Payout system not configured")

    try:
        data = await request.json()
        template_id = data.get("templateId")
        user_id = data.get("userId")
        burn_amount = data.get("burnAmount")
        transaction_hash = data.get("transactionHash")

        if not all([template_id, user_id, burn_amount, transaction_hash]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        # 1. Get template creator
        template_response = supabase.table('templates').select('creator_id, price_usd, category').eq('id', template_id).execute()
        if not template_response.data:
            raise HTTPException(status_code=404, detail="Template not found")

        template = template_response.data[0]

        # 2. Calculate payout breakdown
        creator_share = burn_amount * 0.10  # 10%
        platform_fee = burn_amount * 0.05   # 5%
        burn_remaining = burn_amount * 0.85 # 85%

        # 3. Create payout record
        payout_data = {
            "template_id": template_id,
            "user_id": user_id,
            "creator_id": template['creator_id'],
            "burn_amount": burn_amount,
            "creator_share": creator_share,
            "platform_fee": platform_fee,
            "transaction_hash": transaction_hash,
            "status": "pending"
        }

        payout_response = supabase.table('creator_payouts').insert(payout_data).execute()
        payout = payout_response.data[0]

        # 4. Update creator balance
        try:
            supabase.rpc('increment_creator_balance', {
                'creator_id': template['creator_id'],
                'amount': creator_share
            }).execute()
        except:
            # Fallback: direct update
            creator_response = supabase.table('users').select('creator_balance').eq('id', template['creator_id']).execute()
            current_balance = creator_response.data[0]['creator_balance'] or 0
            supabase.table('users').update({
                'creator_balance': current_balance + creator_share
            }).eq('id', template['creator_id']).execute()

        # 5. Check for automatic payout
        creator_response = supabase.table('users').select('creator_balance, stripe_account_id, email').eq('id', template['creator_id']).execute()
        creator = creator_response.data[0]

        payout_message = "Creator balance updated"
        if creator['creator_balance'] >= 50:
            # Trigger automatic payout
            await trigger_creator_payout(creator, template['creator_id'])
            payout_message = "Creator payout queued (balance > $50)"

        # 6. Log revenue event
        supabase.table('revenue_events').insert({
            "event_type": "template_usage",
            "template_id": template_id,
            "user_id": user_id,
            "creator_id": template['creator_id'],
            "amount_usd": burn_amount,
            "creator_payout": creator_share,
            "platform_revenue": platform_fee
        }).execute()

        return {
            "success": True,
            "payout_id": payout['id'],
            "breakdown": {
                "total_burn": burn_amount,
                "creator_share": creator_share,
                "platform_fee": platform_fee,
                "actual_burn": burn_remaining
            },
            "creator_balance": creator['creator_balance'],
            "message": payout_message
        }

    except Exception as e:
        # Log error but don't fail the burn
        try:
            supabase.table('payout_errors').insert({
                "template_id": template_id,
                "user_id": user_id,
                "error": str(e)
            }).execute()
        except:
            pass  # Suppress logging errors

        # Return success anyway - don't block user experience
        return {
            "success": True,
            "warning": "Payout system offline, burn completed",
            "fallback": True
        }


async def trigger_creator_payout(creator, creator_id):
    """Trigger automatic payout to Stripe"""
    if creator.get('stripe_account_id'):
        try:
            transfer = stripe.Transfer.create(
                amount=int(creator['creator_balance'] * 100),  # Convert to cents
                currency='usd',
                destination=creator['stripe_account_id'],
                description='OINIO Creator Payout'
            )

            # Update creator balance to zero
            supabase.table('users').update({'creator_balance': 0}).eq('id', creator_id).execute()

            # Record payout
            supabase.table('creator_payouts_executed').insert({
                "creator_id": creator_id,
                "amount": creator['creator_balance'],
                "stripe_transfer_id": transfer.id,
                "status": "completed"
            }).execute()

        except Exception as stripe_error:
            print(f"Stripe payout failed: {stripe_error}")
            # Fallback to notification
            await send_payout_notification(creator)
    else:
        # Send Stripe Connect invite
        await send_stripe_connect_invite(creator)


async def send_payout_notification(creator):
    """Send payout notification email"""
    # Placeholder - implement with your email service
    print(f"Sending payout notification to {creator['email']}")


async def send_stripe_connect_invite(creator):
    """Send Stripe Connect invitation"""
    # Placeholder - implement with your email service
    print(f"Sending Stripe Connect invite to {creator['email']}")


# ==================== CREATOR DASHBOARD ENDPOINTS ====================

@app.get("/api/creator/dashboard")
async def get_creator_dashboard(request: Request):
    """
    Get creator dashboard data including earnings, balance, and stats
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Get user from session/token (placeholder - implement auth)
        # For now, assume creator_id is passed as query param
        creator_id = request.query_params.get("creator_id")
        if not creator_id:
            raise HTTPException(status_code=401, detail="Creator authentication required")

        # Get creator data
        creator_response = supabase.table('users').select('*').eq('id', creator_id).execute()
        if not creator_response.data:
            raise HTTPException(status_code=404, detail="Creator not found")

        creator = creator_response.data[0]

        # Get template stats
        templates_response = supabase.table('templates').select('id, name, category, price_usd').eq('creator_id', creator_id).execute()
        templates = templates_response.data or []

        # Calculate total uses and earnings
        total_uses = 0
        total_earnings = 0

        for template in templates:
            # Get usage count for this template
            usage_response = supabase.table('creator_payouts').select('amount_usd').eq('template_id', template['id']).execute()
            template_uses = len(usage_response.data) if usage_response.data else 0
            total_uses += template_uses

            # Calculate earnings (10% of burns)
            template_earnings = sum(payout['amount_usd'] * 0.1 for payout in (usage_response.data or []))
            total_earnings += template_earnings

        # Get platform earnings (5% of all burns)
        platform_response = supabase.table('creator_payouts').select('platform_revenue').execute()
        platform_earnings = sum(payout['platform_revenue'] for payout in (platform_response.data or []))

        return {
            "creator_id": creator_id,
            "email": creator.get('email', ''),
            "templates_created": len(templates),
            "total_uses": total_uses,
            "total_earnings": total_earnings,
            "available_balance": creator.get('creator_balance', 0),
            "platform_earnings": platform_earnings
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")


@app.get("/api/creator/recent-payouts")
async def get_recent_payouts(request: Request):
    """
    Get recent payout transactions for creator dashboard
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        creator_id = request.query_params.get("creator_id")
        if not creator_id:
            raise HTTPException(status_code=401, detail="Creator authentication required")

        # Get recent payouts with template and user info
        payouts_response = supabase.table('creator_payouts') \
            .select('id, template_id, user_id, creator_share, created_at, templates(name), users(email)') \
            .eq('creator_id', creator_id) \
            .order('created_at', desc=True) \
            .limit(20) \
            .execute()

        recent_payouts = []
        for payout in payouts_response.data or []:
            recent_payouts.append({
                "id": payout['id'],
                "template_name": payout.get('templates', {}).get('name', 'Unknown Template'),
                "user_email": payout.get('users', {}).get('email', 'Anonymous'),
                "creator_share": payout['creator_share'],
                "created_at": payout['created_at']
            })

        return recent_payouts

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recent payouts error: {str(e)}")


@app.post("/api/creator/request-payout")
async def request_manual_payout(request: Request):
    """
    Allow creators to request manual payout when balance >= $50
    """
    if not supabase or not stripe_secret_key:
        raise HTTPException(status_code=503, detail="Payout system not available")

    try:
        # Get creator from auth (placeholder)
        creator_id = (await request.json()).get("creator_id")
        if not creator_id:
            raise HTTPException(status_code=401, detail="Creator authentication required")

        # Get creator balance
        creator_response = supabase.table('users').select('creator_balance, stripe_account_id, email').eq('id', creator_id).execute()
        if not creator_response.data:
            raise HTTPException(status_code=404, detail="Creator not found")

        creator = creator_response.data[0]

        if creator['creator_balance'] < 50:
            raise HTTPException(status_code=400, detail="Minimum payout amount is $50")

        # Process payout
        await trigger_creator_payout(creator, creator_id)

        return {
            "success": True,
            "message": "Payout initiated successfully",
            "amount": creator['creator_balance']
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payout request error: {str(e)}")


# ==================== STRIPE CONNECT ENDPOINTS ====================

@app.post("/api/creator/create-stripe-account")
async def create_stripe_account(request: Request):
    """
    Create a Stripe Connect Express account for a creator
    """
    if not stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    try:
        data = await request.json()
        creator_id = data.get("creator_id")
        email = data.get("email")
        country = data.get("country", "US")

        if not creator_id or not email:
            raise HTTPException(status_code=400, detail="Creator ID and email required")

        # Create Stripe Connect account
        account = stripe.Account.create(
            type='express',
            country=country,
            email=email,
            capabilities={
                'transfers': {'requested': True},
            },
            business_type='individual',  # or 'company'
        )

        # Store account ID in database
        if supabase:
            supabase.table('users').update({
                'stripe_account_id': account.id,
                'stripe_onboarding_complete': False
            }).eq('id', creator_id).execute()

        return {
            "success": True,
            "account_id": account.id,
            "message": "Stripe account created successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe account creation failed: {str(e)}")


@app.get("/api/creator/stripe-onboarding-link")
async def get_stripe_onboarding_link(creator_id: str):
    """
    Generate Stripe onboarding link for creator
    """
    if not stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    try:
        # Get creator's Stripe account ID
        if not supabase:
            raise HTTPException(status_code=503, detail="Database not available")

        creator_response = supabase.table('users').select('stripe_account_id, stripe_onboarding_complete').eq('id', creator_id).execute()
        if not creator_response.data:
            raise HTTPException(status_code=404, detail="Creator not found")

        creator = creator_response.data[0]
        account_id = creator.get('stripe_account_id')

        if not account_id:
            raise HTTPException(status_code=400, detail="Stripe account not created yet")

        # Create onboarding link
        account_link = stripe.AccountLink.create(
            account=account_id,
            refresh_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/creator/dashboard",
            return_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/creator/dashboard",
            type='account_onboarding',
        )

        return {
            "success": True,
            "onboarding_url": account_link.url,
            "expires_at": account_link.expires_at
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Onboarding link creation failed: {str(e)}")


@app.get("/api/creator/stripe-dashboard-link")
async def get_stripe_dashboard_link(creator_id: str):
    """
    Generate link to creator's Stripe Express dashboard
    """
    if not stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    try:
        # Get creator's Stripe account ID
        if not supabase:
            raise HTTPException(status_code=503, detail="Database not available")

        creator_response = supabase.table('users').select('stripe_account_id').eq('id', creator_id).execute()
        if not creator_response.data:
            raise HTTPException(status_code=404, detail="Creator not found")

        creator = creator_response.data[0]
        account_id = creator.get('stripe_account_id')

        if not account_id:
            raise HTTPException(status_code=400, detail="Stripe account not connected")

        # Create login link
        login_link = stripe.Account.create_login_link(account_id)

        return {
            "success": True,
            "dashboard_url": login_link.url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard link creation failed: {str(e)}")


@app.get("/api/creator/stripe-status")
async def get_stripe_status(creator_id: str):
    """
    Check creator's Stripe account status
    """
    if not stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database not available")

        creator_response = supabase.table('users').select('stripe_account_id, stripe_onboarding_complete').eq('id', creator_id).execute()
        if not creator_response.data:
            raise HTTPException(status_code=404, detail="Creator not found")

        creator = creator_response.data[0]
        account_id = creator.get('stripe_account_id')

        if not account_id:
            return {
                "connected": False,
                "onboarding_complete": False,
                "message": "Stripe account not created"
            }

        # Get account details from Stripe
        account = stripe.Account.retrieve(account_id)

        onboarding_complete = (
            account.details_submitted and
            account.charges_enabled and
            account.payouts_enabled
        )

        # Update database if onboarding completed
        if onboarding_complete and not creator.get('stripe_onboarding_complete'):
            supabase.table('users').update({
                'stripe_onboarding_complete': True
            }).eq('id', creator_id).execute()

        return {
            "connected": True,
            "onboarding_complete": onboarding_complete,
            "account_id": account_id,
            "charges_enabled": account.charges_enabled,
            "payouts_enabled": account.payouts_enabled,
            "details_submitted": account.details_submitted
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


# ==================== PREMIUM TEMPLATES ENDPOINTS ====================

@app.post("/api/templates/make-premium")
async def make_template_premium(request: Request):
    """
    Convert a template to premium (paid)
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        data = await request.json()
        template_id = data.get("templateId")
        price_usd = data.get("price", 9.99)
        creator_id = data.get("creator_id")

        if not template_id or not creator_id:
            raise HTTPException(status_code=400, detail="Template ID and creator ID required")

        # Update template to premium
        supabase.table('templates').update({
            'is_premium': True,
            'price_usd': price_usd,
            'updated_at': 'now()'
        }).eq('id', template_id).eq('creator_id', creator_id).execute()

        return {
            "success": True,
            "message": f"Template is now premium at ${price_usd}",
            "template_id": template_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Premium template creation failed: {str(e)}")


@app.get("/api/templates/premium-stats")
async def get_premium_template_stats():
    """
    Get statistics for premium templates
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Get premium template stats
        stats_response = supabase.table('templates').select('id, name, price_usd, creator_id').eq('is_premium', True).execute()
        premium_templates = stats_response.data or []

        # Calculate total revenue potential
        total_revenue_potential = sum(template['price_usd'] for template in premium_templates)

        return {
            "premium_templates_count": len(premium_templates),
            "total_revenue_potential": total_revenue_potential,
            "templates": premium_templates
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats retrieval failed: {str(e)}")


# ==================== REFERRAL SYSTEM ENDPOINTS ====================

@app.post("/api/creator/create-referral")
async def create_referral_link(request: Request):
    """
    Create a referral link for creator
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        data = await request.json()
        creator_id = data.get("creator_id")

        if not creator_id:
            raise HTTPException(status_code=400, detail="Creator ID required")

        # Generate unique referral code
        import secrets
        referral_code = secrets.token_urlsafe(8)

        # Store referral code
        supabase.table('creator_referrals').insert({
            'creator_id': creator_id,
            'referral_code': referral_code,
            'created_at': 'now()'
        }).execute()

        return {
            "success": True,
            "referral_code": referral_code,
            "referral_link": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/create?ref={referral_code}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Referral creation failed: {str(e)}")


@app.get("/api/creator/referral-stats")
async def get_referral_stats(creator_id: str):
    """
    Get referral statistics for creator
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Get referral code
        referral_response = supabase.table('creator_referrals').select('referral_code').eq('creator_id', creator_id).execute()
        referral_code = referral_response.data[0]['referral_code'] if referral_response.data else None

        if not referral_code:
            return {
                "referral_code": None,
                "referred_creators": 0,
                "total_earnings": 0,
                "referral_link": None
            }

        # Get referred creators
        referred_response = supabase.table('users').select('id').eq('referred_by', referral_code).execute()
        referred_creators = referred_response.data or []

        # Calculate earnings from referrals (5% of their earnings)
        total_earnings = 0
        for creator in referred_creators:
            earnings_response = supabase.table('creator_payouts').select('creator_share').eq('creator_id', creator['id']).execute()
            creator_earnings = sum(payout['creator_share'] for payout in (earnings_response.data or []))
            total_earnings += creator_earnings * 0.05  # 5% referral bonus

        return {
            "referral_code": referral_code,
            "referred_creators": len(referred_creators),
            "total_earnings": total_earnings,
            "referral_link": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/create?ref={referral_code}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Referral stats failed: {str(e)}")


# ==================== LAUNCH BONUS ENDPOINTS ====================

@app.get("/api/creator/launch-bonus")
async def get_launch_bonus_status():
    """
    Get current launch bonus status
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Count total payouts to determine bonus remaining
        total_payouts_response = supabase.table('creator_payouts').select('id', count='exact').execute()
        total_payouts = total_payouts_response.count or 0

        bonus_remaining = max(0, 100 - total_payouts)  # 100 bonus slots

        return {
            "bonus_active": bonus_remaining > 0,
            "bonus_remaining": bonus_remaining,
            "bonus_multiplier": 1.2,  # 20% bonus
            "total_bonuses_used": min(total_payouts, 100)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bonus status failed: {str(e)}")


@app.get("/api/admin/revenue-monitor")
async def get_revenue_monitor():
    """
    Admin endpoint for real-time revenue monitoring
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Get today's revenue
        today_response = supabase.table('creator_payouts').select('burn_amount, creator_share, platform_fee').gte('created_at', 'now() - interval \'1 day\'').execute()
        today_payouts = today_response.data or []

        total_revenue = sum(p['burn_amount'] for p in today_payouts)
        creator_payouts = sum(p['creator_share'] for p in today_payouts)
        platform_revenue = sum(p['platform_fee'] for p in today_payouts)
        burns_today = len(today_payouts)

        # Get top creator today
        top_creator_response = supabase.table('creator_payouts').select('creator_id, creator_share, users(username)').gte('created_at', 'now() - interval \'1 day\'').execute()
        if top_creator_response.data:
            creator_totals = {}
            for payout in top_creator_response.data:
                cid = payout['creator_id']
                creator_totals[cid] = creator_totals.get(cid, {'earnings': 0, 'username': payout.get('users', {}).get('username', 'Unknown')})
                creator_totals[cid]['earnings'] += payout['creator_share']

            top_creator = max(creator_totals.items(), key=lambda x: x[1]['earnings'])
            top_creator_data = {
                'creator_id': top_creator[0],
                'username': top_creator[1]['username'],
                'daily_earnings': top_creator[1]['earnings']
            }
        else:
            top_creator_data = None

        return {
            "total_revenue": total_revenue,
            "creator_payouts": creator_payouts,
            "platform_revenue": platform_revenue,
            "burns_today": burns_today,
            "top_creator": top_creator_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Revenue monitor failed: {str(e)}")


@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vercel + FastAPI</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                background-color: #000000;
                color: #ffffff;
                line-height: 1.6;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }

            header {
                border-bottom: 1px solid #333333;
                padding: 0;
            }

            nav {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                padding: 1rem 2rem;
                gap: 2rem;
            }

            .logo {
                font-size: 1.25rem;
                font-weight: 600;
                color: #ffffff;
                text-decoration: none;
            }

            .nav-links {
                display: flex;
                gap: 1.5rem;
                margin-left: auto;
            }

            .nav-links a {
                text-decoration: none;
                color: #888888;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                transition: all 0.2s ease;
                font-size: 0.875rem;
                font-weight: 500;
            }

            .nav-links a:hover {
                color: #ffffff;
                background-color: #111111;
            }

            main {
                flex: 1;
                max-width: 1200px;
                margin: 0 auto;
                padding: 4rem 2rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .hero {
                margin-bottom: 3rem;
            }

            .hero-code {
                margin-top: 2rem;
                width: 100%;
                max-width: 900px;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }

            .hero-code pre {
                background-color: #0a0a0a;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 1.5rem;
                text-align: left;
                grid-column: 1 / -1;
            }

            h1 {
                font-size: 3rem;
                font-weight: 700;
                margin-bottom: 1rem;
                background: linear-gradient(to right, #ffffff, #888888);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .subtitle {
                font-size: 1.25rem;
                color: #888888;
                margin-bottom: 2rem;
                max-width: 600px;
            }

            .cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                width: 100%;
                max-width: 900px;
            }

            .card {
                background-color: #111111;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 1.5rem;
                transition: all 0.2s ease;
                text-align: left;
            }

            .card:hover {
                border-color: #555555;
                transform: translateY(-2px);
            }

            .card h3 {
                font-size: 1.125rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: #ffffff;
            }

            .card p {
                color: #888888;
                font-size: 0.875rem;
                margin-bottom: 1rem;
            }

            .card a {
                display: inline-flex;
                align-items: center;
                color: #ffffff;
                text-decoration: none;
                font-size: 0.875rem;
                font-weight: 500;
                padding: 0.5rem 1rem;
                background-color: #222222;
                border-radius: 6px;
                border: 1px solid #333333;
                transition: all 0.2s ease;
            }

            .card a:hover {
                background-color: #333333;
                border-color: #555555;
            }

            .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                background-color: #0070f3;
                color: #ffffff;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 500;
                margin-bottom: 2rem;
            }

            .status-dot {
                width: 6px;
                height: 6px;
                background-color: #00ff88;
                border-radius: 50%;
            }

            pre {
                background-color: #0a0a0a;
                border: 1px solid #333333;
                border-radius: 6px;
                padding: 1rem;
                overflow-x: auto;
                margin: 0;
            }

            code {
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                font-size: 0.85rem;
                line-height: 1.5;
                color: #ffffff;
            }

            /* Syntax highlighting */
            .keyword {
                color: #ff79c6;
            }

            .string {
                color: #f1fa8c;
            }

            .function {
                color: #50fa7b;
            }

            .class {
                color: #8be9fd;
            }

            .module {
                color: #8be9fd;
            }

            .variable {
                color: #f8f8f2;
            }

            .decorator {
                color: #ffb86c;
            }

            @media (max-width: 768px) {
                nav {
                    padding: 1rem;
                    flex-direction: column;
                    gap: 1rem;
                }

                .nav-links {
                    margin-left: 0;
                }

                main {
                    padding: 2rem 1rem;
                }

                h1 {
                    font-size: 2rem;
                }

                .hero-code {
                    grid-template-columns: 1fr;
                }

                .cards {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <header>
            <nav>
                <a href="/" class="logo">Vercel + FastAPI</a>
                <div class="nav-links">
                    <a href="/docs">API Docs</a>
                    <a href="/api/data">API</a>
                </div>
            </nav>
        </header>
        <main>
            <div class="hero">
                <h1>Vercel + FastAPI</h1>
                <div class="hero-code">
                    <pre><code><span class="keyword">from</span> <span class="module">fastapi</span> <span class="keyword">import</span> <span class="class">FastAPI</span>

<span class="variable">app</span> = <span class="class">FastAPI</span>()

<span class="decorator">@app.get</span>(<span class="string">"/"</span>)
<span class="keyword">def</span> <span class="function">read_root</span>():
    <span class="keyword">return</span> {<span class="string">"Python"</span>: <span class="string">"on Vercel"</span>}</code></pre>
                </div>
            </div>

            <div class="cards">
                <div class="card">
                    <h3>Interactive API Docs</h3>
                    <p>Explore this API's endpoints with the interactive Swagger UI. Test requests and view response schemas in real-time.</p>
                    <a href="/docs">Open Swagger UI →</a>
                </div>

                <div class="card">
                    <h3>Sample Data</h3>
                    <p>Access sample JSON data through our REST API. Perfect for testing and development purposes.</p>
                    <a href="/api/data">Get Data →</a>
                </div>

            </div>
        </main>
    </body>
    </html>
    """


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)
