// app/choosepet.tsx
import { SafeAreaView, View, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { s } from "./styles";

export default function ChoosePet() {
  const router = useRouter();

  async function selectPet(petId: string) {
    await AsyncStorage.setItem("selectedPet", petId);
    console.log("Selected pet:", petId);
    router.push("/personalize");
  }

  return (
    <SafeAreaView style={s.screen}>
      <Image
        source={require("../assets/images/choose-your-friend.png")}
        style={{
          width: "100%",
          height: 400,
          resizeMode: "contain",
          marginTop: -60,
        }}
      />

      <View style={{ flex: 1, marginTop: 0 }}>
        {/* Cat and Pufferfish */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <Pressable onPress={() => selectPet("cat")}>
            <Image
              source={require("../assets/images/cat.png")}
              style={{ width: 200, height: 200, borderRadius: 20 }}
            />
          </Pressable>

          <Pressable onPress={() => selectPet("pufferfish")}>
            <Image
              source={require("../assets/images/pufferfish.png")}
              style={{ width: 200, height: 200, borderRadius: 20 }}
            />
          </Pressable>
        </View>

        {/* Chicken */}
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Pressable onPress={() => selectPet("chicken")}>
            <Image
              source={require("../assets/images/chicken.png")}
              style={{ width: 200, height: 200, borderRadius: 20 }}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
