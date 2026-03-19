"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PiNetworkIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState("0");

  const connectPiWallet = async () => {
    try {
      // Pi Network SDK integration placeholder
      // In production, use Pi Apps SDK or Pi Browser API
      console.log("Connecting to Pi Network...");
      setIsConnected(true);
      setBalance("100.0"); // Mock balance
    } catch (error) {
      console.error("Pi Network connection failed:", error);
    }
  };

  const stakePiTokens = async () => {
    if (!isConnected) return;
    // Implement Pi token staking logic
    console.log("Staking Pi tokens...");
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌀 Pi Network Integration
        </CardTitle>
        <CardDescription>
          Connect your Pi Network wallet and stake Pi tokens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <Button onClick={connectPiWallet} className="w-full">
            Connect Pi Wallet
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Pi Balance</p>
              <p className="text-2xl font-bold text-purple-400">{balance} π</p>
            </div>
            <Button onClick={stakePiTokens} className="w-full">
              Stake Pi Tokens
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
