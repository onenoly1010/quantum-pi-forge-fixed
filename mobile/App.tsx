import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PiConnect } from "./components/PiConnect";
import { useStore } from "./zustand/store";
import * as Haptics from "expo-haptics";

// NOTE: React 19.2 adds the <Activity> primitive. Use it to keep some UI alive offscreen.
// This draft assumes you're on Expo SDK 55 / RN 0.83.x and React 19.2.
// Replace imports/hooks with actual packages when available.

const queryClient = new QueryClient();

export default function App(): JSX.Element {
  const set = useStore((state) => state.setConnected);

  useEffect(() => {
    // Lightweight haptic to confirm the app booted in dev
    if (__DEV__) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <Text style={styles.title}>Quantum Pi Forge — Mobile (Preview)</Text>

        {/* Activity is used here as a conceptual placeholder for React 19.2's stateful hidden UI */}
        {/* @ts-ignore */}
        <Activity hidden>
          <Text>Background soul worker (keeps state alive)</Text>
        </Activity>

        <PiConnect
          onSuccess={() => {
            set(true);
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
          }}
        />

        <StatusBar style="auto" />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#0b1020",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 24,
  },
});
