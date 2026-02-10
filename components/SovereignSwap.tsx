"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  ArrowUpDown,
  Coins,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { SOVEREIGN_CONFIG } from "@/lib/sovereign-config";

interface SovereignSwapProps {
  className?: string;
}

type SwapDirection = "OINIO_TO_0G" | "0G_TO_OINIO";

export default function SovereignSwap({ className }: SovereignSwapProps) {
  const [direction, setDirection] = useState<SwapDirection>("0G_TO_OINIO");
  const [amountIn, setAmountIn] = useState<string>("0.01");
  const [amountOut, setAmountOut] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "approving" | "swapping" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [balances, setBalances] = useState({ oinio: "0", eth: "0" });
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [slippage, setSlippage] = useState<number>(0.5); // 0.5% default

  // Initialize Web3 connection
  useEffect(() => {
    initializeWeb3();
  }, []);

  // Calculate output amount when inputs change
  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      calculateOutput();
    } else {
      setAmountOut("0");
    }
  }, [amountIn, direction]);

  const initializeWeb3 = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const web3Signer = await web3Provider.getSigner();
        setSigner(web3Signer);
        setIsConnected(true);

        // Get balances
        await updateBalances(web3Signer);

        // Listen for account changes
        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });

        // Listen for network changes
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Web3 initialization failed:", error);
        setError("Failed to connect wallet");
      }
    } else {
      setError("MetaMask not detected. Please install MetaMask to trade.");
    }
  };

  const updateBalances = async (web3Signer: ethers.JsonRpcSigner) => {
    try {
      const address = await web3Signer.getAddress();

      // Get 0G balance
      const ethBalance = await provider!.getBalance(address);
      const ethBalanceFormatted = ethers.formatEther(ethBalance);

      // Get OINIO balance
      const oinioContract = new ethers.Contract(
        SOVEREIGN_CONFIG.OINIO_TOKEN,
        ["function balanceOf(address) view returns (uint256)"],
        provider,
      );
      const oinioBal = await oinioContract.balanceOf(address);
      const oinioBalanceFormatted = ethers.formatEther(oinioBal);

      setBalances({
        eth: ethBalanceFormatted,
        oinio: oinioBalanceFormatted,
      });
    } catch (error) {
      console.error("Failed to update balances:", error);
    }
  };

  const switchTo0GAristotle = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SOVEREIGN_CONFIG.CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${SOVEREIGN_CONFIG.CHAIN_ID.toString(16)}`,
                chainName: SOVEREIGN_CONFIG.NAME,
                nativeCurrency: {
                  name: "0G",
                  symbol: "0G",
                  decimals: 18,
                },
                rpcUrls: [SOVEREIGN_CONFIG.RPC_URL],
                blockExplorerUrls: [SOVEREIGN_CONFIG.EXPLORER_URL],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add 0G Aristotle network:", addError);
          setError("Failed to add 0G Aristotle network to MetaMask");
        }
      } else {
        console.error("Failed to switch to 0G Aristotle:", switchError);
        setError("Failed to switch to 0G Aristotle network");
      }
    }
  };

  const calculateOutput = async () => {
    if (!provider || !amountIn || parseFloat(amountIn) <= 0) return;

    setIsCalculating(true);
    try {
      const routerContract = new ethers.Contract(
        SOVEREIGN_CONFIG.DEX_ROUTER,
        [
          "function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)",
        ],
        provider,
      );

      const amountInWei =
        direction === "0G_TO_OINIO"
          ? ethers.parseEther(amountIn)
          : ethers.parseEther(amountIn);

      const path =
        direction === "0G_TO_OINIO"
          ? [
              SOVEREIGN_CONFIG.NETWORK.NATIVE_CURRENCY.ADDRESS ||
                ethers.ZeroAddress,
              SOVEREIGN_CONFIG.OINIO_TOKEN,
            ]
          : [
              SOVEREIGN_CONFIG.OINIO_TOKEN,
              SOVEREIGN_CONFIG.NETWORK.NATIVE_CURRENCY.ADDRESS ||
                ethers.ZeroAddress,
            ];

      const amountsOut = await routerContract.getAmountsOut(amountInWei, path);
      const outputAmount = ethers.formatEther(amountsOut[1]);

      setAmountOut(outputAmount);
    } catch (error) {
      console.error("Failed to calculate output:", error);
      setAmountOut("0");
    } finally {
      setIsCalculating(false);
    }
  };

  const approveOINIO = async () => {
    if (!signer) return;

    setIsLoading(true);
    setStatus("approving");
    setError("");

    try {
      const oinioContract = new ethers.Contract(
        SOVEREIGN_CONFIG.OINIO_TOKEN,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer,
      );

      const maxUint256 = ethers.MaxUint256;
      const tx = await oinioContract.approve(
        SOVEREIGN_CONFIG.DEX_ROUTER,
        maxUint256,
      );

      setTxHash(tx.hash);
      await tx.wait();

      setStatus("idle");
      success("OINIO approval successful!");
    } catch (error: any) {
      console.error("Approval failed:", error);
      setStatus("error");
      setError(error.message || "Failed to approve OINIO");
    } finally {
      setIsLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!signer || !provider) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setStatus("swapping");
    setError("");
    setTxHash("");

    try {
      const amountInWei = ethers.parseEther(amountIn);
      const amountOutMin =
        (ethers.parseEther(amountOut) *
          BigInt(Math.floor((100 - slippage) * 100))) /
        BigInt(10000); // Apply slippage

      const routerContract = new ethers.Contract(
        SOVEREIGN_CONFIG.DEX_ROUTER,
        [
          "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)",
          "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
        ],
        signer,
      );

      const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes
      const to = await signer.getAddress();

      let tx;
      if (direction === "0G_TO_OINIO") {
        const path = [
          SOVEREIGN_CONFIG.NETWORK.NATIVE_CURRENCY.ADDRESS ||
            ethers.ZeroAddress,
          SOVEREIGN_CONFIG.OINIO_TOKEN,
        ];
        tx = await routerContract.swapExactETHForTokens(
          amountOutMin,
          path,
          to,
          deadline,
          { value: amountInWei },
        );
      } else {
        const path = [
          SOVEREIGN_CONFIG.OINIO_TOKEN,
          SOVEREIGN_CONFIG.NETWORK.NATIVE_CURRENCY.ADDRESS ||
            ethers.ZeroAddress,
        ];
        tx = await routerContract.swapExactTokensForETH(
          amountInWei,
          amountOutMin,
          path,
          to,
          deadline,
        );
      }

      setTxHash(tx.hash);
      await tx.wait();

      setStatus("success");
      await updateBalances(signer);
      success("Swap successful!");
    } catch (error: any) {
      console.error("Swap failed:", error);
      setStatus("error");

      if (error.code === "ACTION_REJECTED") {
        setError("Transaction rejected by user");
      } else if (error.message.includes("INSUFFICIENT_OUTPUT_AMOUNT")) {
        setError(
          "Price impact too high. Try reducing amount or increasing slippage.",
        );
      } else {
        setError(error.message || "Failed to execute swap");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDirection = () => {
    setDirection((prev) =>
      prev === "0G_TO_OINIO" ? "OINIO_TO_0G" : "0G_TO_OINIO",
    );
    setAmountIn("0.01");
    setAmountOut("0");
  };

  const getStatusMessage = () => {
    switch (status) {
      case "connecting":
        return "Connecting to wallet...";
      case "approving":
        return "Approving OINIO spending...";
      case "swapping":
        return "Executing sovereign swap...";
      case "success":
        return "Swap completed successfully!";
      case "error":
        return "Swap failed";
      default:
        return "";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connecting":
      case "approving":
      case "swapping":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const needsApproval = direction === "OINIO_TO_0G" && parseFloat(amountIn) > 0;

  return (
    <Card className={`w-full max-w-lg mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-purple-500" />
          Sovereign Swap
        </CardTitle>
        <CardDescription>
          Trade OINIO ↔ 0G on 0G Aristotle Network
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Not Connected"}
          </Badge>
          <Badge variant="outline">0G Aristotle Sovereign</Badge>
        </div>

        {/* Balance Display */}
        {isConnected && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">0G Balance</div>
              <div className="text-muted-foreground">
                {parseFloat(balances.eth).toFixed(4)} 0G
              </div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">OINIO Balance</div>
              <div className="text-muted-foreground">
                {parseFloat(balances.oinio).toFixed(2)} OINIO
              </div>
            </div>
          </div>
        )}

        {/* Swap Direction */}
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDirection}
            className="h-8 w-8 p-0"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Input Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            From: {direction === "0G_TO_OINIO" ? "0G" : "OINIO"}
          </label>
          <Input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.01"
            min="0.000000000000000001"
            step="0.000000000000000001"
            disabled={isLoading}
          />
        </div>

        {/* Output Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              To: {direction === "0G_TO_OINIO" ? "OINIO" : "0G"}
            </label>
            {isCalculating && <RefreshCw className="h-4 w-4 animate-spin" />}
          </div>
          <Input
            type="number"
            value={amountOut}
            readOnly
            placeholder="0.00"
            className="bg-muted"
          />
          <div className="text-xs text-muted-foreground">
            Estimated output • 0.3% DEX fee included
          </div>
        </div>

        {/* Slippage Settings */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Slippage Tolerance</label>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0, 2.0].map((value) => (
              <Button
                key={value}
                variant={slippage === value ? "default" : "outline"}
                size="sm"
                onClick={() => setSlippage(value)}
                className="flex-1"
              >
                {value}%
              </Button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Display */}
        {status !== "idle" && (
          <Alert>
            {getStatusIcon()}
            <AlertDescription>{getStatusMessage()}</AlertDescription>
          </Alert>
        )}

        {/* Transaction Link */}
        {txHash && (
          <div className="text-center">
            <a
              href={`${SOVEREIGN_CONFIG.EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View Transaction ↗
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isConnected ? (
            <Button
              onClick={initializeWeb3}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          ) : (
            <>
              {needsApproval && (
                <Button
                  onClick={approveOINIO}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading || parseFloat(amountIn) <= 0}
                >
                  {isLoading && status === "approving" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    "Approve OINIO"
                  )}
                </Button>
              )}

              <Button
                onClick={executeSwap}
                className="w-full"
                disabled={
                  isLoading ||
                  parseFloat(amountIn) <= 0 ||
                  parseFloat(amountOut) <= 0
                }
              >
                {isLoading && status === "swapping" ? (
                  <>
                    {getStatusIcon()}
                    <span className="ml-2">{getStatusMessage()}</span>
                  </>
                ) : (
                  <>
                    <Coins className="mr-2 h-4 w-4" />
                    Swap{" "}
                    {direction === "0G_TO_OINIO" ? "0G → OINIO" : "OINIO → 0G"}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={switchTo0GAristotle}
                className="w-full text-xs"
                size="sm"
              >
                Switch to 0G Aristotle
              </Button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div>Sovereign DEX • 0.3% Trading Fee</div>
          <div>
            Network: 0G Aristotle • Chain ID: {SOVEREIGN_CONFIG.CHAIN_ID}
          </div>
          <div>⚡ Powered by Quantum Resonance • 1010 Hz</div>
        </div>
      </CardContent>
    </Card>
  );
}
