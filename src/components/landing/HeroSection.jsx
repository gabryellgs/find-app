import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;

const colors = {
  primary:      '#abe8ff',
  button:       '#1eaed4',
  buttonDeep:   '#1596b8',
  surface:      '#FFFFFF',
  surfaceAlt:   '#f4fafd',
  surfaceDeep:  '#eaf6fb',
  text:         '#06101f',
  textMuted:    '#6B7898',
  textLight:    '#1eaed4',
  accent:       '#ddf3fc',
  accentStrong: '#b8e9fa',
  border:       'rgba(0, 30, 100, 0.07)',
  borderAccent: 'rgba(30, 174, 212, 0.20)',
  borderStrong: 'rgba(30, 174, 212, 0.35)',
};

// Staggered fade+slide
function FadeSlide({ delay = 0, children, style }) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 550, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 550, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }, style]}>
      {children}
    </Animated.View>
  );
}

// Animated counter 0 → target
function Counter({ target, suffix = '', style }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = null;
    const duration = 1400;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), 700);
    return () => clearTimeout(timer);
  }, [target]);

  return <Text style={style}>{val.toLocaleString('pt-BR')}{suffix}</Text>;
}

// Stats config
const STATS = [
  { label: 'Itens recuperados', target: 40000, suffix: '+', icon: 'bag-check-outline' },
  { label: 'Usuários ativos',   target: 12800, suffix: '+', icon: 'people-outline'    },
  { label: 'Cidades',           target: 210,   suffix: '',  icon: 'location-outline'  },
];

// Pills config
const PILLS = [
  { label: 'Gratuito', icon: 'gift-outline'},
  { label: 'Alertas', icon: 'notifications-outline'},
  { label: 'Seguro', icon: 'shield-checkmark-outline'},
];

