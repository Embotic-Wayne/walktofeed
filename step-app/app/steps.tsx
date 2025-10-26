// app/steps.tsx
import { useEffect, useRef, useState } from "react";
import { SafeAreaView, Text, View, Pressable, Image } from "react-native";
import { Pedometer } from "expo-sensors";
import { s, colors } from "./styles";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";

// ---------- Static asset maps (required for RN/Metro) ----------
const PET_IMAGES: Record<string, any> = {
  cat: require("../assets/images/cat.png"),
  pufferfish: require("../assets/images/pufferfish.png"),
  chicken: require("../assets/images/chicken.png"),
};

const SAD_PET_IMAGES: Record<string, any> = {
  cat: require("../assets/images/sad-cat.png"),
  pufferfish: require("../assets/images/sad-pufferfish.png"),
  chicken: require("../assets/images/sad-chicken.png"),
};

// 👇 This replaces `require("../assets/sounds/{petId}-audio.mp3")`
const SOUND_MAP: Record<string, any> = {
  cat: require("../assets/sounds/cat-audio.mp3"),
  pufferfish: require("../assets/sounds/pufferfish-audio.mp3"),
  chicken: require("../assets/sounds/chicken-audio.mp3"),
};

const SERVER = "http://10.252.2.113:3000/steps";

