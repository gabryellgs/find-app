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
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isMobile = screenWidth < 768;

const colors = {
  button:        '#1eaed4',
  buttonDeep:    '#1596b8',
  buttonDarker:  '#0f7a99',
  surface:       '#FFFFFF',
  surfaceAlt:    '#f4fafd',
  surfaceDeep:   '#eaf6fb',
  text:          '#06101f',
  textMuted:     '#6B7898',
  textLight:     '#1eaed4',
  accent:        '#ddf3fc',
  accentStrong:  '#b8e9fa',
  heroBorder:    'rgba(255,255,255,0.18)',
  border:        'rgba(0, 30, 100, 0.07)',
  borderAccent:  'rgba(30, 174, 212, 0.22)',
  borderStrong:  'rgba(30, 174, 212, 0.40)',
  error:         '#e8514a',
  errorBg:       '#fff5f5',
  errorBorder:   'rgba(232, 81, 74, 0.25)',
  success:       '#10b981',
  successBg:     '#f0fdf8',
  successBorder: 'rgba(16, 185, 129, 0.25)',
};

// ─── Staggered fade+slide ────────────────────────────────────────────────────
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

// ─── Input field ─────────────────────────────────────────────────────────────
function InputField({ label, icon, value, onChangeText, secureEntry, keyboardType, autoCapitalize, error, hint }) {
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
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={false}
          placeholderTextColor={colors.textMuted}
          placeholder={label}
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

// ─── Password strength bar ────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6)  score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const levels = [
    { label: 'Muito fraca', color: '#e8514a' },
    { label: 'Fraca',       color: '#f59e0b' },
    { label: 'Média',       color: '#f59e0b' },
    { label: 'Boa',         color: '#10b981' },
    { label: 'Forte',       color: '#10b981' },
  ];

  if (!password) return null;

  const current = levels[Math.min(strength - 1, 4)] || levels[0];

  return (
    <View style={styles.strengthWrap}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4, 5].map((i) => (
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

// ─── Loading dots ────────────────────────────────────────────────────────────
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
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 7, height: 7, borderRadius: 4,
            backgroundColor: '#fff',
            opacity: dot,
            transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          }}
        />
      ))}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function Register({ onRegister, onGoToLogin, onBack }) {
  const insets = useSafeAreaInsets();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [agreed,   setAgreed]   = useState(false);

  const btnScale   = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  const validate = () => {
    const e = {};
    if (!name.trim())               e.name     = 'Informe seu nome';
    else if (name.trim().length < 2) e.name    = 'Nome muito curto';
    if (!email.trim())               e.email   = 'Informe seu e-mail';
    else if (!email.includes('@'))   e.email   = 'E-mail inválido';
    if (!password)                   e.password = 'Crie uma senha';
    else if (password.length < 6)    e.password = 'Mínimo 6 caracteres';
    if (!confirm)                    e.confirm  = 'Confirme sua senha';
    else if (confirm !== password)   e.confirm  = 'As senhas não coincidem';
    if (!agreed)                     e.agreed   = 'Aceite os termos para continuar';
    return e;
  };

  const handleRegister = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); onRegister?.(); }, 1400);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ── TOPO AZUL ─────────────────────────────────────────────────── */}
        <View style={[styles.heroTop, { paddingTop: insets.top + 16 }]}>
          <View style={styles.heroOrb1} pointerEvents="none" />
          <View style={styles.heroOrb2} pointerEvents="none" />

          {/* Botão voltar */}
          {onBack && (
            <FadeSlide delay={0}>
              <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.75}>
                <Ionicons name="arrow-back" size={18} color="#fff" />
              </TouchableOpacity>
            </FadeSlide>
          )}

          {/* Logo */}
          <FadeSlide delay={60}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Ionicons name="search" size={20} color={colors.button} />
              </View>
              <Text style={styles.appName}>Find</Text>
            </View>
          </FadeSlide>

          {/* Headline */}
          <FadeSlide delay={130}>
            <Text style={styles.heroTitle}>Crie sua conta grátis ✨</Text>
            <Text style={styles.heroSub}>
              Junte-se a mais de 12.000 pessoas que já recuperaram seus itens perdidos.
            </Text>
          </FadeSlide>

          {/* Benefícios rápidos */}
          <FadeSlide delay={200}>
            <View style={styles.benefitsRow}>
              {[
                { icon: 'flash-outline',             text: 'Cadastro em 1 min'    },
                { icon: 'notifications-outline',     text: 'Alertas automáticos'  },
                { icon: 'shield-checkmark-outline',  text: '100% gratuito'        },
              ].map(({ icon, text }, i) => (
                <View key={text} style={[styles.benefitItem, i < 2 && styles.benefitBorder]}>
                  <View style={styles.benefitIconWrap}>
                    <Ionicons name={icon} size={13} color="rgba(255,255,255,0.90)" />
                  </View>
                  <Text style={styles.benefitText}>{text}</Text>
                </View>
              ))}
            </View>
          </FadeSlide>

          <View style={styles.wave} />
        </View>

        {/* ── CARD BRANCO ───────────────────────────────────────────────── */}
        <View style={styles.cardArea}>
          <FadeSlide delay={260} style={styles.cardWrap}>
            <View style={styles.card}>

              {/* Step indicator */}
              <FadeSlide delay={300}>
                <View style={styles.stepRow}>
                  <View style={styles.stepActive}>
                    <Text style={styles.stepActiveText}>1</Text>
                  </View>
                  <View style={styles.stepLine} />
                  <View style={styles.stepInactive}>
                    <Text style={styles.stepInactiveText}>2</Text>
                  </View>
                  <View style={styles.stepLine} />
                  <View style={styles.stepInactive}>
                    <Text style={styles.stepInactiveText}>3</Text>
                  </View>
                </View>
                <Text style={styles.stepHint}>Informações básicas</Text>
              </FadeSlide>

              {/* Name */}
              <FadeSlide delay={340}>
                <InputField
                  label="Nome completo"
                  icon="person-outline"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  error={errors.name}
                />
              </FadeSlide>

              {/* Email */}
              <FadeSlide delay={380}>
                <InputField
                  label="E-mail"
                  icon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  error={errors.email}
                  hint="Você receberá alertas neste e-mail"
                />
              </FadeSlide>

              {/* Password */}
              <FadeSlide delay={420}>
                <InputField
                  label="Senha"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  secureEntry
                  error={errors.password}
                />
                <PasswordStrength password={password} />
              </FadeSlide>

              {/* Confirm */}
              <FadeSlide delay={460}>
                <InputField
                  label="Confirmar senha"
                  icon="lock-open-outline"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureEntry
                  error={errors.confirm}
                />
              </FadeSlide>

              {/* Terms checkbox */}
              <FadeSlide delay={500}>
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setAgreed(!agreed)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                    {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={styles.termsText}>
                    Concordo com os{' '}
                    <Text style={styles.termsLink}>Termos de Uso</Text>
                    {' '}e a{' '}
                    <Text style={styles.termsLink}>Política de Privacidade</Text>
                  </Text>
                </TouchableOpacity>
                {errors.agreed && (
                  <View style={[styles.feedbackRow, { marginTop: 6 }]}>
                    <Ionicons name="alert-circle-outline" size={12} color={colors.error} />
                    <Text style={styles.errorText}>{errors.agreed}</Text>
                  </View>
                )}
              </FadeSlide>

              {/* CTA */}
              <FadeSlide delay={550}>
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

              {/* Divider */}
              <FadeSlide delay={600}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou cadastre-se com</Text>
                  <View style={styles.dividerLine} />
                </View>
              </FadeSlide>

              {/* Social */}
              <FadeSlide delay={640}>
                <View style={styles.socialRow}>
                  <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
                    <Ionicons name="logo-google" size={18} color="#DB4437" />
                    <Text style={styles.socialText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
                    <Ionicons name="logo-apple" size={18} color={colors.text} />
                    <Text style={styles.socialText}>Apple</Text>
                  </TouchableOpacity>
                </View>
              </FadeSlide>

            </View>
          </FadeSlide>

          {/* Login link */}
          <FadeSlide delay={680}>
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={onGoToLogin} activeOpacity={0.7}>
                <Text style={styles.loginLink}>Entrar agora</Text>
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {/* Trust pills */}
          <FadeSlide delay={720}>
            <View style={styles.pillRow}>
              {[
                { label: 'Seguro',   icon: 'shield-checkmark-outline' },
                { label: 'Gratuito', icon: 'gift-outline'             },
                { label: 'Rápido',   icon: 'flash-outline'            },
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

const HERO_HEIGHT = screenHeight * 0.38;

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flexGrow: 1,
  },

  // ── Hero azul ──
  heroTop: {
    backgroundColor:   '#1eaed4',
    minHeight:         HERO_HEIGHT,
    paddingHorizontal: isMobile ? 20 : 32,
    paddingBottom:     52,
    overflow:          'hidden',
    position:          'relative',
  },
  heroOrb1: {
    position:        'absolute',
    top: -60, right: -70,
    width: 220, height: 220,
    borderRadius:    110,
    backgroundColor: '#0f7a99',
    opacity:         0.45,
  },
  heroOrb2: {
    position:        'absolute',
    bottom: 20, left: -50,
    width: 160, height: 160,
    borderRadius:    80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  backBtn: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth:     1,
    borderColor:     colors.heroBorder,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    16,
    alignSelf:       'flex-start',
  },

  logoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginBottom:  20,
    alignSelf:     'center',
  },
  logoMark: {
    width:           40,
    height:          40,
    borderRadius:    12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.10,
    shadowRadius:    6,
    elevation:       3,
  },
  appName: {
    fontSize:      28,
    fontWeight:    '900',
    color:         '#fff',
    letterSpacing: -0.5,
  },

  heroTitle: {
    fontSize:      isMobile ? 22 : 28,
    fontWeight:    '900',
    color:         '#fff',
    textAlign:     'center',
    letterSpacing: -0.3,
    marginBottom:  8,
  },
  heroSub: {
    fontSize:     isMobile ? 13.5 : 15,
    color:        'rgba(255,255,255,0.78)',
    textAlign:    'center',
    lineHeight:   20,
    marginBottom: 22,
    maxWidth:     320,
    alignSelf:    'center',
  },

  // Benefícios strip
  benefitsRow: {
    flexDirection:   'row',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     colors.heroBorder,
    overflow:        'hidden',
    alignSelf:       'center',
    width:           '100%',
    maxWidth:        380,
  },
  benefitItem: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: 12,
    gap:             6,
  },
  benefitBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.heroBorder,
  },
  benefitIconWrap: {
    width:           28,
    height:          28,
    borderRadius:    8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  benefitText: {
    fontSize:   isMobile ? 9.5 : 11,
    color:      'rgba(255,255,255,0.85)',
    fontWeight: '600',
    textAlign:  'center',
  },

  wave: {
    position:             'absolute',
    bottom:               -1,
    left:                 -20,
    right:                -20,
    height:               40,
    backgroundColor:      colors.surface,
    borderTopLeftRadius:  32,
    borderTopRightRadius: 32,
  },

  // ── Card area ──
  cardArea: {
    flex:              1,
    backgroundColor:   colors.surface,
    paddingHorizontal: isMobile ? 20 : 32,
    paddingTop:        8,
    alignItems:        'center',
  },
  cardWrap: {
    width:    '100%',
    maxWidth: 440,
  },
  card: {
    backgroundColor:   colors.surface,
    borderRadius:      24,
    borderWidth:       1,
    borderColor:       colors.borderAccent,
    paddingHorizontal: isMobile ? 20 : 32,
    paddingVertical:   isMobile ? 24 : 32,
    shadowColor:       colors.button,
    shadowOffset:      { width: 0, height: 8 },
    shadowOpacity:     0.09,
    shadowRadius:      24,
    elevation:         6,
  },

  // Step indicator
  stepRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   6,
  },
  stepActive: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: colors.button,
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepActiveText: {
    fontSize:   12,
    fontWeight: '800',
    color:      '#fff',
  },
  stepInactive: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: colors.surfaceAlt,
    borderWidth:     1,
    borderColor:     colors.borderAccent,
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepInactiveText: {
    fontSize:   12,
    fontWeight: '600',
    color:      colors.textMuted,
  },
  stepLine: {
    flex:            1,
    height:          1.5,
    backgroundColor: colors.borderAccent,
    marginHorizontal: 6,
    maxWidth:        40,
  },
  stepHint: {
    fontSize:     11,
    color:        colors.textMuted,
    textAlign:    'center',
    marginBottom: 20,
    fontWeight:   '500',
  },

  // Input
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize:      12,
    fontWeight:    '600',
    color:         colors.textMuted,
    marginBottom:  6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputBox: {
    flexDirection:     'row',
    alignItems:        'center',
    borderWidth:       1.5,
    borderRadius:      12,
    paddingHorizontal: 12,
    height:            48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex:            1,
    fontSize:        15,
    color:           colors.text,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginTop:     5,
  },
  errorText: {
    fontSize:   11.5,
    color:      colors.error,
    fontWeight: '500',
  },
  hintText: {
    fontSize:   11.5,
    color:      colors.textMuted,
    fontWeight: '400',
  },

  // Password strength
  strengthWrap: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    marginTop:      -6,
    marginBottom:   8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap:           4,
    flex:          1,
  },
  strengthBar: {
    flex:         1,
    height:       3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize:   11,
    fontWeight: '600',
    minWidth:   60,
    textAlign:  'right',
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           10,
    marginBottom:  20,
    marginTop:     4,
  },
  checkbox: {
    width:           20,
    height:          20,
    borderRadius:    6,
    borderWidth:     1.5,
    borderColor:     colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       1,
    flexShrink:      0,
  },
  checkboxActive: {
    backgroundColor: colors.button,
    borderColor:     colors.button,
  },
  termsText: {
    fontSize:   13,
    color:      colors.textMuted,
    lineHeight: 20,
    flex:       1,
  },
  termsLink: {
    color:      colors.button,
    fontWeight: '600',
  },

  // CTA
  btnRegister: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               10,
    paddingVertical:   16,
    borderRadius:      14,
    backgroundColor:   colors.button,
    marginBottom:      20,
    shadowColor:       colors.button,
    shadowOffset:      { width: 0, height: 6 },
    shadowOpacity:     0.30,
    shadowRadius:      16,
    elevation:         6,
  },
  btnRegisterText: {
    fontSize:      16,
    fontWeight:    '800',
    color:         '#fff',
    letterSpacing: 0.3,
  },
  btnArrow: {
    width:           26,
    height:          26,
    borderRadius:    13,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    marginBottom:  16,
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize:   12,
    color:      colors.textMuted,
    fontWeight: '500',
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    gap:           10,
  },
  socialBtn: {
    flex:              1,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               8,
    paddingVertical:   12,
    borderRadius:      12,
    backgroundColor:   colors.surfaceAlt,
    borderWidth:       1,
    borderColor:       colors.border,
  },
  socialText: {
    fontSize:   13.5,
    fontWeight: '600',
    color:      colors.text,
  },

  // Login link
  loginRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      20,
    marginBottom:   16,
  },
  loginPrompt: {
    fontSize: 14,
    color:    colors.textMuted,
  },
  loginLink: {
    fontSize:   14,
    color:      colors.button,
    fontWeight: '700',
  },

  // Pills
  pillRow: {
    flexDirection:  'row',
    gap:            8,
    flexWrap:       'wrap',
    justifyContent: 'center',
    marginBottom:   8,
  },
  pill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    paddingVertical:   5,
    paddingHorizontal: 12,
    borderRadius:      20,
    backgroundColor:   colors.surfaceDeep,
    borderWidth:       1,
    borderColor:       colors.borderAccent,
  },
  pillText: {
    fontSize:   11.5,
    color:      colors.textLight,
    fontWeight: '600',
  },
});