// app/stats.tsx
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, View, Text, Image, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";

export default function Stats() {
  const { todaySteps, hungerLevel, weeklySteps } = useLocalSearchParams();
  const screenWidth = Dimensions.get("window").width - 32;

  // Parse values from params
  const parsedWeeklySteps: number[] = weeklySteps ? JSON.parse(weeklySteps as string) : [];
  const parsedTodaySteps: number = todaySteps ? Number(todaySteps) : 0;
  const parsedHungerLevel: number = hungerLevel ? Number(hungerLevel) : 0;

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#eef2f7" }}>
      {/* Pet image */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={require("./assets/icon128.png")}
          style={{ width: 128, height: 128, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Your pet is happy!
        </Text>
      </View>

      {/* Info boxes */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
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
          <Text style={{ marginTop: 4 }}>{Math.round(parsedHungerLevel)}%</Text>
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
          <Text style={{ marginTop: 4 }}>
            {parsedTodaySteps.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Weekly bar chart */}
      <View
        style={{
          marginBottom: 20,
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: 16,
          alignItems: "center",
          paddingRight: 42,
        }}
      >
        <BarChart
          data={{
            labels,
            datasets: [{ data: parsedWeeklySteps }],
          }}
          width={screenWidth}
          height={220}
          fromZero
          yAxisLabel=""
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: () => "#60a5fa",
            labelColor: () => "#475569",
            propsForBackgroundLines: { strokeWidth: 0 },
          }}
          style={{ borderRadius: 16 }}
        />
      </View>

      {/* Lifetime steps */}
      <View
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: 16,
          padding: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "700" }}>Lifetime Steps</Text>
        <Text style={{ marginTop: 4 }}>
          {parsedWeeklySteps.reduce((a, b) => a + b, 0).toLocaleString()}
        </Text>
      </View>
    </SafeAreaView>
  );
}
