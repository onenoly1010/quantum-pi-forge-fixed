import React, { useState, useEffect } from 'react';

export default function App() {
  const [status, setStatus] = useState("Waiting…");
  const [piAvailable, setPiAvailable] = useState(false);

  useEffect(() => {
    // Check if Pi SDK is available (only in Pi Browser)
    const checkPi = () => {
      if (window.Pi) {
        setPiAvailable(true);
        setStatus("Pi SDK detected. Click to connect.");
      } else {
        setPiAvailable(true); // Enable button for demo mode
        setStatus("🔧 Development mode - Click to see demo simulation");
      }
    };

    // Wait for Pi SDK to load
    if (document.readyState === 'complete') {
      checkPi();
    } else {
      window.addEventListener('load', checkPi);
      return () => window.removeEventListener('load', checkPi);
    }
  }, []);

  async function connect() {
    if (!window.Pi) {
      // Development mode - show demo simulation
      setStatus("🔧 Demo mode: Simulating Pi connection...");
      setTimeout(() => {
        setStatus("✅ [DEMO] Connected as @demo_user - Deploy to Pi Network for real authentication");
        setPiAvailable(true); // Enable button for demo
      }, 1500);
      return;
    }
    
    // Real Pi Browser environment
    try {
      setStatus("Connecting to Pi Network...");
      window.Pi.init({ version: "2.0", sandbox: false });
      const auth = await window.Pi.authenticate(["username"], () => {});
      setStatus("✅ Connected as @" + auth.user.username);
    } catch(e) {
      setStatus("❌ Auth canceled or failed: " + (e.message || "Unknown error"));
      console.error("Pi Auth Error:", e);
    }
  }

  return (
    <div style={{padding:"20px", fontFamily:"sans-serif", color:"#f8ecff", background:"#1f0033", minHeight:"100vh"}}>
      <h1>🌌 Quantum Pi Forge v2</h1>
      <p>React + Pi SDK Integration</p>
      <button 
        onClick={connect} 
        disabled={!piAvailable}
        style={{
          padding:"10px 20px", 
          borderRadius:"12px",
          cursor: "pointer",
          background: "#6f42c1",
          color: "#fff",
          border: "none",
          fontSize: "16px",
          fontWeight: "bold"
        }}
      >
        Connect with Pi
      </button>
      <p style={{marginTop:"10px", fontSize:"14px"}}>{status}</p>
      {!window.Pi && (
        <div style={{marginTop:"20px", padding:"15px", background:"rgba(255,200,100,0.15)", borderRadius:"8px", fontSize:"13px", border:"1px solid rgba(255,200,100,0.3)"}}>
          <strong>ℹ️ Development Preview:</strong> This demo simulates the Pi connection. When deployed to Pi Network and opened in the Pi Browser, users will authenticate with their real Pi accounts.
        </div>
      )}
    </div>
  );
}
