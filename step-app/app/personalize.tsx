// app/personalize.tsx
import { SafeAreaView, View, Text, TextInput, Pressable, Image, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { s } from "./styles";

const GENDERS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
];

export default function Personalize() {
  const router = useRouter();
  const [petName, setPetName] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  async function handleContinue() {
    if (!petName.trim()) {
      Alert.alert("Name Required", "Please enter a name for your pet.");
      return;
    }
    if (!selectedGender) {
      Alert.alert("Gender Required", "Please select a gender for your pet.");
      return;
    }

    try {
      await AsyncStorage.setItem("petName", petName);
      await AsyncStorage.setItem("petGender", selectedGender);
      router.replace("/steps");
    } catch (err) {
      console.error("Error saving pet info:", err);
    }
  }

  function selectGender(gender: string) {
    setSelectedGender(gender);
    setShowGenderDropdown(false);
  }

  return (
    <SafeAreaView style={s.screen}>
      <Image
        source={require("../assets/images/personalize.png")}
        style={{
          width: "100%",
          height: 400,
          resizeMode: "contain",
          marginTop: 90,
        }}
      />

      <View style={{ flex: 1, marginTop: -190, paddingHorizontal: 20 }}>
        {/* Pet name input */}
        <View style={{ marginBottom: 15 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Pet Name
          </Text>
          <TextInput
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              borderWidth: 2,
              borderColor: "#e5e7eb",
              textAlign: "center",
            }}
            placeholder="Enter your pet's name"
            value={petName}
            onChangeText={setPetName}
            maxLength={20}
          />
        </View>

        {/* Gender dropdown */}
        <View style={{ marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Gender
          </Text>

          <Pressable
            onPress={() => setShowGenderDropdown(!showGenderDropdown)}
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              borderWidth: 2,
              borderColor: "#e5e7eb",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: selectedGender ? "#111827" : "#9ca3af",
              }}
            >
              {selectedGender
                ? GENDERS.find((g) => g.id === selectedGender)?.label
                : "Select gender"}
            </Text>
            <Text style={{ fontSize: 18, color: "#6b7280" }}>
              {showGenderDropdown ? "▲" : "▼"}
            </Text>
          </Pressable>

          {showGenderDropdown && (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#e5e7eb",
                marginTop: 4,
                overflow: "hidden",
              }}
            >
              {GENDERS.map((gender) => (
                <Pressable
                  key={gender.id}
                  onPress={() => selectGender(gender.id)}
                  style={({ pressed }) => ({
                    padding: 16,
                    backgroundColor: pressed ? "#f3f4f6" : "white",
                    borderBottomWidth:
                      gender.id !== GENDERS[GENDERS.length - 1].id ? 1 : 0,
                    borderBottomColor: "#e5e7eb",
                  })}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#111827",
                      textAlign: "center",
                    }}
                  >
                    {gender.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => ({
            backgroundColor: "#111827",
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            opacity: pressed ? 0.9 : 1,
            alignSelf: "center",
          })}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "700",
              fontSize: 18,
            }}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
