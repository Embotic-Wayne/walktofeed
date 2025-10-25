// app/index.tsx
import { useEffect, useRef, useState, memo } from "react";
import { Platform, SafeAreaView, Text, View, Pressable } from "react-native";
import { Pedometer, PedometerMeasurement } from "expo-sensors";

// ⚠️ Your PC's IPv4 (same Wi-Fi as phone)
const SERVER = "http://172.20.10.5:3000/steps";

// Simple progress bar
const ProgressBar = memo(({ percent }: { percent: number }) => {
  const p = Math.max(0, Math.min(100, isFinite(percent) ? percent : 0));
  return (
    <View style={{ width: "100%", height: 18, backgroundColor: "#e5e7eb", borderRadius: 999, overflow: "hidden", marginTop: 10 }}>
      <View style={{ width: `${p}%`, height: "100%", backgroundColor: "#111827" }} />
    </View>
  );
});

export default function Home() {
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [goal, setGoal] = useState<number>(10000);  // default goal
  const lastSent = useRef<number>(0);

  useEffect(() => {
    let sub: { remove?: () => void } | null = null;
    let mounted = true;

    (async () => {
      const available = await Pedometer.isAvailableAsync();
      if (!available) {
        console.warn("Pedometer not available on this device.");
        return;
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      try {
        const result = await Pedometer.getStepCountAsync(startOfDay, new Date());
        const initial = result?.steps ?? 0;
        if (mounted) setTodaySteps(initial);
        postSteps(initial);
      } catch (e) {
        console.warn("getStepCountAsync error", e);
      }

      sub = Pedometer.watchStepCount(({ steps }: PedometerMeasurement) => {
        setTodaySteps(prev => {
          const next = (prev || 0) + (steps || 0);
          postSteps(next);
          return next;
        });
      });
    })();

    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  async function postSteps(steps: number) {
    const now = Date.now();
    if (now - lastSent.current < 2000) return; // throttle ~2s
    lastSent.current = now;
    try {
      await fetch(SERVER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });
    } catch (e: any) {
      if (__DEV__) console.log("POST failed:", e?.message);
    }
  }

  // --- Goal controls ---
  const adjustGoal = (delta: number) => {
    setGoal(g => Math.max(100, Math.min(100_000, g + delta))); // clamp between 100 and 100k
  };

  const percent = goal > 0 ? Math.min(100, Math.round((todaySteps / goal) * 100)) : 0;

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#eef2f7" }}>
      <View style={{ width: "92%", maxWidth: 720, backgroundColor: "#f8fafc", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: "700" }}>Today’s Steps</Text>

        <Text style={{ fontSize: 64, marginTop: 6, fontWeight: "800" }}>
          {todaySteps.toLocaleString()}
        </Text>

        {/* Goal row */}
        <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <View style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "#e2e8f0" }}>
            <Text style={{ fontWeight: "600" }}>Goal: {goal.toLocaleString()}</Text>
          </View>

          <View style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "#e2e8f0" }}>
            <Text style={{ fontWeight: "600" }}>Progress: {percent}%</Text>
          </View>
        </View>

        {/* Progress bar */}
        <ProgressBar percent={percent} />

        {/* Controls */}
        <View style={{ marginTop: 14, flexDirection: "row", gap: 10 }}>
          <Button label="-500" onPress={() => adjustGoal(-500)} />
          <Button label="-100" onPress={() => adjustGoal(-100)} />
          <Button label="+100" onPress={() => adjustGoal(+100)} />
          <Button label="+500" onPress={() => adjustGoal(+500)} />
          <Button label="Reset 10k" onPress={() => setGoal(10000)} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ color: "#64748b" }}>
            Phone and PC must be on the same Wi-Fi. Data posts whenever steps change.
          </Text>
          {Platform.OS === "ios" && (
            <Text style={{ color: "#64748b", marginTop: 6 }}>
              iOS may ask for “Motion & Fitness”—please allow.
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Tiny button helper
function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: "#111827",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ color: "white", fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
