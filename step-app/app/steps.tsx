// app/index.tsx
import { useEffect, useRef, useState, memo } from "react";
import { Platform, SafeAreaView, Text, View, Pressable } from "react-native";
import { Pedometer } from "expo-sensors";

// ⚠️ Your PC's IPv4 (same Wi-Fi as phone)
const SERVER = "http://172.20.10.5:3000/steps";

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

  // --- Color of hunger level ---
  const hungerBarColor = () => {
    if (hungerLevel > 70) return "#41e321ff"
    else if (hungerLevel < 30) return "#dc2626"
    else return "#ecc607ff"
  }

  // --- Hunger controls ---
  const feedWithHungerPoints = () => {
    if (hungerPoints >= 10) { // Cost 10 hunger points to increase hunger by 10%
      setHungerPoints(prev => prev - 10);
      setHungerLevel(prev => Math.min(100, prev + 10));
    }
  };

  const percent = goal > 0 ? Math.min(100, Math.round((todaySteps / goal) * 100)) : 0;
  
  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f7" }}>
  
    {/* 🔹 TOP CARD SECTION */}
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <View
        style={{
          height: "105%",
          width: "105%",
          maxWidth: 720,
          backgroundColor: "#f8fafc",
          borderRadius: 20,
          padding: 20,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
        }}
      >
        <Text style={{ fontSize: 32, fontWeight: "700", textAlign: "center" }}>
          This is where the pet goes
        </Text>
        <Text style={{ fontSize: 16, color: "#64748b", marginTop: 8, textAlign: "center" }}>
          Steps fuel your pet’s happiness!
        </Text>
      </View>
    </View>

    {/* 🔹 BOTTOM CARD SECTION */}
    <SafeAreaView
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 24,
        backgroundColor: "#eef2f7",
      }}
    >
      <View
        style={{
          width: "92%",
          maxWidth: 720,
          backgroundColor: "#f8fafc",
          borderRadius: 20,
          padding: 20,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "600" }}>
          Today's Available Steps: {todaySteps.toLocaleString()}
        </Text>

        {/* Hunger Points Display */}
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#000000ff" }}>
            Hunger Points: {hungerPoints}
          </Text>
        </View>

        {/* Hunger Level Bar */}
        <View style={{ marginTop: 6 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 5,
              color: hungerBarColor(),
            }}
          >
            Hunger Level: {Math.round(hungerLevel)}%
          </Text>
          <View
            style={{
              width: "100%",
              height: 12,
              backgroundColor: "#c9c9c9ff",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${Math.max(0, Math.min(100, hungerLevel))}%`,
                height: "100%",
                backgroundColor: hungerBarColor(),
              }}
            />
          </View>
        </View>

        {/* Feed Button */}
        <View style={{ marginTop: 15, alignItems: "center" }}>
          <Button label={`Feed (Cost: 10 points)`} onPress={feedWithHungerPoints} />
          {hungerPoints < 10 && (
            <Text style={{ color: "#64748b", fontSize: 12, marginTop: 5 }}>
              Need 10 hunger points to feed
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
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
