import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { fetchStats } from "../../services/api";

const { width: screenWidth } = Dimensions.get("window");
const isMobile = screenWidth < 768;

const colors = {
  button:       '#1eaed4',
  buttonDeep:   '#1596b8',
  surface:      '#FFFFFF',
  surfaceAlt:   '#f4fafd',
  text:         '#06101f',
  textMuted:    '#6B7898',
  accent:       '#ddf3fc',
  accentStrong: '#b8e9fa',
  border:       'rgba(0, 30, 100, 0.07)',
  borderAccent: 'rgba(30, 174, 212, 0.20)',
  borderStrong: 'rgba(30, 174, 212, 0.35)',
};

const PILLS = [
  { icon: 'gift-outline',             label: 'Gratuito'      },
  { icon: 'shield-checkmark-outline', label: 'Seguro'        },
  { icon: 'flash-outline',            label: 'Instantâneo'   },
];

export default function CTASection({ onEnterApp }) {
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  const [stats, setStats] = useState({ encontrados: 0 });

  useEffect(() => {
    fetchStats().then(res => {
      if (res && res.data) setStats(res.data);
    }).catch(() => {});
  }, []);

  return (
    <View style={styles.section}>

      {/* Orbs decorativos */}
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />

      {/* Badge */}
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Comece agora — é grátis</Text>
      </View>

      {/* Título */}
      <Text style={styles.title}>
        Pronto para recuperar{'\n'}
        <Text style={styles.titleAccent}>o que é seu?</Text>
      </Text>

      {/* Subtítulo */}
      <Text style={styles.sub}>
        Já temos {stats.encontrados} itens achados.{'\n'}O seu pode ser o próximo.
      </Text>

      {/* Pills */}
      <View style={styles.pillRow}>
        {PILLS.map(({ icon, label }) => (
          <View key={label} style={styles.pill}>
            <Ionicons name={icon} size={12} color={colors.buttonDeep} />
            <Text style={styles.pillText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Botão CTA */}
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onEnterApp}>
        <Animated.View style={[styles.btn, { transform: [{ scale: btnScale }] }]}>
          <Ionicons name="rocket-outline" size={18} color={colors.button} />
          <Text style={styles.btnText}>Cadastrar gratuitamente</Text>
          <View style={styles.btnArrow}>
            <Ionicons name="arrow-forward" size={13} color={colors.button} />
          </View>
        </Animated.View>
      </Pressable>

      {/* Trust line */}
      <View style={styles.trustRow}>
        <Ionicons name="lock-closed-outline" size={12} color={colors.textMuted} />
        <Text style={styles.trustText}>Sem cartão de crédito · Cancele quando quiser</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor:   colors.accent,
    borderTopWidth:    1,
    borderTopColor:    colors.borderStrong,
    paddingVertical:   isMobile ? 52 : 80,
    paddingHorizontal: isMobile ? 20 : 32,
    alignItems:        'center',
    overflow:          'hidden',
  },

  orb1: {
    position:        'absolute',
    top:             -60,
    right:           -60,
    width:           220,
    height:          220,
    borderRadius:    110,
    backgroundColor: colors.accentStrong,
    opacity:         0.5,
  },
  orb2: {
    position:        'absolute',
    bottom:          -50,
    left:            -50,
    width:           180,
    height:          180,
    borderRadius:    90,
    backgroundColor: colors.accentStrong,
    opacity:         0.35,
  },

  badge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               7,
    paddingVertical:   6,
    paddingHorizontal: 14,
    borderRadius:      24,
    backgroundColor:   colors.surface,
    borderWidth:       1,
    borderColor:       colors.borderStrong,
    marginBottom:      isMobile ? 20 : 28,
  },
  badgeDot: {
    width:           7,
    height:          7,
    borderRadius:    4,
    backgroundColor: '#00c264',
  },
  badgeText: {
    fontSize:   isMobile ? 11 : 12,
    fontWeight: '700',
    color:      colors.buttonDeep,
  },

  title: {
    fontSize:      isMobile ? 28 : 42,
    fontWeight:    '900',
    color:         colors.text,
    textAlign:     'center',
    lineHeight:    isMobile ? 36 : 54,
    letterSpacing: isMobile ? -0.5 : -1,
    marginBottom:  isMobile ? 12 : 16,
  },
  titleAccent: { color: colors.button },

  sub: {
    fontSize:     isMobile ? 14 : 16,
    color:        colors.buttonDeep,
    textAlign:    'center',
    lineHeight:   isMobile ? 22 : 26,
    fontWeight:   '500',
    marginBottom: isMobile ? 20 : 28,
  },

  pillRow: {
    flexDirection:  'row',
    gap:            8,
    flexWrap:       'wrap',
    justifyContent: 'center',
    marginBottom:   isMobile ? 28 : 36,
  },
  pill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    paddingVertical:   6,
    paddingHorizontal: 13,
    borderRadius:      20,
    backgroundColor:   colors.surface,
    borderWidth:       1,
    borderColor:       colors.borderStrong,
  },
  pillText: {
    fontSize:   isMobile ? 11.5 : 12.5,
    fontWeight: '600',
    color:      colors.buttonDeep,
  },

  btn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    paddingVertical:   isMobile ? 16 : 19,
    paddingHorizontal: isMobile ? 28 : 40,
    borderRadius:      16,
    backgroundColor:   colors.surface,
    borderWidth:       1.5,
    borderColor:       colors.borderStrong,
    marginBottom:      isMobile ? 16 : 20,
    shadowColor:       colors.button,
    shadowOffset:      { width: 0, height: 8 },
    shadowOpacity:     0.15,
    shadowRadius:      20,
    elevation:         6,
  },
  btnText: {
    fontSize:      isMobile ? 15 : 17,
    fontWeight:    '800',
    color:         colors.button,
    letterSpacing: 0.2,
  },
  btnArrow: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: colors.accent,
    borderWidth:     1,
    borderColor:     colors.borderStrong,
    alignItems:      'center',
    justifyContent:  'center',
  },

  trustRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  trustText: {
    fontSize:   isMobile ? 11 : 12,
    color:      colors.textMuted,
    fontWeight: '500',
  },
});