import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const logoSource = require("../../../assets/logo/logo-find.webp");

export default function LogoFind({ size = "normal", dark = true }) {
  const isSmall = size === "small";
  const isLarge = size === "large";

  const iconSize = isSmall ? 36 : isLarge ? 72 : 52;
  const fontSize = isSmall ? 18 : isLarge ? 36 : 26;
  const tagSize = isSmall ? 6 : isLarge ? 14 : 10;

  const primaryColor = dark ? "#000000" : "#000000";
  const accentColor = "#00d1ff";
  const taglineColor = dark ? "rgba(0,0,0,0.5)" : "#6B7280";

  return (
    <View style={styles.wrapper}>
      <Image
        source={logoSource}
        style={{ width: iconSize, height: iconSize }}
        resizeMode="contain"
      />

      <View style={styles.textContainer}>
        <Text style={[styles.brandName, { fontSize }]}>
          <Text style={{ color: primaryColor }}>FIND</Text>
        </Text>

        <Text
          style={[
            styles.tagline,
            { fontSize: tagSize, color: taglineColor },
          ]}
        >
          sistema de achados e perdidos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  brandName: {
    fontWeight: "700",
    includeFontPadding: false,
  },
  tagline: {
    marginTop: -2, // 👈 aproxima do título
    fontWeight: "400",
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
});