// app/chat.tsx
import { SafeAreaView, View, Text, TextInput, Pressable, FlatList } from "react-native";
import { s } from "./styles";
import { useState } from "react";
import { router } from "expo-router";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi! I’m Claude. Ask me anything." },
  ]);

  // Height & weight inputs for step goal
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [stepGoal, setStepGoal] = useState<number | null>(null);

  // 👇 change if your server IP/port is different on your LAN
  const CHAT_SERVER = "http://10.252.2.113:3000/chat";

  // Calculate step goal based on height & weight
  const calculateStepGoal = () => {
    const hInches = parseFloat(height);
    const wLbs = parseFloat(weight);
    if (!hInches || !wLbs) return;

    // Convert to metric for BMI
    const hMeters = hInches * 0.0254;
    const wKg = wLbs * 0.453592;

    const bmi = wKg / (hMeters ** 2);
    const steps = Math.round(10000 * (1 + (bmi - 21) / 10));

    setStepGoal(steps);

    setMessages(cur => [
      ...cur,
      { role: "assistant", content: `Based on your height and weight, your step goal for today is ${steps} steps.` },
    ]);
  };

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;

    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setText("");
    setSending(true);

    try {
      const res = await fetch(CHAT_SERVER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const json = await res.json();
      const reply = json?.reply ?? "…(no reply)…";
      setMessages(cur => [...cur, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(cur => [
        ...cur,
        { role: "assistant", content: "Oops — I couldn’t reach the chat server." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.content}>
        <Text style={s.title}>💬 Chat</Text>

        {/* Height & Weight input for step goal */}
        {stepGoal === null && (
          <View style={{ marginVertical: 16 }}>

            {/* Height */}
            <Text style={{ marginBottom: 4, fontWeight: "bold", color: "#111827" }}>
              Height (in inches)
            </Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              placeholder="e.g., 67"
              keyboardType="numeric"
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            />

            {/* Weight */}
            <Text style={{ marginTop: 12, marginBottom: 4, fontWeight: "bold", color: "#111827" }}>
              Weight (in pounds)
            </Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g., 150"
              keyboardType="numeric"
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            />

            <Pressable
              style={[s.btn, { marginTop: 10 }]}
              onPress={calculateStepGoal}
            >
              <Text style={s.btnText}>Calculate Step Goal</Text>
            </Pressable>
          </View>
        )}

        {/* Messages */}
        <FlatList
          style={{ marginTop: 12, flexGrow: 0, maxHeight: 420 }}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 10,
                borderRadius: 12,
                marginVertical: 6,
                alignSelf: item.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: item.role === "user" ? "#2563eb" : "white",
                borderWidth: item.role === "user" ? 0 : 1,
                borderColor: "#e5e7eb",
                maxWidth: "85%",
              }}
            >
              <Text style={{ color: item.role === "user" ? "white" : "#111827" }}>
                {item.content}
              </Text>
            </View>
          )}
        />

        {/* Input + Send */}
        {stepGoal !== null && (
          <View style={{ marginTop: 16 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              returnKeyType="send"
              onSubmitEditing={send}
              editable={!sending}
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            />
            <Pressable
              style={[s.btn, { marginTop: 10, opacity: text.trim() && !sending ? 1 : 0.6 }]}
              onPress={send}
              disabled={!text.trim() || sending}
            >
              <Text style={s.btnText}>{sending ? "Sending..." : "Send"}</Text>
            </Pressable>
          </View>
        )}

        {/* Back button */}
        <View style={{ marginTop: 16 }}>
          <Pressable style={s.btn} onPress={() => router.back()}>
            <Text style={s.btnText}>⬅️ Back</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
