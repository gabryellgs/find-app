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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import LogoFind from "../components/layout/LogoFind";
import auth from '../services/auth';

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
  // Hero top area (azul)
  heroTop:       '#1eaed4',
  heroTopDeep:   '#1596b8',
  heroTopDark:   '#0e7fa0',
  heroBorder:    'rgba(255,255,255,0.18)',
  heroText:      'rgba(255,255,255,0.80)',
  // inputs / card
  border:        'rgba(0, 30, 100, 0.07)',
  borderAccent:  'rgba(30, 174, 212, 0.22)',
  borderStrong:  'rgba(30, 174, 212, 0.40)',
  error:         '#e8514a',
  errorBg:       '#fff5f5',
  errorBorder:   'rgba(232, 81, 74, 0.25)',
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

// ─── Floating label input ────────────────────────────────────────────────────
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
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={false}
          placeholderTextColor={colors.textMuted}
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
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={12} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
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
export default function Login({ onLogin, onGoToRegister, onBack }) {
  const insets = useSafeAreaInsets();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const btnScale   = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  const validate = () => {
    const e = {};
    if (!email.trim())             e.email    = 'Informe seu e-mail ou usuário';
    if (!password)                 e.password = 'Informe sua senha';
    else if (password.length < 6)  e.password = 'Mínimo 6 caracteres';
    return e;
  };

  const navigation = useNavigation();

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await auth.login(email, password);
      setLoading(false);
      navigation.navigate('main');
    } catch (err) {
      setLoading(false);
      setErrors({ general: err.message || 'Erro ao autenticar' });
    }
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

        {/* ── TOPO AZUL ───────────────────────────────────────────────────── */}
        <View style={[styles.heroTop, { paddingTop: insets.top + 16 }]}>

          {/* Orbs decorativos dentro do azul */}
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
            <View style={styles.logoContainer}>
              <LogoFind />  
            </View>
            
          </FadeSlide>

          {/* Headline */}
          <FadeSlide delay={130}>
            <Text style={styles.heroTitle}>Bem-vindo de volta 👋</Text>
            <Text style={styles.heroSub}>Entre na sua conta para continuar encontrando seus itens.</Text>
          </FadeSlide>

          {/* Stats strip */}
          <FadeSlide delay={200}>
            <View style={styles.heroStats}>
              {[
                { icon: 'bag-check-outline', value: '40k+',  label: 'Recuperados' },
                { icon: 'people-outline',    value: '12k+',  label: 'Usuários'    },
                { icon: 'location-outline',  value: '210',   label: 'Cidades'     },
              ].map(({ icon, value, label }, i) => (
                <View key={label} style={[styles.heroStatItem, i < 2 && styles.heroStatBorder]}>
                  <Ionicons name={icon} size={13} color="rgba(255,255,255,0.75)" />
                  <Text style={styles.heroStatValue}>{value}</Text>
                  <Text style={styles.heroStatLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </FadeSlide>

          {/* Wave divider */}
          <View style={styles.wave} />
        </View>

        {/* ── CARD BRANCO ─────────────────────────────────────────────────── */}
        <View style={styles.cardArea}>
          <FadeSlide delay={260} style={styles.cardWrap}>
            <View style={styles.card}>

              {/* General error */}
              {errors.general && (
                <View style={[styles.feedbackRow, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 16 }]}>
                  <Ionicons name="alert-circle" size={14} color={colors.error} />
                  <Text style={[styles.errorText, { flex: 1 }]}>{errors.general}</Text>
                </View>
              )}

              {/* Inputs */}
              <FadeSlide delay={320}>
                <InputField
                  label="E-mail ou Usuário"
                  icon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="default"
                  error={errors.email}
                />
              </FadeSlide>

              <FadeSlide delay={370}>
                <InputField
                  label="Senha"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  secureEntry
                  error={errors.password}
                />
              </FadeSlide>

              {/* Forgot */}
              <FadeSlide delay={410}>
                <TouchableOpacity style={styles.forgotWrap} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              </FadeSlide>

              {/* CTA */}
              <FadeSlide delay={460}>
                <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleLogin}>
                  <Animated.View style={[
                    styles.btnLogin,
                    { transform: [{ scale: btnScale }] },
                    loading && styles.btnLoading,
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

          {/* Register link */}
          <FadeSlide delay={610}>
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('register')} activeOpacity={0.7}>
                <Text style={styles.registerLink}>Cadastre-se grátis</Text>
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {/* Trust pills */}
          <FadeSlide delay={660}>
            <View style={styles.pillRow}>
              {[
                { label: 'Seguro',    icon: 'shield-checkmark-outline' },
                { label: 'Gratuito',  icon: 'gift-outline'             },
                { label: 'Rápido',    icon: 'flash-outline'            },
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

const HERO_HEIGHT = screenHeight * 0.42;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flexGrow: 1,
  },

  // ── Hero azul ──
  heroTop: {
    backgroundColor: colors.heroTop,
    minHeight:       HERO_HEIGHT,
    paddingHorizontal: isMobile ? 20 : 32,
    paddingBottom:   52,           // espaço extra p/ o wave sobrepor
    overflow:        'hidden',
    position:        'relative',
  },
  heroOrb1: {
    position:        'absolute',
    top:             -60, right: -70,
    width:           220, height: 220,
    borderRadius:    110,
    backgroundColor: colors.buttonDarker,
    opacity:         0.45,
  },
  heroOrb2: {
    position:        'absolute',
    bottom:          20, left: -50,
    width:           160, height: 160,
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
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    marginBottom:   20,
    alignSelf:      'center',
  },

  logoContainer: {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
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
    marginBottom: 24,
    maxWidth:     320,
    alignSelf:    'center',
  },

  heroStats: {
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
  heroStatItem: {
    flex:           1,
    alignItems:     'center',
    paddingVertical: 12,
    gap:            3,
  },
  heroStatBorder: {
    borderRightWidth:  1,
    borderRightColor:  colors.heroBorder,
  },
  heroStatValue: {
    fontSize:      isMobile ? 17 : 20,
    fontWeight:    '900',
    color:         '#fff',
    letterSpacing: -0.3,
  },
  heroStatLabel: {
    fontSize:  10,
    color:     'rgba(255,255,255,0.70)',
    fontWeight: '500',
  },

  // Wave — aba arredondada branca sobre o azul
  wave: {
    position:        'absolute',
    bottom:          -1,
    left:            -20,
    right:           -20,
    height:          40,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
    borderRadius:    24,
    borderWidth:     1,
    borderColor:     colors.borderAccent,
    paddingHorizontal: isMobile ? 20 : 32,
    paddingVertical:   isMobile ? 24 : 32,
    shadowColor:     colors.button,
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.09,
    shadowRadius:    24,
    elevation:       6,
  },

  // Input
  inputWrapper: {
    marginBottom: 16,
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
  errorRow: {
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

  forgotWrap: {
    alignSelf:    'flex-end',
    marginBottom: 20,
    marginTop:    -4,
  },
  forgotText: {
    fontSize:   13,
    color:      colors.button,
    fontWeight: '600',
  },

  btnLogin: {
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
  btnLoading: { opacity: 0.85 },
  btnLoginText: {
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

  registerRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      20,
    marginBottom:   16,
  },
  registerPrompt: {
    fontSize: 14,
    color:    colors.textMuted,
  },
  registerLink: {
    fontSize:   14,
    color:      colors.button,
    fontWeight: '700',
  },

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