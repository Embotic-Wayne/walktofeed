import { StyleSheet } from "react-native";
// Unified palette matching the provided Figma design and existing tokens
export const colors = {
  // Base
  bg: "#FDD9FF", // soft lavender background from design
  card: "rgba(255,255,255,0.6)",
  text: "#000000",
  sub: "#64748b",
  primary: "#111827",
  border: "#e5e7eb",
  success: "#31C731", // ring color
  warn: "#ecc607",
  danger: "#dc2626",
  barBg: "#d9d9d9", // base gray bars in chart

  // Brand accents
  nav: "#9B4E9F",

  // Chart bars
  barSu: "#E79547",
  barM: "#559B40",
  barT: "#9DD45F",
  barW: "#F0DD6E",
  barTh: "#C1E69C",
  barF: "#D9D9D9",
  barS: "#D9D9D9",
};

export const s = StyleSheet.create({
  // Screen
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 18 },

  // Pet Card
  sectionTop: {
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  petCard: {
    height: "86%",
    width: "102%",
    backgroundColor: colors.card,
    borderRadius: 40,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#00305A",
    shadowOpacity: 0.25,
    shadowOffset: { width: -2, height: 2 },
    shadowRadius: 10,
    elevation: 6,
  },
  petTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  petImageWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 6 },
  petImage: { width: 280, height: 280, resizeMode: "contain" },
  petMood: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
    letterSpacing: -0.4,
    marginTop: 6,
    marginBottom: 2,
  },
  // Subtitle under the pet title
  petSub: { fontSize: 16, textAlign: "center", color: colors.sub, marginTop: 6 },

  // Stats row (Today / Hunger)
  statsRow: { flexDirection: "row", gap: 20, marginBottom: 20 },
  statCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    shadowColor: "#00305A",
    shadowOpacity: 0.25,
    shadowOffset: { width: -2, height: 2 },
    shadowRadius: 10,
    elevation: 6,
  },
  statTitle: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 10, letterSpacing: -0.4 },
  ringWrap: { width: 92, height: 92, alignItems: "center", justifyContent: "center" },
  ringText: { position: "absolute", fontSize: 24, fontWeight: "700", color: colors.text },

  // Step Report Card
  stepsCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 40,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#00305A",
    shadowOpacity: 0.25,
    shadowOffset: { width: -2, height: 2 },
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  stepsTitle: { fontSize: 24, fontWeight: "700", color: colors.text, textAlign: "center", marginBottom: 16 },
  chartRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 95, paddingHorizontal: 10, marginBottom: 10 },
  bar: { width: 24, borderRadius: 4 },
  chartLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8 },
  chartLabelText: { fontSize: 16, fontWeight: "700", color: colors.text },

  // Step Total pill
  totalPill: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 24,
    shadowColor: "#00305A",
    shadowOpacity: 0.25,
    shadowOffset: { width: -2, height: 2 },
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 12,
  },
  totalPillText: { textAlign: "center", fontSize: 20, fontWeight: "700", color: colors.text },

  // Bottom Nav
  navBar: {
    width: "110%", // extend to screen edges
    height: 77,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    marginHorizontal: -20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 20,
  },
  navBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.nav,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },

  // Labels & helpers
  label: { fontSize: 16, fontWeight: "700", color: colors.text },
  hint: { color: colors.sub, fontSize: 12, marginTop: 5 },

  // Generic progress bar (not the circular one)
  barWrap: { width: "100%", height: 12, backgroundColor: colors.barBg, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%" },

  // Shop
  shopScreen: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  shopTitle: { fontSize: 28, fontWeight: "700", marginBottom: 20, color: colors.text, textAlign: "center" },
  shopPoints: { fontSize: 16, color: colors.text, textAlign: "center", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16 },
  foodCard: {
    width: 115,
    height: 150,
    backgroundColor: colors.card,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    padding: 8,
  },
  foodName: { fontSize: 18, fontWeight: "600", marginBottom: 4, color: colors.text },
  foodMeta: { fontSize: 14, color: colors.sub, fontWeight: "500" },

  // Buttons
  btn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  btnText: { color: "white", fontWeight: "700" },
});