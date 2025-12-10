import React, { useState } from 'react';

export default function App() {
  const [status, setStatus] = useState("Waiting…");

  async function connect() {
    if (!window.Pi) {
      setStatus("Open this app inside Pi Browser.");
      return;
    }
    try {
      window.Pi.init({ version: "2.0", sandbox: false });
      const auth = await window.Pi.authenticate(["username"], ()=>{});
      setStatus("Connected as @" + auth.user.username);
    } catch(e){
      setStatus("Auth canceled or failed.");
    }
  }

  return (
    <div style={{padding:"20px", fontFamily:"sans-serif", color:"#f8ecff", background:"#1f0033", minHeight:"100vh"}}>
      <h1>Quantum Pi Forge v2</h1>
      <p>React + Pi SDK</p>
      <button onClick={connect} style={{padding:"10px 20px", borderRadius:"12px"}}>Connect with Pi</button>
      <p style={{marginTop:"10px"}}>{status}</p>
    </div>
  );
}
