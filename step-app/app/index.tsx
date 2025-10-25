// app/index.tsx
import { useEffect, useRef, useState, memo } from "react";
import { Platform, SafeAreaView, Text, View, Pressable } from "react-native";
import { Pedometer } from "expo-sensors";

// ⚠️ Your PC's IPv4 (same Wi-Fi as phone)
const SERVER = "http://172.20.10.5:3000/steps";

// Simple progress bar
const ProgressBar = memo(({ percent }: { percent: number }) => {
  const p = Math.max(0, Math.min(100, isFinite(percent) ? percent : 0));
  return (
    <View style={{ width: "100%", height: 8, backgroundColor: "#e5e7eb", borderRadius: 999, overflow: "hidden", marginTop: 10 }}>
      <View style={{ width: `${p}%`, height: "100%", backgroundColor: "#111827" }} />
    </View>
  );
});

export default function Home() {
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [goal, setGoal] = useState<number>(10000);  // default goal
  const [hungerLevel, setHungerLevel] = useState<number>(100); // Start at 100%
  const [hungerPoints, setHungerPoints] = useState<number>(0);
  const lastSent = useRef<number>(0);
  const hungerTimer = useRef<number | null>(null);

  // Hunger timer effect - decreases hunger over time
  useEffect(() => {
    hungerTimer.current = setInterval(() => {
      setHungerLevel(prev => Math.max(0, prev - 0.1)); // Decrease by 0.1% every second
    }, 1000);

    return () => {
      if (hungerTimer.current) {
        clearInterval(hungerTimer.current);
      }
    };
  }, []);

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
        if (mounted) {
          setTodaySteps(initial);
          // Convert steps to hunger points (1 step = 0.1 hunger point)
          setHungerPoints(Math.floor(initial * 0.1));
        }
        postSteps(initial);
      } catch (e) {
        console.warn("getStepCountAsync error", e);
      }

      sub = Pedometer.watchStepCount(({ steps }: { steps: number }) => {
        setTodaySteps(prev => {
          const next = (prev || 0) + (steps || 0);
          // Update hunger points based on new steps
          setHungerPoints(Math.floor(next * 0.1));
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

  // --- Hunger controls ---
  const feedWithHungerPoints = () => {
    if (hungerPoints >= 10) { // Cost 10 hunger points to increase hunger by 10%
      setHungerPoints(prev => prev - 10);
      setHungerLevel(prev => Math.min(100, prev + 10));
    }
  };

  const percent = goal > 0 ? Math.min(100, Math.round((todaySteps / goal) * 100)) : 0;

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", padding: 24, backgroundColor: "#eef2f7" }}>
      <View style={{ width: "92%", maxWidth: 720, backgroundColor: "#f8fafc", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "600" }}>Today's Available Steps: {todaySteps.toLocaleString()}</Text>

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

        {/* Hunger Points Display */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#dc2626" }}>
            Hunger Points: {hungerPoints}
          </Text>
        </View>

        {/* Hunger Level Bar */}
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 5 }}>
            Hunger Level: {Math.round(hungerLevel)}%
          </Text>
          <View style={{ width: "100%", height: 12, backgroundColor: "#fecaca", borderRadius: 999, overflow: "hidden" }}>
            <View style={{ 
              width: `${Math.max(0, Math.min(100, hungerLevel))}%`, 
              height: "100%", 
              backgroundColor: hungerLevel > 50 ? "#dc2626" : hungerLevel > 20 ? "#f59e0b" : "#ef4444"
            }} />
          </View>
        </View>

        {/* Feed Button */}
        <View style={{ marginTop: 15, alignItems: "center" }}>
          <Button 
            label={`Feed (Cost: 10 points)`} 
            onPress={feedWithHungerPoints}
          />
          {hungerPoints < 10 && (
            <Text style={{ color: "#64748b", fontSize: 12, marginTop: 5 }}>
              Need 10 hunger points to feed
            </Text>
          )}
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
