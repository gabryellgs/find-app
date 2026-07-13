import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

/** Bloco com pulso de opacidade — placeholder animado enquanto o conteúdo real carrega. */
export default function Skeleton({ width, height, borderRadius = 10, style }) {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius, opacity: pulse },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "rgba(11, 58, 74, 0.09)",
  },
});
