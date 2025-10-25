// app/index.tsx
import { useEffect, useState } from "react";
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
  const [hasPet, setHasPet] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if a pet has already been selected
    (async () => {
      const chosenPet = await AsyncStorage.getItem("selectedPet");
      setHasPet(!!chosenPet);
    })();
  }, []);

  async function handleOpenSteps() {
    if (!hasPet) {
      // Redirect to choose pet screen if no pet selected
      router.push("/choosepet");
    } else {
      // Redirect to steps screen
      router.push("/steps");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 24, backgroundColor: '#eef2f7' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 16 }}>
          Walk to Feed
        </Text>
        <Text style={{ color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
          Track steps → earn hunger points → feed your pet.
        </Text>

        <Pressable
          onPress={handleOpenSteps}
          style={({ pressed }) => ({
            backgroundColor: '#111827',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 14,
            opacity: pressed ? 0.9 : 1,
            marginBottom: 12,
          })}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
            Open Step & Hunger Meter
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/choosepet')}
          style={({ pressed }) => ({
            backgroundColor: '#3b82f6',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 14,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
            Choose Your Pet
          </Text>
        </Pressable>
      </View>

      {/* footer spacing */}
      <View style={{ height: 12 }} />
    </SafeAreaView>
  );
}
