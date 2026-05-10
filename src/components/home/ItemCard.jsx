import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ItemCard({ item }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={[styles.img, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={24} color={item.iconColor} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <View style={styles.locRow}>
          <Ionicons name="location-outline" size={11} color="#9AA3BB" />
          <Text style={styles.loc}>{item.location} · {item.time}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: item.badgeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: item.badgeStyle.text }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9AA3BB" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 0.5, borderColor: "rgba(0,30,100,0.08)", marginBottom: 10,
  },
  img: { width: 56, height: 56, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: "600", color: "#0B0F1A" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  loc: { fontSize: 12, color: "#5A6480" },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, marginTop: 6 },
  badgeText: { fontSize: 11, fontWeight: "700" },
});