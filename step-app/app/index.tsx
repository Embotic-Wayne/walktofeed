// app/index.tsx
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function Home() {
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
          onPress={() => router.push('/steps')}
          style={({ pressed }) => ({
            backgroundColor: '#111827',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 14,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
            Open Step & Hunger Meter
          </Text>
        </Pressable>
      </View>

      {/* footer spacing */}
      <View style={{ height: 12 }} />
    </SafeAreaView>
  );
}
