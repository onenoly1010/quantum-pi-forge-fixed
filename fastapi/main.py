from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List
import os
import time
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Track application start time for uptime calculation
APP_START_TIME = time.time()
TOTAL_REQUESTS = 0
ACTIVE_CONNECTIONS = 0

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


@app.get("/api/deployment/health")
async def deployment_health():
    """
    Comprehensive health check endpoint for deployment monitoring.
    Returns detailed status of all services and deployment information.
    """
    global TOTAL_REQUESTS, ACTIVE_CONNECTIONS
    
    start_time = time.time()
    TOTAL_REQUESTS += 1
    
    # Check database connection (simulated for now)
    db_status = True
    db_response_time = 45
    
    # Check Pi Network connection (simulated)
    pi_status = True
    pi_mode = os.getenv("PI_NETWORK_MODE", "mainnet")
    
    # Check Supabase connection (simulated)
    supabase_status = True
    
    response_time = int((time.time() - start_time) * 1000)
    uptime_seconds = int(time.time() - APP_START_TIME)
    
    # Determine overall status
    all_healthy = all([db_status, pi_status, supabase_status])
    overall_status = "healthy" if all_healthy else "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "services": {
            "database": {
                "status": "online" if db_status else "offline",
                "responseTime": db_response_time
            },
            "piNetwork": {
                "status": "connected" if pi_status else "disconnected",
                "mode": pi_mode
            },
            "supabase": {
                "status": "connected" if supabase_status else "disconnected"
            }
        },
        "deployment": {
            "version": "3.3.0",
            "environment": os.getenv("ENVIRONMENT", "production"),
            "uptime": uptime_seconds,
            "lastDeployment": os.getenv("LAST_DEPLOYMENT_TIME", "2026-02-06T10:30:00Z")
        },
        "metrics": {
            "totalRequests": TOTAL_REQUESTS,
            "activeConnections": ACTIVE_CONNECTIONS,
            "avgResponseTime": response_time
        }
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


# ==================== WEBSOCKET DEPLOYMENT STREAMING ====================

class DeploymentStreamManager:
    """Manager for real-time deployment event streaming via WebSocket."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.deployment_events = []
    
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection and send recent events."""
        global ACTIVE_CONNECTIONS
        await websocket.accept()
        self.active_connections.append(websocket)
        ACTIVE_CONNECTIONS += 1
        
        # Send recent events to new client (last 50 events)
        for event in self.deployment_events[-50:]:
            try:
                await websocket.send_json(event)
            except Exception as e:
                logger.warning(f"Failed to send event to new client: {e}")
                break
    
    def disconnect(self, websocket: WebSocket):
        """Remove a disconnected client."""
        global ACTIVE_CONNECTIONS
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            ACTIVE_CONNECTIONS -= 1
    
    async def broadcast_event(self, event: dict):
        """Broadcast an event to all connected clients."""
        # Add timestamp
        event["timestamp"] = datetime.utcnow().isoformat() + "Z"
        
        # Store event
        self.deployment_events.append(event)
        
        # Keep only last 1000 events
        if len(self.deployment_events) > 1000:
            self.deployment_events = self.deployment_events[-1000:]
        
        # Broadcast to all connected clients
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(event)
            except Exception as e:
                logger.info(f"Client disconnected during broadcast: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)


# Initialize deployment stream manager
deployment_manager = DeploymentStreamManager()


@app.websocket("/ws/deployment")
async def deployment_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time deployment event streaming."""
    await deployment_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive with ping/pong
            data = await websocket.receive_text()
            
            if data == "ping":
                await websocket.send_text("pong")
            
    except WebSocketDisconnect:
        deployment_manager.disconnect(websocket)


@app.post("/api/deployment/trigger")
async def trigger_deployment(phase: str):
    """
    Trigger a deployment and stream events.
    This is a demo endpoint showing how deployment events are broadcasted.
    """
    await deployment_manager.broadcast_event({
        "service": f"Phase {phase}",
        "status": "started",
        "message": f"Deployment phase {phase} initiated",
        "level": "info"
    })
    
    # Simulate deployment steps
    await asyncio.sleep(2)
    
    await deployment_manager.broadcast_event({
        "service": f"Phase {phase}",
        "status": "building",
        "message": "Building application...",
        "level": "info"
    })
    
    await asyncio.sleep(3)
    
    await deployment_manager.broadcast_event({
        "service": f"Phase {phase}",
        "status": "deploying",
        "message": "Deploying to production...",
        "level": "info"
    })
    
    await asyncio.sleep(2)
    
    await deployment_manager.broadcast_event({
        "service": f"Phase {phase}",
        "status": "completed",
        "message": "Deployment successful",
        "level": "success"
    })
    
    return {"status": "success", "phase": phase}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)
