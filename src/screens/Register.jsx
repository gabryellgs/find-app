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
import { useNavigation } from "@react-navigation/native";
import * as auth from "../services/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import LogoFind from "../../src/components/layout/LogoFind" // ← sua logo real

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isMobile = screenWidth < 768;

// ─── Paleta obrigatória ────────────────────────────────────────────────────
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
  success:       "#10b981",
  successBg:     "#f0fdf8",
  successBorder: "rgba(16, 185, 129, 0.25)",
  hero:          "#90dbf4",
  heroDeep:      "#6dcef0",
};

// ─── Staggered fade+slide ──────────────────────────────────────────────────
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

// ─── Input Field ───────────────────────────────────────────────────────────
function InputField({
  label, icon, value, onChangeText, secureEntry,
  keyboardType, autoCapitalize, error, hint, editable = true,
}) {
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
          editable={editable}
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
      {error ? (
        <View style={styles.feedbackRow}>
          <Ionicons name="alert-circle-outline" size={12} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <View style={styles.feedbackRow}>
          <Ionicons name="information-circle-outline" size={12} color={colors.textMuted} />
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Date Field ────────────────────────────────────────────────────────────
function DateField({ label, value, onChange, error }) {
  const [focused, setFocused] = useState(false);
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

  const parts = value ? value.split("-") : ["", "", ""];
  const year  = parts[0] || "";
  const month = parts[1] || "";
  const day   = parts[2] || "";

  const update = (y, m, d) => {
    if (y || m || d) onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    else onChange("");
  };

  return (
    <View style={styles.inputWrapper}>
      <Text style={[styles.inputLabel, error && { color: colors.error }]}>{label}</Text>
      <Animated.View style={[
        styles.inputBox,
        { borderColor, backgroundColor: error ? colors.errorBg : (focused ? colors.surface : colors.surfaceAlt) },
      ]}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color={focused ? colors.button : (error ? colors.error : colors.textMuted)}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { flex: 0.6, textAlign: "center", minWidth: 0 }]}
          value={day}
          onChangeText={(v) => update(year, month, v.replace(/\D/g, "").slice(0, 2))}
          placeholder="DD"
          keyboardType="numeric"
          maxLength={2}
          placeholderTextColor={colors.textMuted + "90"}
          onFocus={onFocus}
          onBlur={onBlur}
          underlineColorAndroid="transparent"
        />
        <Text style={styles.dateSep}>/</Text>
        <TextInput
          style={[styles.input, { flex: 0.6, textAlign: "center", minWidth: 0 }]}
          value={month}
          onChangeText={(v) => update(year, v.replace(/\D/g, "").slice(0, 2), day)}
          placeholder="MM"
          keyboardType="numeric"
          maxLength={2}
          placeholderTextColor={colors.textMuted + "90"}
          onFocus={onFocus}
          onBlur={onBlur}
          underlineColorAndroid="transparent"
        />
        <Text style={styles.dateSep}>/</Text>
        <TextInput
          style={[styles.input, { flex: 1, textAlign: "center", minWidth: 0 }]}
          value={year}
          onChangeText={(v) => update(v.replace(/\D/g, "").slice(0, 4), month, day)}
          placeholder="AAAA"
          keyboardType="numeric"
          maxLength={4}
          placeholderTextColor={colors.textMuted + "90"}
          onFocus={onFocus}
          onBlur={onBlur}
          underlineColorAndroid="transparent"
        />
      </Animated.View>
      {error ? (
        <View style={styles.feedbackRow}>
          <Ionicons name="alert-circle-outline" size={12} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.feedbackRow}>
          <Ionicons name="information-circle-outline" size={12} color={colors.textMuted} />
          <Text style={styles.hintText}>Você precisa ter pelo menos 13 anos</Text>
        </View>
      )}
    </View>
  );
}

