import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const categories = [
  { label: "Todos",  icon: "apps" },
  { label: "Comida", icon: "fast-food" },
  { label: "Carro",  icon: "car" },
  { label: "Casa",   icon: "home" },
  { label: "Tech",   icon: "phone-portrait" },
  { label: "Moda",   icon: "shirt" },
];

export default function CategoryList() {
  const [active, setActive] = useState(0);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {categories.map((cat, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => setActive(i)}
          style={[styles.cat, active === i && styles.catActive]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={cat.icon}
            size={14}
            color={active === i ? "#0B3A4A" : "#5A6480"}
          />
          <Text style={[styles.catText, active === i && styles.catTextActive]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginBottom: 24, marginTop: -4 },
  row: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  cat: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, borderWidth: 0.5,
    borderColor: "rgba(0,30,100,0.08)", backgroundColor: "#fff",
  },
  catActive: { backgroundColor: "#90dbf4", borderColor: "#90dbf4" },
  catText: { fontSize: 13, color: "#5A6480", fontWeight: "500" },
  catTextActive: { color: "#0B3A4A", fontWeight: "600" },
});