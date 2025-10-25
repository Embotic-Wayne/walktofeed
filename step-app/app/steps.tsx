// app/steps.tsx
import { useEffect, useRef, useState } from "react";
import { SafeAreaView, Text, View, Pressable, Image } from "react-native";
import { Pedometer } from "expo-sensors";
import { s, colors } from "./styles";
import { router } from "expo-router";
import Stats from "./stats";

const SERVER = "http://172.20.10.5:3000/steps";

export default function Home() {
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [hungerLevel, setHungerLevel] = useState<number>(100);
  const [hungerPoints, setHungerPoints] = useState<number>(0);
  const lastSent = useRef<number>(0);
  const hungerTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showFoodMenu, setShowFoodMenu] = useState(false);

  // Food catalog
  const FOODS = [
    { name: "Apple 🍎",   price: 5,   gain: 5 },
    { name: "Cookie 🍪",  price: 15,  gain: 15 },
    { name: "Fish 🐟",    price: 25,  gain: 25 },
    { name: "Cake 🎂",    price: 50,  gain: 50 },
    { name: "Chicken 🍗", price: 75,  gain: 75 },
    { name: "Steak 🥩",   price: 100, gain: 100 },
  ];
  // --- steps.tsx ---

async function getWeeklySteps(): Promise<number[]> {
  const result: number[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(today.getDate() - i);
    day.setHours(0, 0, 0, 0);

    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    try {
      const res = await Pedometer.getStepCountAsync(day, nextDay);
      result.push(res.steps ?? 0);
    } catch {
      result.push(0); // fallback
    }
  }
  return result;
}

  function buyFood(food: { name: string; price: number; gain: number }) {
    if (hungerPoints < food.price || hungerLevel >= 100) return;
    setHungerPoints((p) => p - food.price);
    setHungerLevel((h) => Math.min(100, h + food.gain));
  }

  // Hunger ticks down slowly
  useEffect(() => {
    hungerTimer.current = setInterval(() => {
      setHungerLevel((prev) => Math.max(0, prev - 0.1));
    }, 1000);
    return () => {
      if (hungerTimer.current) clearInterval(hungerTimer.current);
    };
  }, []);

  // Step tracking
  useEffect(() => {
    let sub: { remove?: () => void } | null = null;
    let mounted = true;

    (async () => {
      const available = await Pedometer.isAvailableAsync();
      if (!available) return;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      try {
        const result = await Pedometer.getStepCountAsync(startOfDay, new Date());
        const initial = result?.steps ?? 0;
        if (mounted) {
          setTodaySteps(initial);
          setHungerPoints(Math.floor(initial * 0.1));
        }
        postSteps(initial);
      } catch {
        // ignore
      }

      sub = Pedometer.watchStepCount(({ steps }: { steps: number }) => {
        setTodaySteps((prev) => {
          const next = (prev || 0) + (steps || 0);
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
    if (now - lastSent.current < 2000) return;
    lastSent.current = now;
    try {
      await fetch(SERVER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });
    } catch {
      // ignore
    }
  }

  const hungerColor =
    hungerLevel > 70 ? colors.success : hungerLevel < 30 ? colors.danger : colors.warn;

  // ----------------- FOOD STORE VIEW -----------------
  if (showFoodMenu) {
    return (
      <SafeAreaView style={s.screen}>
        <View style={s.content}>
          <Text style={s.shopTitle}>🧺 Food Store</Text>
          <Text style={s.shopPoints}>Available Hunger Points: {hungerPoints}</Text>

          <View style={s.grid}>
            {FOODS.map((food, index) => {
              const affordable = hungerPoints >= food.price;
              const full = hungerLevel >= 100;
              const disabled = !affordable || full;

              return (
                <Pressable
                  key={index}
                  onPress={() => buyFood(food)}
                  disabled={disabled}
                  style={({ pressed }) => [
                    s.foodCard,
                    {
                      opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
                      borderWidth: affordable ? 0 : 1,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={s.foodName}>{food.name}</Text>
                  <Text style={s.foodMeta}>
                    {food.price} pts • +{food.gain}%
                  </Text>
                  {!affordable && (
                    <Text style={{ marginTop: 6, fontSize: 12, color: "#9ca3af" }}>
                      Not enough
                    </Text>
                  )}
                  {full && (
                    <Text style={{ marginTop: 6, fontSize: 12, color: "#9ca3af" }}>
                      Pet is full
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 8, alignItems: "center" }}>
            <Pressable onPress={() => setShowFoodMenu(false)} style={s.btn}>
              <Text style={s.btnText}>⬅️ Back</Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom nav */}
        <View style={s.navBar}>
          <Pressable style={s.navBtn} onPress={() => router.push('/')}>
            <Text style={{ color: "white", fontWeight: "700" }}>🏠</Text>
          </Pressable>
          <Pressable style={s.navBtn} onPress={() => setShowFoodMenu(true)}>
            <Text style={{ color: "white", fontWeight: "700" }}>🛒</Text>
          </Pressable>
          <Pressable
            style={s.navBtn}
            onPress={async () => {
              const weeklySteps = await getWeeklySteps(); // fetch last 7 days
              router.push({
              pathname: "/stats",
              params: {
                todaySteps,
                weeklySteps: JSON.stringify(weeklySteps), // must stringify for router params
                hungerLevel,
              },
              });
            }}>
          <Text style={{ color: "white", fontWeight: "700" }}>📊</Text>
        </Pressable>

        </View>
      </SafeAreaView>
    );
  }

  // ----------------- MAIN VIEW -----------------
  return (
    <SafeAreaView style={s.screen}>
      <View style={s.content}>
        {/* Pet card */}
        <View style={s.sectionTop}>
          <View style={s.petCard}>
            <Text style={s.petTitle}>Your Pet</Text>

            <View style={s.petImageWrap}>
              {/* Put your asset at app/assets/pet.png (or change the path) */}
              <Image
                source={require("../assets/images/icon128.png")}
                style={s.petImage}
                accessible
                accessibilityLabel="Virtual pet"
              />
            </View>

            <Text style={s.petSub}>Steps fuel your pet’s happiness!</Text>
          </View>
        </View>

        {/* Steps / hunger card */}
        <View
          style={{
          position: "absolute",
          bottom: 0, // distance from bottom (adjust freely)
          left: 15,
          right: 15,
          alignItems: "center", // centers horizontally
        }}
>
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>
            Today&apos;s Steps: {todaySteps.toLocaleString()}
          </Text>

          <View style={{ marginTop: 6 }}>
            <Text style={s.label}>Available Hunger Points: {hungerPoints}</Text>
          </View>

          <View style={{ marginTop: 6 }}>
            <Text style={[s.label, { color: hungerColor, marginBottom: 6 }]}>
              Hunger Level: {Math.round(hungerLevel)}%
            </Text>
            <View style={s.barWrap}>
              <View
                style={[
                  s.barFill,
                  {
                    width: `${Math.max(0, Math.min(100, hungerLevel))}%`,
                    backgroundColor: hungerColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
      </View>

      {/* Bottom nav */}
      <View style={s.navBar}>
        <Pressable style={s.navBtn} onPress={() => router.push('/')}>
          <Text style={{ color: "white", fontWeight: "700" }}>🏠</Text>
        </Pressable>
        <Pressable style={s.navBtn} onPress={() => setShowFoodMenu(true)}>
          <Text style={{ color: "white", fontWeight: "700" }}>🛒</Text>
        </Pressable>
         <Pressable
            style={s.navBtn}
            onPress={async () => {
              const weeklySteps = await getWeeklySteps(); // fetch last 7 days
              router.push({
              pathname: "/stats",
              params: {
                todaySteps,
                weeklySteps: JSON.stringify(weeklySteps), // must stringify for router params
                hungerLevel,
              },
              });
            }}>
          <Text style={{ color: "white", fontWeight: "700" }}>📊</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