// ─── Password Strength ─────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8)                             score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password))                           score++;
    if (/[^A-Za-z0-9]/.test(password))                   score++;
    return score;
  };
  const strength = getStrength();
  const levels = [
    { label: "Fraca",    color: "#e8514a" },
    { label: "Razoável", color: "#f59e0b" },
    { label: "Boa",      color: "#f59e0b" },
    { label: "Forte",    color: "#10b981" },
  ];
  if (!password) return null;
  const current = levels[Math.min(strength - 1, 3)] || levels[0];
  return (
    <View style={styles.strengthWrap}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              { backgroundColor: i <= strength ? current.color : colors.border },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: current.color }]}>{current.label}</Text>
    </View>
  );
}

// ─── Loading Dots ──────────────────────────────────────────────────────────
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
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
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

// ─── Main Screen ──────────────────────────────────────────────────────────
export default function Register({ onBack, onGoToLogin }) {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();

  const [fullName,       setFullName]       = useState("");
  const [username,       setUsername]       = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email,          setEmail]          = useState("");
  const [password,       setPassword]       = useState("");
  const [confirm,        setConfirm]        = useState("");
  const [agreed,         setAgreed]         = useState(false);
  const [errors,         setErrors]         = useState({});
  const [loading,        setLoading]        = useState(false);

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
      setErrors({ general: err.message || "Erro ao conectar com Google" });
    }
  };

  const btnScale   = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  const calcularIdade = (val) => {
    if (!val || val.includes("-") === false) return 0;
    const [y, m, d] = val.split("-").map(Number);
    if (!y || !m || !d) return 0;
    const hoje = new Date();
    const nasc = new Date(y, m - 1, d);
    let idade  = hoje.getFullYear() - nasc.getFullYear();
    const mo   = hoje.getMonth() - nasc.getMonth();
    if (mo < 0 || (mo === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  const validate = () => {
    const e = {};
    if (!fullName.trim())                e.fullName       = "Informe seu nome completo";
    else if (fullName.trim().length < 2) e.fullName       = "Nome muito curto";
    if (!username.trim())                e.username       = "Escolha um nome de usuário";
    else if (username.trim().length < 3) e.username       = "Mínimo de 3 caracteres";
    if (!dataNascimento)                 e.dataNascimento = "Informe sua data de nascimento";
    else if (calcularIdade(dataNascimento) < 13)
                                         e.dataNascimento = "Você precisa ter pelo menos 13 anos";
    if (!email.trim())                   e.email          = "Informe seu e-mail";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                                         e.email          = "E-mail inválido";
    if (!password)                       e.password       = "Crie uma senha";
    else if (password.length < 8)        e.password       = "Mínimo 8 caracteres";
    if (!confirm)                        e.confirm        = "Confirme sua senha";
    else if (confirm !== password)       e.confirm        = "As senhas não coincidem";
    if (!agreed)                         e.agreed         = "Aceite os termos para continuar";
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await auth.register(fullName, email, password, username, dataNascimento);
      setLoading(false);
      navigation.navigate("main");
    } catch (err) {
      setLoading(false);
      setErrors({ general: err.message || "Erro ao registrar" });
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
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <View style={[styles.heroTop, { paddingTop: insets.top + 16 }]}>
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

          {/* ── SUA LOGO REAL (importada) ── */}
          <FadeSlide delay={60}>
            <View style={styles.logoWrapper}>
              <LogoFind size="md" />
            </View>
          </FadeSlide>

          {/* Headline */}
          <FadeSlide delay={130} style={{ alignItems: "center", gap: 8 }}>
            <Text style={styles.heroTitle}>Crie sua conta</Text>
            <Text style={styles.heroSub}>Junte-se à comunidade e tenha acesso completo à plataforma.</Text>
          </FadeSlide>

          {/* Benefícios */}
          <FadeSlide delay={200}>
            <View style={styles.benefitsRow}>
              {[
                { icon: "gift-outline",             text: "100% Gratuito"       },
                { icon: "notifications-outline",    text: "Alertas rápidos"     },
                { icon: "shield-checkmark-outline", text: "Totalmente seguro"   },
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

          <View style={styles.wave} />
        </View>

        {/* ── CARD BRANCO ───────────────────────────────────────────── */}
        <View style={styles.cardArea}>
          <FadeSlide delay={260} style={styles.cardWrap}>
            <View style={styles.card}>

              {errors.general && (
                <View style={styles.generalError}>
                  <Ionicons name="alert-circle" size={14} color={colors.error} />
                  <Text style={[styles.errorText, { flex: 1 }]}>{errors.general}</Text>
                </View>
              )}

              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Dados da conta</Text>
                <Text style={styles.cardSubtitle}>Preencha para começar</Text>
              </View>

              <FadeSlide delay={320}>
                <InputField
                  label="Nome completo"
                  icon="person-outline"
                  value={fullName}
                  onChangeText={(v) => { setFullName(v); setErrors((p) => ({ ...p, fullName: undefined })); }}
                  autoCapitalize="words"
                  error={errors.fullName}
                />
              </FadeSlide>

              <FadeSlide delay={350}>
                <InputField
                  label="Nome de usuário"
                  icon="at-outline"
                  value={username}
                  onChangeText={(v) => { setUsername(v.replace(/\s/g, "")); setErrors((p) => ({ ...p, username: undefined })); }}
                  autoCapitalize="none"
                  error={errors.username}
                  hint="Ex: joao_123  —  sem espaços"
                />
              </FadeSlide>

              <FadeSlide delay={380}>
                <DateField
                  label="Data de nascimento"
                  value={dataNascimento}
                  onChange={(v) => { setDataNascimento(v); setErrors((p) => ({ ...p, dataNascimento: undefined })); }}
                  error={errors.dataNascimento}
                />
              </FadeSlide>

              <FadeSlide delay={410}>
                <InputField
                  label="E-mail"
                  icon="mail-outline"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); }}
                  keyboardType="email-address"
                  error={errors.email}
                  hint="Você receberá alertas neste e-mail"
                />
              </FadeSlide>

              <FadeSlide delay={440}>
                <InputField
                  label="Senha"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }}
                  secureEntry
                  error={errors.password}
                  hint="Mínimo 8 caracteres"
                />
                <PasswordStrength password={password} />
              </FadeSlide>

              <FadeSlide delay={470}>
                <InputField
                  label="Confirmar senha"
                  icon="lock-open-outline"
                  value={confirm}
                  onChangeText={(v) => { setConfirm(v); setErrors((p) => ({ ...p, confirm: undefined })); }}
                  secureEntry
                  error={errors.confirm}
                  hint={confirm && confirm === password ? "✓ Senhas coincidem" : undefined}
                />
              </FadeSlide>

              <FadeSlide delay={500}>
                <TouchableOpacity
                  style={[styles.termsRow, errors.agreed && styles.termsRowError]}
                  onPress={() => { setAgreed(!agreed); setErrors((p) => ({ ...p, agreed: undefined })); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                    {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={styles.termsText}>
                    Concordo com os{" "}
                    <Text style={styles.termsLink}>Termos de Uso</Text>
                    {" "}e a{" "}
                    <Text style={styles.termsLink}>Política de Privacidade</Text>
                  </Text>
                </TouchableOpacity>
                {errors.agreed && (
                  <View style={[styles.feedbackRow, { marginTop: 4, marginBottom: 8 }]}>
                    <Ionicons name="alert-circle-outline" size={12} color={colors.error} />
                    <Text style={styles.errorText}>{errors.agreed}</Text>
                  </View>
                )}
              </FadeSlide>

              <FadeSlide delay={540}>
                <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleRegister}>
                  <Animated.View style={[
                    styles.btnRegister,
                    { transform: [{ scale: btnScale }] },
                    loading && { opacity: 0.85 },
                  ]}>
                    {loading ? <LoadingDots /> : (
                      <>
                        <Ionicons name="person-add-outline" size={17} color="#fff" />
                        <Text style={styles.btnRegisterText}>Criar minha conta</Text>
                        <View style={styles.btnArrow}>
                          <Ionicons name="arrow-forward" size={13} color="#fff" />
                        </View>
                      </>
                    )}
                  </Animated.View>
                </Pressable>
              </FadeSlide>

              <FadeSlide delay={580}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou cadastre-se com</Text>
                  <View style={styles.dividerLine} />
                </View>
              </FadeSlide>

              <FadeSlide delay={610}>
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

          <FadeSlide delay={640}>
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('login')} activeOpacity={0.7}>
                <Text style={styles.loginLink}>Entrar agora</Text>
              </TouchableOpacity>
            </View>
          </FadeSlide>

          <FadeSlide delay={680}>
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

// ─── Styles ───────────────────────────────────────────────────────────────
const HERO_HEIGHT = screenHeight * 0.42;

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1 },

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
  benefitItem: { flex: 1, alignItems: "center", paddingVertical: 13, gap: 6 },
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
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.hero,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.heroBorder,
    marginTop: 10,
    marginBottom: 14,
  },
  wave: {
    position: "absolute", bottom: -1, left: -20, right: -20,
    height: 44, backgroundColor: colors.surface,
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
  },

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
  cardHeader:    { marginBottom: 20 },
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

  inputWrapper:  { marginBottom: 13 },
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
  dateSep:   { fontSize: 16, color: colors.textMuted, marginHorizontal: 3 },

  feedbackRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  errorText:   { fontSize: 11.5, color: colors.error,     fontWeight: "500" },
  hintText:    { fontSize: 11.5, color: colors.textMuted, fontWeight: "400" },

  strengthWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: -4, marginBottom: 10, paddingHorizontal: 2,
  },
  strengthBars:  { flexDirection: "row", gap: 4, flex: 1 },
  strengthBar:   { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: "600", minWidth: 52, textAlign: "right" },

  termsRow: {
    flexDirection: "row", alignItems: "flex-start",
    gap: 10, marginBottom: 18, marginTop: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 11, borderWidth: 1, borderColor: colors.border, padding: 13,
  },
  termsRowError: { backgroundColor: colors.errorBg, borderColor: colors.errorBorder },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center",
    marginTop: 1, flexShrink: 0,
  },
  checkboxActive: { backgroundColor: colors.button, borderColor: colors.button },
  termsText: { fontSize: 13, color: colors.textMuted, lineHeight: 20, flex: 1 },
  termsLink: { color: colors.button, fontWeight: "700" },

  btnRegister: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10,
    paddingVertical: 16, borderRadius: 13,
    backgroundColor: colors.button, marginBottom: 22,
    shadowColor: colors.buttonDarker,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28, shadowRadius: 14, elevation: 6,
  },
  btnRegisterText: {
    fontSize: 16, fontWeight: "800", color: "#fff", letterSpacing: 0.2,
  },
  btnArrow: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: colors.borderAccent },
  dividerText: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },

  socialRow: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 13, borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1, borderColor: colors.border,
  },
  socialText: { fontSize: 13.5, fontWeight: "600", color: colors.text },

  loginRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", marginTop: 20, marginBottom: 14,
  },
  loginPrompt: { fontSize: 14, color: colors.textMuted },
  loginLink:   { fontSize: 14, color: colors.button, fontWeight: "700" },

  pillRow: {
    flexDirection: "row", gap: 8,
    flexWrap: "wrap", justifyContent: "center", marginBottom: 8,
  },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 20, backgroundColor: colors.surfaceDeep,
    borderWidth: 1, borderColor: colors.borderAccent,
  },
  pillText: { fontSize: 11.5, color: colors.textLight, fontWeight: "600" },
});