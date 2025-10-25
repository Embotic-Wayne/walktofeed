import { useEffect, useRef, useState } from "react";
import { SafeAreaView, Text, View, Pressable } from "react-native";
import { Pedometer } from "expo-sensors";
import { s, colors } from "./styles"; // ⬅️ NEW

const SERVER = "http://172.20.10.5:3000/steps";

export default function Home() {
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [goal, setGoal] = useState<number>(10000);
  const [hungerLevel, setHungerLevel] = useState<number>(100);
  const [hungerPoints, setHungerPoints] = useState<number>(0);
  const lastSent = useRef<number>(0);
  const hungerTimer = useRef<ReturnType<typeof setInterval> | null>(null); // ⬅️ safer type
  const [showFoodMenu, setShowFoodMenu] = useState(false);

  const FOODS = [
    { name: "Apple 🍎", price: 5, gain: 5 },
    { name: "Cookie 🍪", price: 15, gain: 15 },
    { name: "Fish 🐟", price: 25, gain: 25 },
    { name: "Cake 🎂", price: 50, gain: 50 },
    { name: "Chicken 🍗", price: 75, gain: 75 },
    { name: "Steak 🥩", price: 100, gain: 100 },
  ];

  function buyFood(food: { name: string; price: number; gain: number }) {
    if (hungerPoints < food.price || hungerLevel >= 100) return;
    setHungerPoints(p => p - food.price);
    setHungerLevel(h => Math.min(100, h + food.gain));
  }

  useEffect(() => {
    hungerTimer.current = setInterval(() => {
      setHungerLevel(prev => Math.max(0, prev - 0.1));
    }, 1000);
    return () => { if (hungerTimer.current) clearInterval(hungerTimer.current); };
  }, []);

  useEffect(() => {
    let sub: { remove?: () => void } | null = null;
    let mounted = true;

    (async () => {
      const available = await Pedometer.isAvailableAsync();
      if (!available) return;

      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      try {
        const result = await Pedometer.getStepCountAsync(startOfDay, new Date());
        const initial = result?.steps ?? 0;
        if (mounted) {
          setTodaySteps(initial);
          setHungerPoints(Math.floor(initial * 0.1));
        }
        postSteps(initial);
      } catch {}

      sub = Pedometer.watchStepCount(({ steps }: { steps: number }) => {
        setTodaySteps(prev => {
          const next = (prev || 0) + (steps || 0);
          setHungerPoints(Math.floor(next * 0.1));
          postSteps(next);
          return next;
        });
      });
    })();

    return () => { mounted = false; sub?.remove?.(); };
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
    } catch {}
  }

  const hungerBarColor = () =>
    hungerLevel > 70 ? colors.success : hungerLevel < 30 ? colors.danger : colors.warn;

  const foodMenu = () => setShowFoodMenu(true);

  if (showFoodMenu) {
    // Food Store
    return (
      <SafeAreaView style={s.shopScreen}>
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
                <Text style={s.foodMeta}>{food.price} pts • +{food.gain}%</Text>
                {!affordable && (
                  <Text style={{ marginTop: 6, fontSize: 12, color: "#9ca3af" }}>Not enough</Text>
                )}
                {full && (
                  <Text style={{ marginTop: 6, fontSize: 12, color: "#9ca3af" }}>Pet is full</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 40 }}>
          <Pressable onPress={() => setShowFoodMenu(false)} style={s.btn}>
            <Text style={s.btnText}>⬅️ Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Main screen
  return (
    <SafeAreaView style={s.screen}>
      {/* Top card */}
      <View style={s.sectionTop}>
        <View style={s.petCard}>
          <Text style={s.petTitle}>This is where the pet goes</Text>
          <Text style={s.petSub}>Steps fuel your pet’s happiness!</Text>
        </View>
      </View>

      {/* Bottom card */}
      <SafeAreaView style={s.sectionBottom}>
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>
            Today&apos;s Available Steps: {todaySteps.toLocaleString()}
          </Text>

          <View style={{ marginTop: 6 }}>
            <Text style={s.label}>Hunger Points: {hungerPoints}</Text>
          </View>

          <View style={{ marginTop: 6 }}>
            <Text style={[s.label, { color: hungerBarColor(), marginBottom: 5 }]}>
              Hunger Level: {Math.round(hungerLevel)}%
            </Text>
            <View style={s.barWrap}>
              <View
                style={[
                  s.barFill,
                  {
                    width: `${Math.max(0, Math.min(100, hungerLevel))}%`,
                    backgroundColor: hungerBarColor(),
                  },
                ]}
              />
            </View>
          </View>

          <View style={{ marginTop: 15, alignItems: "center" }}>
            <Pressable onPress={foodMenu} style={s.btn}>
              <Text style={s.btnText}>Food Store 🧺</Text>
            </Pressable>
            {hungerPoints < 10 && <Text style={s.hint}>Need 10 hunger points to feed</Text>}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}
