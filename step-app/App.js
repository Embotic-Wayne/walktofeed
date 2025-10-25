import { useEffect, useRef, useState } from "react";
import { Platform, SafeAreaView, Text, View } from "react-native";
import { Pedometer } from "expo-sensors";

// ⚠️ Change this to your Windows PC's IP:
const SERVER = "http://172.20.10.5:3000/steps"; // e.g., http://192.168.1.23:3000/steps

export default function App() {
  const [todaySteps, setTodaySteps] = useState(0);
  const lastSent = useRef(0); // throttle posts

  useEffect(() => {
    let sub;
    let isMounted = true;

    async function start() {
      const available = await Pedometer.isAvailableAsync();
      if (!available) {
        console.warn("Pedometer not available on this device.");
        return;
      }

      // Get steps since start of day
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      try {
        const result = await Pedometer.getStepCountAsync(startOfDay, new Date());
        if (isMounted) setTodaySteps(result?.steps ?? 0);
        // Send once immediately
        postSteps(result?.steps ?? 0);
      } catch (e) {
        console.warn("getStepCountAsync error", e);
      }

      // Live updates (increments)
      sub = Pedometer.watchStepCount(({ steps }) => {
        // steps here is an increment since last callback
        setTodaySteps(prev => {
          const next = (prev || 0) + steps;
          postSteps(next);
          return next;
        });
      });
    }

    start();
    return () => {
      isMounted = false;
      if (sub && sub.remove) sub.remove();
    };
  }, []);

  async function postSteps(steps) {
    // Throttle network a bit (every ~2s)
    const now = Date.now();
    if (now - lastSent.current < 2000) return;
    lastSent.current = now;
    try {
      await fetch(SERVER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps })
      });
    } catch (e) {
      // It’s okay if your PC is asleep or firewall blocked—just ignore
      if (__DEV__) console.log("POST failed:", e?.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 32, fontWeight: "600" }}>Today’s Steps</Text>
      <Text style={{ fontSize: 64, marginTop: 8 }}>{todaySteps}</Text>
      <View style={{ marginTop: 12 }}>
        <Text>Make sure your phone and PC are on the same Wi-Fi.</Text>
        <Text>Data is sent to your PC whenever steps change.</Text>
        {Platform.OS === "ios" && (
          <Text style={{ marginTop: 8 }}>
            iOS may ask for “Motion & Fitness” permission—please allow.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}