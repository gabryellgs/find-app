import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LogoFind from "../layout/LogoFind";

const colors = { primary: "#90dbf4", primaryDark: "#0B3A4A" };

export default function HomeHeader() {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <View style={{ transform: [{ scale: 0.8 }], transformOrigin: "left" }}>
          <LogoFind color={colors.primaryDark} />
        </View>
      </View>
      <TouchableOpacity style={styles.notifBtn}>
        <Ionicons name="notifications-outline" size={20} color={colors.primaryDark} />
      </TouchableOpacity>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>JD</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingBottom: 28,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notifBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#0B3A4A", fontSize: 13, fontWeight: "600" },
});