export default function HeroSection({ onRegister }) {
  const btnScale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <View style={styles.hero}>

      {/* Background orbs */}
      <View style={[styles.orb, styles.orbTopRight]}   pointerEvents="none" />
      <View style={[styles.orb, styles.orbBottomLeft]} pointerEvents="none" />

      {/* Grid lines */}
      <View style={styles.gridLine1} pointerEvents="none" />
      <View style={styles.gridLine2} pointerEvents="none" />

      <View style={styles.heroContent}>

        {/* ── Badge ── */}
        <FadeSlide delay={0}>
          <View style={styles.heroBadge}>
            <Ionicons name="search-outline" size={12} color={colors.button} />
            <Text style={styles.heroBadgeText}>Achados e perdidos</Text>
          </View>
        </FadeSlide>

        {/* ── Title ── */}
        <FadeSlide delay={100}>
          <Text style={styles.heroTitle}>
            Perdeu algo?{'\n'}
            <Text style={styles.heroTitleAccent}>Encontre agora.</Text>
          </Text>
        </FadeSlide>

        {/* ── Subtitle ── */}
        <FadeSlide delay={180}>
          <Text style={styles.heroSub}>
            O Find conecta quem perdeu a quem achou.{'\n'}
            Cadastre itens, receba alertas e recupere o que é seu.
          </Text>
        </FadeSlide>

        {/* ── Stats row ── */}
        <FadeSlide delay={260} style={styles.statsRowWrap}>
          <View style={styles.statsRow}>
            {STATS.map(({ label, target, suffix, icon }, i) => (
              <View key={label} style={[styles.statItem, i < 2 && styles.statItemBorder]}>
                <View style={styles.statIconWrap}>
                  <Ionicons name={icon} size={isMobile ? 14 : 16} color={colors.button} />
                </View>
                <Counter target={target} suffix={suffix} style={styles.statNumber} />
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </FadeSlide>

        {/* ── CTA button ── */}
        <FadeSlide delay={340}>
          <Pressable onPressIn={onRegister} onPressOut={onRegister} onPress={onRegister}>
            <Animated.View style={[styles.btnHero, { transform: [{ scale: btnScale }] }]}>
              <Ionicons name="rocket-outline" size={isMobile ?27 : 19} color="#fff" />
              <Text style={styles.btnHeroText}>Começar agora</Text>
              <View style={styles.btnArrow}>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </View>
            </Animated.View>
          </Pressable>
        </FadeSlide>

        {/* ── Trust row ── */}
        <FadeSlide delay={420}>
          <View style={styles.heroTrust}>
            <View style={styles.heroAvatars}>
              {[
                { initials: 'MR', bg: '#abe8ff', textColor: '#0a6680' },
                { initials: 'JF', bg: '#C7B8F5', textColor: '#4a2fa0' },
                { initials: 'AL', bg: '#9EE5C4', textColor: '#0a6641' },
              ].map((a, i) => (
                <View
                  key={i}
                  style={[styles.avatar, { backgroundColor: a.bg, marginLeft: i === 0 ? 0 : -10 }]}
                >
                  <Text style={[styles.avatarText, { color: a.textColor }]}>{a.initials}</Text>
                </View>
              ))}
            </View>
            <View style={styles.trustTextWrap}>
              <View style={styles.trustTitleRow}>
                <Ionicons name="heart-outline" size={13} color={colors.button} />
                <Text style={styles.heroTrustTextBold}>Pessoas reais. Itens reais.</Text>
              </View>
              <Text style={styles.heroTrustSub}>Comunidade ativa no Brasil inteiro</Text>
            </View>
          </View>
        </FadeSlide>

        {/* ── Feature pills ── */}
        <FadeSlide delay={500}>
          <View style={styles.pillRow}>
            {PILLS.map(({ label, icon }) => (
              <View key={label} style={styles.pill}>
                <Ionicons name={icon} size={12} color={colors.button} />
                <Text style={styles.pillText}>{label}</Text>
              </View>
            ))}
          </View>
        </FadeSlide>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop:        isMobile ? 72 : 96,
    paddingBottom:     isMobile ? 56 : 72,
    paddingHorizontal: isMobile ? 20 : 32,
    alignItems:        'center',
    backgroundColor:   colors.surface,
    overflow:          'hidden',
  },

 

  heroContent: {
    alignItems: 'center',
    maxWidth:   isMobile ? '100%' : 540,
    width:      '100%',
  },

  // Badge
  heroBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingVertical:   7,
    paddingHorizontal: 14,
    borderRadius:      24,
    backgroundColor:   colors.accent,
    borderWidth:       1,
    borderColor:       colors.borderStrong,
    marginBottom:      isMobile ? 28 : 36,
  },
  heroBadgeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.button,
  },
  heroBadgeText: {
    fontSize:      isMobile ? 11 : 12,
    fontWeight:    '700',
    color:         colors.button,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Title
  heroTitle: {
    fontSize:      isMobile ? 32 : 48,
    fontWeight:    '900',
    textAlign:     'center',
    marginBottom:  isMobile ? 14 : 20,
    color:         colors.text,
    lineHeight:    isMobile ? 40 : 60,
    letterSpacing: isMobile ? -0.5 : -1,
  },
  heroTitleAccent: { color: colors.button },

  // Subtitle
  heroSub: {
    fontSize:     isMobile ? 14.5 : 16.5,
    color:        colors.textMuted,
    textAlign:    'center',
    marginBottom: isMobile ? 28 : 36,
    lineHeight:   isMobile ? 22 : 26,
    maxWidth:     360,
  },

  // Stats
  statsRowWrap: { width: '100%', marginBottom: isMobile ? 28 : 36 },
  statsRow: {
    flexDirection:   'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     colors.border,
    overflow:        'hidden',
  },
  statItem: {
    flex:              1,
    alignItems:        'center',
    paddingVertical:   isMobile ? 14 : 18,
    paddingHorizontal: 8,
    gap:               3,
  },
  statItemBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statIconWrap: {
    width:           isMobile ? 26 : 30,
    height:          isMobile ? 26 : 30,
    borderRadius:    isMobile ? 13 : 15,
    backgroundColor: colors.accent,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    2,
  },
  statNumber: {
    fontSize:      isMobile ? 20 : 24,
    fontWeight:    '900',
    color:         colors.button,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize:   isMobile ? 10 : 11,
    color:      colors.textMuted,
    fontWeight: '500',
    textAlign:  'center',
  },

  // CTA
  btnHero: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    paddingVertical:   isMobile ? 16 : 18,
    paddingHorizontal: isMobile ? 28 : 36,
    borderRadius:      16,
    backgroundColor:   colors.button,
    marginBottom:      isMobile ? 28 : 36,
    shadowColor:       colors.button,
    shadowOffset:      { width: 0, height: 8 },
    shadowOpacity:     0.32,
    shadowRadius:      20,
    elevation:         8,
  },
  btnHeroText: {
    fontSize:      isMobile ? 15 : 17,
    fontWeight:    '800',
    color:         '#fff',
    letterSpacing: 0.3,
  },
  btnArrow: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // Trust
  heroTrust: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               12,
    marginBottom:      isMobile ? 20 : 28,
    paddingVertical:   13,
    paddingHorizontal: 18,
    borderRadius:      14,
    backgroundColor:   colors.surfaceAlt,
    borderWidth:       1,
    borderColor:       colors.border,
    alignSelf:         'center',
  },
  heroAvatars: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  avatar: {
    width:          isMobile ? 32 : 38,
    height:         isMobile ? 32 : 38,
    borderRadius:   isMobile ? 16 : 19,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    2.5,
    borderColor:    colors.surface,
  },
  avatarText: {
    fontSize:   isMobile ? 9 : 11,
    fontWeight: '800',
  },
  trustTextWrap: { gap: 3 },
  trustTitleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
  },
  heroTrustTextBold: {
    fontSize:   isMobile ? 12.5 : 13.5,
    fontWeight: '700',
    color:      colors.text,
  },
  heroTrustSub: {
    fontSize: isMobile ? 10.5 : 11.5,
    color:    colors.textMuted,
  },

  // Pills
  pillRow: {
    flexDirection:  'row',
    gap:            8,
    flexWrap:       'wrap',
    justifyContent: 'center',
  },
  pill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    paddingVertical:   6,
    paddingHorizontal: 13,
    borderRadius:      20,
    backgroundColor:   colors.surfaceDeep,
    borderWidth:       1,
    borderColor:       colors.borderAccent,
  },
  pillText: {
    fontSize:   isMobile ? 11.5 : 12.5,
    color:      colors.textLight,
    fontWeight: '600',
  },
});