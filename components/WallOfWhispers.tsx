"use client"

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CONTRACT_ADDRESS = "0x353663cd664bB3e034Dc0f308D8896C0a242e4cd"; // Update this after deployment
const CONTRACT_ABI = [
    "function etch(string memory _message) public",
    "function getWhispers() public view returns (tuple(address scribe, string message, uint256 timestamp)[])",
    "event Etched(address indexed scribe, string message, uint256 timestamp)"
];

export default function WallOfWhispers() {
    const [whispers, setWhispers] = useState<any[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (CONTRACT_ADDRESS) {
            fetchWhispers();
        }
    }, []);

    async function fetchWhispers() {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        try {
            const data = await contract.getWhispers();
            setWhispers(data);
        } catch (error) {
            console.error("Error fetching whispers:", error);
        }
    }

    async function etchMessage() {
        if (!message || !window.ethereum) return;
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const tx = await contract.etch(message);
            await tx.wait();
            setMessage("");
            fetchWhispers();
        } catch (error) {
            console.error("Error etching message:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>Wall of Whispers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Etch your whisper..." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button onClick={etchMessage} disabled={loading}>
                            {loading ? "Etching..." : "Etch"}
                        </Button>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                        {whispers.map((w, i) => (
                            <div key={i} className="p-3 bg-secondary rounded-lg">
                                <p className="text-sm font-mono text-muted-foreground">{w.scribe}</p>
                                <p className="mt-1">{w.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(Number(w.timestamp) * 1000).toLocaleString()}
                                </p>
                            </div>
                        ))}
                        {whispers.length === 0 && (
                            <p className="text-center text-muted-foreground">The wall is silent.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
