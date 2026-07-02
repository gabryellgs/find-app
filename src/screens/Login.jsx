import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { useRef, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import LogoFind from "../components/layout/LogoFind";
import * as auth from "../services/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { fetchStats } from "../services/api";

WebBrowser.maybeCompleteAuthSession();

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isMobile = screenWidth < 768;

// ─── Paleta (mesma do Register) ───────────────────────────────────────────────
const colors = {
  button:        "#6dcef0",
  buttonDeep:    "#092e3b",
  buttonDarker:  "#061f28",
  surface:       "#FFFFFF",
  surfaceAlt:    "#f4fafd",
  surfaceDeep:   "#eaf6fb",
  text:          "#06101f",
  textMuted:     "#6B7898",
  textLight:     "#0B3A4A",
  accent:        "#ddf3fc",
  accentStrong:  "#b8e9fa",
  heroBorder:    "rgba(255,255,255,0.25)",
  border:        "rgba(0, 30, 100, 0.07)",
  borderAccent:  "rgba(11, 58, 74, 0.20)",
  borderStrong:  "rgba(11, 58, 74, 0.35)",
  error:         "#e8514a",
  errorBg:       "#fff5f5",
  errorBorder:   "rgba(232, 81, 74, 0.25)",
  hero:          "#90dbf4",
  heroDeep:      "#6dcef0",
};

// ─── Staggered fade+slide ─────────────────────────────────────────────────────
function FadeSlide({ delay = 0, children, style }) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({ label, icon, value, onChangeText, secureEntry, keyboardType, autoCapitalize, error }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [
      error ? colors.errorBorder : colors.borderAccent,
      error ? colors.error       : colors.button,
    ],
  });

  return (
    <View style={styles.inputWrapper}>
      <Text style={[styles.inputLabel, error && { color: colors.error }]}>{label}</Text>
      <Animated.View style={[
        styles.inputBox,
        {
          borderColor,
          backgroundColor: error ? colors.errorBg : (focused ? colors.surface : colors.surfaceAlt),
        },
      ]}>
        <Ionicons
          name={icon}
          size={16}
          color={focused ? colors.button : (error ? colors.error : colors.textMuted)}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={secureEntry && !visible}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize || "none"}
          autoCorrect={false}
          placeholderTextColor={colors.textMuted + "90"}
          placeholder={label}
          underlineColorAndroid="transparent"
        />
        {secureEntry && (
          <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.eyeBtn}>
            <Ionicons
              name={visible ? "eye-outline" : "eye-off-outline"}
              size={16}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <View style={styles.feedbackRow}>
          <Ionicons name="alert-circle-outline" size={12} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Loading Dots ─────────────────────────────────────────────────────────────
function LoadingDots() {
  const dots = [0, 1, 2].map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 7, height: 7, borderRadius: 4,
            backgroundColor: "#fff",
            opacity: dot,
            transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          }}
        />
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Login({ onLogin, onGoToRegister, onBack }) {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [stats, setStats] = useState({ devolvidos: 0, total: 0, encontrados: 0 });

  useEffect(() => {
    fetchStats().then(res => {
      if (res && res.data) setStats(res.data);
    }).catch(() => {});
  }, []);

  // Configuração Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "",
    iosClientId: "",
    webClientId: "1040008461633-2do9scjtl937vmt0pflpeuml57jr11ke.apps.googleusercontent.com",
    expoClientId: "1040008461633-2do9scjtl937vmt0pflpeuml57jr11ke.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleLogin(id_token);
      } else {
        // As vezes o Expo retorna um authentication object em vez de id_token nos params diretos
        const token = response.authentication?.idToken;
        if (token) handleGoogleLogin(token);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    setLoading(true);
    setErrors({});
    try {
      await auth.googleLogin(idToken);
      setLoading(false);
      navigation.navigate("main");
    } catch (err) {
      setLoading(false);
      setErrors({ general: err.message || "Erro ao fazer login com Google" });
    }
  };

  const btnScale   = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  const validate = () => {
    const e = {};
    if (!email.trim())            e.email    = "Informe seu e-mail ou usuário";
    if (!password)                e.password = "Informe sua senha";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await auth.login(email, password);
      setLoading(false);
      navigation.navigate("main");
    } catch (err) {
      setLoading(false);
      setErrors({ general: err.message || "Usuário ou senha incorretos" });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ── HERO AZUL ───────────────────────────────────────────────────── */}
        <View style={[styles.heroTop, { paddingTop: insets.top + 16 }]}>

          {/* Orbs decorativos */}
          <View style={styles.heroOrb1} pointerEvents="none" />
          <View style={styles.heroOrb2} pointerEvents="none" />
          <View style={styles.heroOrb3} pointerEvents="none" />

          {/* Botão voltar */}
          {onBack && (
            <FadeSlide delay={0}>
              <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.75}>
                <Ionicons name="chevron-back" size={19} color="#fff" />
              </TouchableOpacity>
            </FadeSlide>
          )}

          {/* Logo */}
          <FadeSlide delay={60}>
            <View style={styles.logoWrapper}>
              <LogoFind size="md" />
            </View>
          </FadeSlide>

          {/* Headline */}
          <FadeSlide delay={130} style={{ alignItems: "center", gap: 8 }}>
            <Text style={styles.heroTitle}>Acesse sua conta</Text>
            <Text style={styles.heroSub}>Gerencie seus itens perdidos e encontrados com agilidade e segurança.</Text>
          </FadeSlide>

          {/* Stats strip */}
          <FadeSlide delay={200}>
            <View style={styles.benefitsRow}>
              {[
                { icon: "bag-check-outline", text: `${stats.total} Cadastrados`  },
                { icon: "shield-checkmark-outline", text: `${stats.devolvidos} Devolvidos`     },
                { icon: "location-outline",  text: `${stats.encontrados} Achados`       },
              ].map(({ icon, text }, i) => (
                <View key={text} style={[styles.benefitItem, i < 2 && styles.benefitBorder]}>
                  <View style={styles.benefitIconWrap}>
                    <Ionicons name={icon} size={13} color="rgba(255,255,255,0.92)" />
                  </View>
                  <Text style={styles.benefitText}>{text}</Text>
                </View>
              ))}
            </View>
          </FadeSlide>

          {/* Wave */}
          <View style={styles.wave} />
        </View>

        {/* ── CARD BRANCO ─────────────────────────────────────────────────── */}
        <View style={styles.cardArea}>
          <FadeSlide delay={260} style={styles.cardWrap}>
            <View style={styles.card}>

              {/* Erro geral */}
              {errors.general && (
                <View style={styles.generalError}>
                  <Ionicons name="alert-circle" size={14} color={colors.error} />
                  <Text style={[styles.errorText, { flex: 1 }]}>{errors.general}</Text>
                </View>
              )}

              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Entrar na conta</Text>
                <Text style={styles.cardSubtitle}>Preencha suas credenciais abaixo</Text>
              </View>

              {/* E-mail */}
              <FadeSlide delay={320}>
                <InputField
                  label="E-mail ou Usuário"
                  icon="mail-outline"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors(p => ({ ...p, email: undefined })); }}
                  keyboardType="default"
                  error={errors.email}
                />
              </FadeSlide>

              {/* Senha */}
              <FadeSlide delay={370}>
                <InputField
                  label="Senha"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors(p => ({ ...p, password: undefined })); }}
                  secureEntry
                  error={errors.password}
                />
              </FadeSlide>

              {/* Esqueci a senha */}
              <FadeSlide delay={410}>
                <TouchableOpacity style={styles.forgotWrap} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              </FadeSlide>

              {/* Botão entrar */}
              <FadeSlide delay={460}>
                <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleLogin}>
                  <Animated.View style={[
                    styles.btnLogin,
                    { transform: [{ scale: btnScale }] },
                    loading && { opacity: 0.85 },
                  ]}>
                    {loading ? <LoadingDots /> : (
                      <>
                        <Ionicons name="rocket-outline" size={17} color="#fff" />
                        <Text style={styles.btnLoginText}>Entrar</Text>
                        <View style={styles.btnArrow}>
                          <Ionicons name="arrow-forward" size={13} color="#fff" />
                        </View>
                      </>
                    )}
                  </Animated.View>
                </Pressable>
              </FadeSlide>

              {/* Divider */}
              <FadeSlide delay={510}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou continue com</Text>
                  <View style={styles.dividerLine} />
                </View>
              </FadeSlide>

              {/* Social */}
              <FadeSlide delay={560}>
                <View style={styles.socialRow}>
                  <TouchableOpacity 
                    style={styles.socialBtn} 
                    activeOpacity={0.75} 
                    onPress={() => promptAsync()}
                    disabled={!request || loading}
                  >
                    <Ionicons name="logo-google" size={18} color="#DB4437" />
                    <Text style={styles.socialText}>Google</Text>
                  </TouchableOpacity>
                </View>
              </FadeSlide>

            </View>
          </FadeSlide>

          {/* Link para cadastro */}
          <FadeSlide delay={610}>
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("register")} activeOpacity={0.7}>
                <Text style={styles.registerLink}>Cadastre-se grátis</Text>
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {/* Trust pills */}
          <FadeSlide delay={660}>
            <View style={styles.pillRow}>
              {[
                { label: "Seguro",   icon: "shield-checkmark-outline" },
                { label: "Gratuito", icon: "gift-outline"             },
                { label: "Rápido",   icon: "flash-outline"            },
              ].map(({ label, icon }) => (
                <View key={label} style={styles.pill}>
                  <Ionicons name={icon} size={11} color={colors.button} />
                  <Text style={styles.pillText}>{label}</Text>
                </View>
              ))}
            </View>
          </FadeSlide>

          <View style={{ height: insets.bottom + 24 }} />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const HERO_HEIGHT = screenHeight * 0.42;

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1 },

  // ── Hero azul ──
  heroTop: {
    backgroundColor:   colors.hero,
    minHeight:         HERO_HEIGHT,
    paddingHorizontal: isMobile ? 22 : 36,
    paddingBottom:     56,
    overflow:          "hidden",
    position:          "relative",
    gap:               18,
    alignItems:        "center",
  },
  heroOrb1: {
    position: "absolute", top: -80, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: colors.heroDeep, opacity: 0.28,
  },
  heroOrb2: {
    position: "absolute", bottom: 10, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  heroOrb3: {
    position: "absolute", top: "30%", left: "20%",
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: colors.hero, opacity: 0.10,
  },

  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: colors.heroBorder,
    alignItems: "center", justifyContent: "center",
    alignSelf: "flex-start",
  },

  logoWrapper: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.hero,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: colors.heroBorder,
    marginTop: 10, marginBottom: 14,
  },

  heroTitle: {
    fontSize: isMobile ? 24 : 32, 
    fontWeight: "900",
    color: "#fff", 
    textAlign: "center", 
    letterSpacing: -0.6,
    textShadowColor: "rgba(0, 50, 70, 0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroSub: {
    fontSize: isMobile ? 14 : 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center", lineHeight: 21,
    maxWidth: 320, alignSelf: "center",
  },

  benefitsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 16, borderWidth: 1, borderColor: colors.heroBorder,
    overflow: "hidden", alignSelf: "center",
    width: "100%", maxWidth: 390,
  },
  benefitItem:  { flex: 1, alignItems: "center", paddingVertical: 13, gap: 6 },
  benefitBorder: { borderRightWidth: 1, borderRightColor: colors.heroBorder },
  benefitIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center", justifyContent: "center",
  },
  benefitText: {
    fontSize: isMobile ? 9.5 : 10.5,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600", textAlign: "center",
  },

  // Wave
  wave: {
    position: "absolute", bottom: -1, left: -20, right: -20,
    height: 44, backgroundColor: colors.surface,
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
  },

  // ── Card area ──
  cardArea: {
    flex: 1, backgroundColor: colors.surface,
    paddingHorizontal: isMobile ? 18 : 32,
    paddingTop: 4, alignItems: "center",
  },
  cardWrap: { width: "100%", maxWidth: 440 },
  card: {
    backgroundColor: "#D3F0FC",
    borderRadius: 20, borderWidth: 1, borderColor: colors.borderAccent,
    paddingHorizontal: isMobile ? 18 : 28,
    paddingVertical: isMobile ? 22 : 28,
    shadowColor: colors.button,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 5,
  },
  cardHeader:   { marginBottom: 20 },
  cardTitle: {
    fontSize: isMobile ? 18 : 20, fontWeight: "800",
    color: colors.text, letterSpacing: -0.4, marginBottom: 3,
  },
  cardSubtitle: { fontSize: 13, color: colors.textMuted },

  generalError: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: colors.errorBg, borderColor: colors.errorBorder,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
  },

  // ── Inputs ──
  inputWrapper: { marginBottom: 13 },
  inputLabel: {
    fontSize: 11, fontWeight: "600", color: colors.textMuted,
    marginBottom: 5, letterSpacing: 0.4, textTransform: "uppercase",
  },
  inputBox: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 13, height: 50,
  },
  inputIcon: { marginRight: 9 },
  input:     { flex: 1, fontSize: 15.5, color: colors.text, paddingVertical: 0, outlineStyle: "none" },
  eyeBtn:    { padding: 5 },

  feedbackRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  errorText:   { fontSize: 11.5, color: colors.error, fontWeight: "500" },

  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13, color: colors.button, fontWeight: "600",
  },

  // ── Botão login ──
  btnLogin: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10,
    paddingVertical: 16, borderRadius: 13,
    backgroundColor: colors.button, marginBottom: 22,
    shadowColor: colors.buttonDarker,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28, shadowRadius: 14, elevation: 6,
  },
  btnLoginText: {
    fontSize: 16, fontWeight: "800", color: "#fff", letterSpacing: 0.2,
  },
  btnArrow: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center", justifyContent: "center",
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: "row", alignItems: "center",
    gap: 10, marginBottom: 16,
  },
  dividerLine: {
    flex: 1, height: 1, backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12, color: colors.textMuted, fontWeight: "500",
  },

  // ── Social ──
  socialRow: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1, flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12,
    borderRadius: 12, backgroundColor: colors.surfaceAlt,
    borderWidth: 1, borderColor: colors.border,
  },
  socialText: {
    fontSize: 13.5, fontWeight: "600", color: colors.text,
  },

  // ── Link cadastro ──
  registerRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", marginTop: 20, marginBottom: 16,
  },
  registerPrompt: { fontSize: 14, color: colors.textMuted },
  registerLink:   { fontSize: 14, color: colors.button, fontWeight: "700" },

  // ── Trust pills ──
  pillRow: {
    flexDirection: "row", gap: 8,
    flexWrap: "wrap", justifyContent: "center", marginBottom: 8,
  },
  pill: {
    flexDirection: "row", alignItems: "center",
    gap: 5, paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 20, backgroundColor: colors.surfaceDeep,
    borderWidth: 1, borderColor: colors.borderAccent,
  },
  pillText: {
    fontSize: 11.5, color: colors.textLight, fontWeight: "600",
  },
});