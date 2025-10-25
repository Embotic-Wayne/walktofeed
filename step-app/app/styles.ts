// app/styles.ts
import { StyleSheet } from "react-native";

export const colors = {
  bg: "#eef2f7",
  card: "#f8fafc",
  text: "#0f172a",
  sub: "#64748b",
  primary: "#111827",
  border: "#e5e7eb",
  success: "#41e321",
  warn: "#ecc607",
  danger: "#dc2626",
  barBg: "#c9c9c9",
};

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },

  sectionTop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  petCard: {
    height: "105%", width: "105%", maxWidth: 720,
    backgroundColor: colors.card, borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12,
  },
  petTitle: { fontSize: 32, fontWeight: "700", textAlign: "center", color: colors.text },
  petSub: { fontSize: 16, color: colors.sub, marginTop: 8, textAlign: "center" },

  sectionBottom: { alignItems: "center", justifyContent: "flex-end", padding: 24, backgroundColor: colors.bg },
  stepsCard: {
    width: "92%", maxWidth: 720, backgroundColor: colors.card,
    borderRadius: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12,
  },
  stepsTitle: { fontSize: 24, fontWeight: "600", color: colors.text },

  label: { fontSize: 16, fontWeight: "600", color: colors.text },
  hint: { color: colors.sub, fontSize: 12, marginTop: 5 },

  barWrap: { width: "100%", height: 12, backgroundColor: colors.barBg, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%" },

  // Food store
  shopScreen: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  shopTitle: { fontSize: 28, fontWeight: "700", marginBottom: 20, color: colors.text },
  shopPoints: { fontSize: 16, color: colors.text, textAlign: "center", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16 },
  foodCard: {
    width: 115, height: 150, backgroundColor: colors.card, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, padding: 8,
  },
  foodName: { fontSize: 18, fontWeight: "600", marginBottom: 4, color: colors.text },
  foodMeta: { fontSize: 14, color: colors.sub, fontWeight: "500" },

  // Button
  btn: {
    backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
  },
  btnText: { color: "white", fontWeight: "700" },
});
