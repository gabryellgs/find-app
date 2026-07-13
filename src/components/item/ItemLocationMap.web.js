import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  textMuted: "#475569",
};

/** Web não suporta react-native-maps — mostra um link para abrir no Google Maps. */
export default function ItemLocationMap({ latitude, longitude }) {
  const abrirMapa = () => {
    Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={abrirMapa} activeOpacity={0.85}>
      <View style={styles.iconWrap}>
        <Ionicons name="map-outline" size={22} color={colors.primaryDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Ver localização no mapa</Text>
        <Text style={styles.subtitle}>Abrir no Google Maps</Text>
      </View>
      <Ionicons name="open-outline" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: "rgba(15, 23, 42, 0.08)",
  },
  iconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: "rgba(144,219,244,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 13.5, fontWeight: "700", color: colors.primaryDark },
  subtitle: { fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
});