export default function Home() {
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [hungerLevel, setHungerLevel] = useState<number>(100);
  const [hungerPoints, setHungerPoints] = useState<number>(0);
  const lastSent = useRef<number>(0);
  const hungerTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [petDead, setPetDead] = useState(false);

  // Pet identity + art
  const [petId, setPetId] = useState<string | null>(null);
  const [petImage, setPetImage] = useState<any>(null);
  const [sadPetImage, setSadPetImage] = useState<any>(null);
  const [petName, setPetName] = useState<string | null>(null);

  // Sound
  const feedSound = useRef<Audio.Sound | null>(null);

  // ------- Audio global mode (once) -------
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    }).catch((e) => console.warn("Audio mode error:", e));

    return () => {
      // Unload on unmount just in case
      feedSound.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // ------- Load saved state & pet selection -------
  useEffect(() => {
    (async () => {
      try {
        const [savedHunger, savedPoints, savedPetId, name] = await Promise.all([
          AsyncStorage.getItem("hungerLevel"),
          AsyncStorage.getItem("hungerPoints"),
          AsyncStorage.getItem("selectedPet"),
          AsyncStorage.getItem("petName"),
        ]);

        if (savedHunger !== null) setHungerLevel(Number(savedHunger));
        if (savedPoints !== null) setHungerPoints(Number(savedPoints));
        else setHungerPoints(0);

        if (savedPetId) {
          setPetId(savedPetId);
          setPetImage(PET_IMAGES[savedPetId]);
          setSadPetImage(SAD_PET_IMAGES[savedPetId]);
        }

        if (name) setPetName(name);
      } catch (err) {
        console.error("Error loading saved state:", err);
      }
    })();
  }, []);

  // ------- When petId changes, (re)load the correct local sound -------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Unload any previous sound first
      try {
        await feedSound.current?.unloadAsync();
      } catch {}
      feedSound.current = null;

      if (!petId) return;

      const soundAsset = SOUND_MAP[petId];
      if (!soundAsset) {
        // optional: fallback to cat if missing asset
        return;
      }

      try {
        const { sound } = await Audio.Sound.createAsync(soundAsset, {
          shouldPlay: false,
          volume: 1.0,
        });
        if (!cancelled) {
          feedSound.current = sound;
        } else {
          // if effect was cleaned up before load completed
          await sound.unloadAsync();
        }
      } catch (e) {
        console.warn("Failed to load pet sound:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [petId]);

  // ------- Persist hunger values -------
  useEffect(() => {
    AsyncStorage.setItem("hungerLevel", hungerLevel.toString()).catch(() => {});
  }, [hungerLevel]);

  useEffect(() => {
    AsyncStorage.setItem("hungerPoints", hungerPoints.toString()).catch(() => {});
  }, [hungerPoints]);

  // ------- Weekly steps fetcher -------
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
        result.push(0);
      }
    }
    return result;
  }

  // ------- Play sound (used by pet tap + buying food) -------
  async function playFeedSound() {
    try {
      if (!feedSound.current) return; // not yet loaded (e.g., petId missing)
      await feedSound.current.replayAsync();
    } catch (e) {
      console.warn("Feed sound error:", e);
    }
  }

  // ------- Buy food (points -> hunger, play sound) -------
  function buyFood(food: { name: string; price: number; gain: number }) {
    if (hungerPoints < food.price || hungerLevel >= 100) return;
    setHungerPoints((p) => p - food.price);
    setHungerLevel((h) => Math.min(100, h + food.gain));
    playFeedSound();
  }

  // Food catalog
  const FOODS = [
    { name: "Apple 🍎", price: 5, gain: 5 },
    { name: "Cookie 🍪", price: 15, gain: 15 },
    { name: "Fish 🐟", price: 25, gain: 25 },
    { name: "Cake 🎂", price: 50, gain: 50 },
    { name: "Chicken 🍗", price: 75, gain: 75 },
    { name: "Steak 🥩", price: 100, gain: 100 },
  ];

  // ------- Hunger ticks down slowly -------
  useEffect(() => {
    hungerTimer.current = setInterval(() => {
      setHungerLevel((prev) => {
        const next = Math.max(0, prev - 2); // gentle decay
        if (next === 0 && !petDead) setPetDead(true);
        return next;
      });
    }, 1000);

    return () => {
      if (hungerTimer.current) clearInterval(hungerTimer.current);
    };
  }, [petDead]);

  // ------- Step tracking -------
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
          <Text style={s.shopPoints}>Available Yum Tokens: {hungerPoints}</Text>

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
          <Pressable style={s.navBtn} onPress={() => router.push("/")}>
            <Text style={{ color: "white", fontWeight: "700" }}>🏠</Text>
          </Pressable>
          <Pressable style={s.navBtn} onPress={() => setShowFoodMenu(true)}>
            <Text style={{ color: "white", fontWeight: "700" }}>🛒</Text>
          </Pressable>
          <Pressable
            style={s.navBtn}
            onPress={async () => {
              const weeklySteps = await getWeeklySteps();
              router.push({
                pathname: "/stats",
                params: {
                  todaySteps,
                  weeklySteps: JSON.stringify(weeklySteps),
                  hungerLevel,
                },
              });
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>📊</Text>
          </Pressable>
          {/* Chat button intentionally omitted here; placed in main nav */}
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
            <Text style={s.petTitle}>{petName || "Your Pet"}</Text>

            <View style={s.petImageWrap}>
              <Pressable onPress={playFeedSound} disabled={petDead}>
                {petDead ? (
                  <Image
                    source={require("../assets/images/grave.png")}
                    style={s.petImage}
                  />
                ) : petImage ? (
                  <Image
                    source={
                      hungerLevel > 0 && hungerLevel < 40 && sadPetImage
                        ? sadPetImage
                        : petImage
                    }
                    style={s.petImage}
                  />
                ) : (
                  <View
                    style={{
                      width: 128,
                      height: 128,
                      borderRadius: 20,
                      backgroundColor: "#e5e7eb",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#9ca3af" }}>No pet selected</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#111827",
                textAlign: "center",
                marginTop: 30,
              }}
            >
              Steps fuel your pet’s happiness!
            </Text>
          </View>
        </View>

        {/* Steps / hunger card */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 15,
            right: 15,
            alignItems: "center",
          }}
        >
          <View style={s.stepsCard}>
            <Text style={s.stepsTitle}>
              Today&apos;s Steps: {todaySteps.toLocaleString()}
            </Text>

            <View style={{ marginTop: 6 }}>
              <Text style={s.label}>Available Yum Tokens: {hungerPoints}</Text>
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
        <Pressable style={s.navBtn} onPress={() => router.push("/")}>
          <Text style={{ color: "white", fontWeight: "700" }}>🏠</Text>
        </Pressable>
        <Pressable style={s.navBtn} onPress={() => setShowFoodMenu(true)}>
          <Text style={{ color: "white", fontWeight: "700" }}>🛒</Text>
        </Pressable>
        <Pressable
          style={s.navBtn}
          onPress={async () => {
            const weeklySteps = await getWeeklySteps();
            router.push({
              pathname: "/stats",
              params: {
                todaySteps,
                weeklySteps: JSON.stringify(weeklySteps),
                hungerLevel,
              },
            });
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>📊</Text>
        </Pressable>
        <Pressable
          style={s.navBtn}
          onPress={() =>
            router.push(
              (`/chat?steps=${String(todaySteps)}&hunger=${String(
                Math.round(hungerLevel)
              )}&name=${encodeURIComponent(petName || "Mochi")}`) as any
            )
          }
        >
          <Text style={{ color: "white", fontWeight: "700" }}>💬</Text>
        </Pressable>
      </View>

      {/* Pet Death Modal */}
      {petDead && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 24,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              💀 Your pet has died!
            </Text>

            <Pressable
              onPress={async () => {
                await AsyncStorage.removeItem("selectedPet");
                await AsyncStorage.removeItem("petName");
                setPetId(null);
                setPetImage(null);
                setSadPetImage(null);
                setPetName(null);
                setHungerLevel(100);
                setHungerPoints(0);
                setPetDead(false);
                router.push("/choosepet");
              }}
              style={{
                backgroundColor: "#1f2937",
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                Pick a New Pet
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
