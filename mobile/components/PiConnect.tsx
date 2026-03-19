import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { usePiConnection, usePiPurchase } from "../hooks/pi-sdk";

export function PiConnect({ onSuccess }: { onSuccess?: () => void }) {
  const { connected, connect, disconnect, status } = usePiConnection();
  const { purchase, purchasing, lastReceipt } = usePiPurchase();
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    try {
      await connect();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Connection failed");
    }
  }

  async function handlePurchase() {
    setError(null);
    try {
      await purchase({ amount: "0.1", currency: "PI" });
    } catch (err: any) {
      setError(err?.message || "Purchase failed");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pi Connection Status: {status}</Text>

      {connected ? (
        <Button title="Disconnect" onPress={() => disconnect()} />
      ) : (
        <Button title="Connect with Pi" onPress={handleConnect} />
      )}

      <View style={{ height: 12 }} />

      <Button
        title="Mint Soul (demo)"
        onPress={handlePurchase}
        disabled={!connected || purchasing}
      />

      {purchasing && <ActivityIndicator style={{ marginTop: 12 }} />}

      {lastReceipt && (
        <Text style={styles.receipt}>Receipt: {lastReceipt.id}</Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
  },
  label: {
    marginBottom: 8,
    color: "#fff",
  },
  error: {
    marginTop: 12,
    color: "#ff6b6b",
  },
  receipt: {
    marginTop: 8,
    color: "#9ae6b4",
  },
});
