// stats.tsx
import { useState } from "react";
import { View, Text, SafeAreaView, Image, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";

// Wrap BarChart to satisfy TypeScript
const MyBarChart: any = BarChart;

export default function Stats() {
  const screenWidth = Dimensions.get("window").width - 32;

  // Example data
  const weeklySteps = [1200, 3400, 2800, 5000, 4300, 3900, 6100];
  const todaySteps = 4300;
  const hungerLevel = 75;

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#eef2f7" }}>
      {/* Pet image and status */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={require("./assets/icon128.png")}
          style={{ width: 128, height: 128, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Your pet is happy!
        </Text>
      </View>

      {/* Two boxes side by side */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#f8fafc",
            borderRadius: 16,
            padding: 16,
            marginRight: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>Hunger Level</Text>
          <Text style={{ marginTop: 4 }}>{Math.round(hungerLevel)}%</Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#f8fafc",
            borderRadius: 16,
            padding: 16,
            marginLeft: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>Today's Steps</Text>
          <Text style={{ marginTop: 4 }}>{todaySteps.toLocaleString()}</Text>
        </View>
      </View>

      {/* Weekly steps bar chart */}
      <View style={{ marginBottom: 20 }}>
        <MyBarChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{ data: weeklySteps }],
          }}
          width={screenWidth}
          height={220}
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: () => "#60a5fa",
            labelColor: () => "#475569",
            style: { borderRadius: 16 },
          }}
          style={{ borderRadius: 16 }}
        />
      </View>

      {/* Lifetime steps box */}
      <View
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: 16,
          padding: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "700" }}>Lifetime Steps</Text>
        <Text style={{ marginTop: 4 }}>{weeklySteps.reduce((a, b) => a + b, 0).toLocaleString()}</Text>
      </View>
    </SafeAreaView>
  );
}
