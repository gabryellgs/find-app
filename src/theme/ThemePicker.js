import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "./ThemeContext";

const SWATCHES = [
  { name: "blue",   color: "#1eaed4" },
  { name: "purple", color: "#7c3aed" },
  { name: "green",  color: "#059669" },
  { name: "orange", color: "#ea580c" },
];

export default function ThemePicker() {
  const { themeName, setThemeName } = useTheme();

  return (
    <View style={styles.row}>
      {SWATCHES.map(({ name, color }) => (
        <TouchableOpacity
          key={name}
          onPress={() => setThemeName(name)}
          style={[
            styles.swatch,
            { backgroundColor: color },
            themeName === name && styles.swatchActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap:           10,
    padding:       12,
  },
  swatch: {
    width:        28,
    height:       28,
    borderRadius: 14,
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});