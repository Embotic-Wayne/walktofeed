import { SafeAreaView, View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { s } from "./styles"; // adjust path if needed

const PETS = [
  { id: "cat", img: require("../assets/images/cat.png") },
  { id: "pufferfish", img: require("../assets/images/pufferfish.png") },
  { id: "chicken", img: require("../assets/images/chicken.png") },
];

export default function ChoosePet() {
  const router = useRouter();

  function selectPet(petId: string) {
    // TODO: save pet selection to AsyncStorage later
    console.log("Selected pet:", petId);
    router.push("/personalize");
  }

  return (
    <SafeAreaView style={s.screen}>
      {/* Top header image */}
      <Image
        source={require("../assets/images/choose-your-friend.png")}
        style={{ 
          width: "100%", 
          height: 400,
          resizeMode: "contain", 
          marginTop: -60  // Moved up significantly to fill top gap
        }}
      />

      <View style={{ flex: 1, marginTop: 0 }}>
        {/* Top row: Cat and Pufferfish */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginBottom: 40 }}>
          <Pressable 
            onPress={() => selectPet("cat")}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }]
            })}
          >
            <Image
              source={require("../assets/images/cat.png")}
              style={{
                width: 200,
                height: 200,
                borderRadius: 20,
              }}
            />
          </Pressable>
          
          <Pressable 
            onPress={() => selectPet("pufferfish")}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }]
            })}
          >
            <Image
              source={require("../assets/images/pufferfish.png")}
              style={{
                width: 200,
                height: 200,
                borderRadius: 20,
              }}
            />
          </Pressable>
        </View>

        {/* Bottom center: Chicken */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Pressable 
            onPress={() => selectPet("chicken")}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }]
            })}
          >
            <Image
              source={require("../assets/images/chicken.png")}
              style={{
                width: 200,
                height: 200,
                borderRadius: 20,
              }}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}