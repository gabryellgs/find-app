import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchBar() {
  return (
    <View style={styles.searchCard}>
      <Ionicons name="search-outline" size={16} color="#9AA3BB" />
      <TextInput
        placeholder="Buscar por item ou local..."
        placeholderTextColor="#9AA3BB"
        style={styles.input}
      />
      <TouchableOpacity style={styles.filterBtn}>
        <Ionicons name="options-outline" size={16} color="#0B3A4A" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    backgroundColor: "#fff",
    borderRadius: 16, padding: 5,
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 0.5, borderColor: "rgba(0,30,100,0.08)",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  input: { flex: 1, color: "#0B0F1A", fontSize: 14 },
  filterBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "#F5F7FB",
    alignItems: "center", justifyContent: "center",
  },
});