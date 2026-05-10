import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StatsRow() {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Ionicons name="alert-circle-outline" size={16} color="#b32e29" style={{ marginBottom: 4 }} />
        <Text style={styles.label}>Itens perdidos</Text>
        <Text style={[styles.value, { color: "#b32e29" }]}>1.204</Text>
        <Text style={styles.sub}>esta semana</Text>
      </View>
      <View style={styles.card}>
        <Ionicons name="checkmark-circle-outline" size={16} color="#0a7a3e" style={{ marginBottom: 4 }} />
        <Text style={styles.label}>Encontrados</Text>
        <Text style={[styles.value, { color: "#0a7a3e" }]}>847</Text>
        <Text style={styles.sub}>retornados</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginBottom: 24 },
  card: {
    flex: 1, backgroundColor: "#fff",
    borderRadius: 14, padding: 14,
    borderWidth: 0.5, borderColor: "rgba(0,30,100,0.08)",
  },
  label: { fontSize: 12, color: "#5A6480", marginBottom: 4 },
  value: { fontSize: 22, fontWeight: "700" },
  sub: { fontSize: 11, color: "#5A6480", marginTop: 4 },
});