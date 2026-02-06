from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = None

if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        print("✅ Supabase client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
else:
    print("⚠️  Supabase credentials not found - database features disabled")

# Import rate limiting middleware
try:
    from middleware.rate_limit import RateLimitMiddleware, create_rate_limiter, get_rate_limit_status
    RATE_LIMITING_ENABLED = True
except ImportError:
    RATE_LIMITING_ENABLED = False
    print("Warning: Rate limiting middleware not available")


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


@app.get("/api/database/status")
def database_status():
    """Check database connection status"""
    if not supabase:
        return {"status": "disconnected", "message": "Supabase not configured"}
    
    try:
        # Test connection by getting user count or similar
        response = supabase.table("users").select("*", count="exact").limit(1).execute()
        return {
            "status": "connected",
            "message": "Supabase database accessible",
            "connection_test": "successful"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Database connection failed: {str(e)}"
        }


@app.post("/api/users")
async def create_user(request: Request):
    """Create a new user in the database"""
    if not supabase:
        return JSONResponse(
            status_code=503,
            content={"error": "Database not available"}
        )
    
    try:
        data = await request.json()
        wallet_address = data.get("wallet_address")
        if not wallet_address:
            return JSONResponse(
                status_code=400,
                content={"error": "wallet_address is required"}
            )
        
        # Check if user already exists
        existing = supabase.table("users").select("*").eq("wallet_address", wallet_address).execute()
        if existing.data:
            return {"message": "User already exists", "user": existing.data[0]}
        
        # Create new user
        user_data = {
            "wallet_address": wallet_address,
            "created_at": datetime.utcnow().isoformat(),
            "total_staked": 0,
            "staking_count": 0
        }
        
        result = supabase.table("users").insert(user_data).execute()
        return {"message": "User created successfully", "user": result.data[0]}
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to create user: {str(e)}"}
        )


@app.get("/api/users/{wallet_address}")
def get_user(wallet_address: str):
    """Get user information by wallet address"""
    if not supabase:
        return JSONResponse(
            status_code=503,
            content={"error": "Database not available"}
        )
    
    try:
        result = supabase.table("users").select("*").eq("wallet_address", wallet_address).execute()
        if not result.data:
            return JSONResponse(
                status_code=404,
                content={"error": "User not found"}
            )
        return {"user": result.data[0]}
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get user: {str(e)}"}
        )


@app.post("/api/transactions")
async def record_transaction(request: Request):
    """Record a staking transaction"""
    if not supabase:
        return JSONResponse(
            status_code=503,
            content={"error": "Database not available"}
        )
    
    try:
        data = await request.json()
        required_fields = ["wallet_address", "amount", "transaction_hash", "type"]
        
        for field in required_fields:
            if field not in data:
                return JSONResponse(
                    status_code=400,
                    content={"error": f"{field} is required"}
                )
        
        transaction_data = {
            "wallet_address": data["wallet_address"],
            "amount": float(data["amount"]),
            "transaction_hash": data["transaction_hash"],
            "type": data["type"],  # "stake" or "unstake"
            "timestamp": datetime.utcnow().isoformat(),
            "status": "pending"
        }
        
        result = supabase.table("transactions").insert(transaction_data).execute()
        
        # Update user staking stats
        if data["type"] == "stake":
            # Fetch user stats once and reuse the data
            user_stats = supabase.table("users").select("total_staked", "staking_count").eq("wallet_address", data["wallet_address"]).execute()
            
            # Check if user exists before accessing array indices
            if user_stats.data and len(user_stats.data) > 0:
                current_total_staked = user_stats.data[0]["total_staked"]
                current_staking_count = user_stats.data[0]["staking_count"]
                supabase.table("users").update({
                    "total_staked": current_total_staked + float(data["amount"]),
                    "staking_count": current_staking_count + 1
                }).eq("wallet_address", data["wallet_address"]).execute()
            else:
                # Create new user if doesn't exist
                supabase.table("users").insert({
                    "wallet_address": data["wallet_address"],
                    "total_staked": float(data["amount"]),
                    "staking_count": 1
                }).execute()
        
        return {"message": "Transaction recorded successfully", "transaction": result.data[0]}
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to record transaction: {str(e)}"}
        )


@app.get("/api/transactions/{wallet_address}")
def get_user_transactions(wallet_address: str):
    """Get transaction history for a user"""
    if not supabase:
        return JSONResponse(
            status_code=503,
            content={"error": "Database not available"}
        )
    
    try:
        result = supabase.table("transactions").select("*").eq("wallet_address", wallet_address).order("timestamp", desc=True).execute()
        return {"transactions": result.data}
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get transactions: {str(e)}"}
        )


@app.get("/api/stats")
def get_platform_stats():
    """Get platform-wide statistics"""
    if not supabase:
        return JSONResponse(
            status_code=503,
            content={"error": "Database not available"}
        )
    
    try:
        # Get total users
        users_count = supabase.table("users").select("*", count="exact").execute().count
        
        # Get total staked amount
        total_staked_result = supabase.table("users").select("total_staked").execute()
        total_staked = sum(user["total_staked"] for user in total_staked_result.data)
        
        # Get total transactions
        transactions_count = supabase.table("transactions").select("*", count="exact").execute().count
        
        return {
            "total_users": users_count,
            "total_staked": total_staked,
            "total_transactions": transactions_count,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get stats: {str(e)}"}
        )


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
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)
