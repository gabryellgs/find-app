import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  Pressable,
} from "react-native";
import { useRef, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import LogoFind from "../layout/LogoFind";

const { width: screenWidth } = Dimensions.get("window");
const isMobile = screenWidth < 768;

const colors = {
  button: "#1eaed4",
  buttonDeep: "#1596b8",
  surface: "#FFFFFF",
  surfaceAlt: "#f4fafd",
  text: "#06101f",
  textMuted: "#6B7898",
  accent: "#ddf3fc",
  accentStrong: "#b8e9fa",
  border: "rgba(0, 30, 100, 0.07)",
  borderAccent: "rgba(30, 174, 212, 0.20)",
  borderStrong: "rgba(30, 174, 212, 0.30)",
};

const NAV_LINKS = [
  { label: "Benefícios", icon: "star-outline" },
  { label: "Como funciona", icon: "help-circle-outline" },
  { label: "Depoimentos", icon: "chatbubble-outline" },
];

function NavLink({ label, icon }) {
  const underline = useRef(new Animated.Value(0)).current;

  const onIn = () => {
    Animated.timing(underline, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const onOut = () => {
    Animated.timing(underline, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const underlineWidth = underline.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Pressable
      onPressIn={onIn}
      onPressOut={onOut}
      style={styles.navLinkWrap}
    >
      <Ionicons
        name={icon}
        size={14}
        color={colors.textMuted}
        style={{ marginRight: 5 }}
      />

      <View>
        <Text style={styles.menuText}>{label}</Text>

        <Animated.View
          style={[styles.navUnderline, { width: underlineWidth }]}
        />
      </View>
    </Pressable>
  );
}

export default function NavBar({ onLogin, onRegister }) {
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Status Bar */}
      <View
        style={[
          styles.statusBarFill,
          { height: insets.top },
        ]}
      />

      <View style={styles.container}>
        {/* Logo */}
        <LogoFind
          size={isMobile ? "small" : "normal"}
          dark={false}
        />

        {/* Menu Desktop */}
        {!isMobile && (
          <View style={styles.menu}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                label={link.label}
                icon={link.icon}
              />
            ))}
          </View>
        )}

        {/* Botões */}
        <View style={styles.actions}>
          {/* Login */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={onLogin}
            activeOpacity={0.75}
          >
            <Ionicons
              name="log-in-outline"
              size={14}
              color={colors.text}
            />

            <Text style={styles.loginText}>
              Entrar
            </Text>
          </TouchableOpacity>

          {/* Cadastro */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={onRegister}
            activeOpacity={0.82}
          >
            <Text style={styles.registerText}>
              Cadastre-se
            </Text>

            {!isMobile && (
              <Ionicons
                name="arrow-forward"
                size={13}
                color="#fff"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },

  statusBarFill: {
    backgroundColor: colors.surface,
    width: "100%",
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: isMobile ? 16 : 24,
    paddingVertical: 10,

    minHeight: isMobile ? 52 : 64,
  },

  menu: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  navLinkWrap: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 8,
  },

  menuText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
  },

  navUnderline: {
    height: 1.5,
    backgroundColor: colors.button,
    borderRadius: 1,
    marginTop: 2,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,

    backgroundColor: colors.surfaceAlt,

    paddingHorizontal: isMobile ? 12 : 14,
    paddingVertical: 8,

    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },

  loginText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,

    backgroundColor: colors.button,

    paddingHorizontal: isMobile ? 12 : 16,
    paddingVertical: isMobile ? 8 : 9,

    borderRadius: 10,

    shadowColor: colors.button,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  registerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
});