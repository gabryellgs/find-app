import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import LogoFind from "../layout/LogoFind";
const { width: screenWidth } = Dimensions.get("window");
const isMobile = screenWidth < 768;

const colors = {
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

const STEPS = [
  { icon: 'camera-outline',           bold: 'Cadastre o item',       rest: 'com foto e localização'  },
  { icon: 'sparkles-outline',         bold: 'A IA faz o cruzamento', rest: 'automático'              },
  { icon: 'checkmark-circle-outline', bold: 'Receba o match',        rest: 'e combine a devolução'   },
];

const MOCK_CARDS = [
  {
    icon:       'card-outline',
    iconBg:     colors.accent,
    iconColor:  colors.button,
    title:      'Carteira preta',
    sub:        'Copacabana, RJ • há 2h',
    badgeText:  'Encontrado',
    badgeBg:    'rgba(0, 194, 100, 0.12)',
    badgeColor: '#00a855',
  },
  {
    icon:       'phone-portrait-outline',
    iconBg:     'rgba(255, 100, 80, 0.10)',
    iconColor:  '#e05540',
    title:      'iPhone 15 Pro',
    sub:        'Pinheiros, SP • há 5h',
    badgeText:  'Perdido',
    badgeBg:    'rgba(255, 100, 80, 0.10)',
    badgeColor: '#e05540',
  },
  {
    icon:       'key-outline',
    iconBg:     colors.accent,
    iconColor:  colors.button,
    title:      'Chaves Honda Civic',
    sub:        'Moema, SP • há 1h',
    badgeText:  'Encontrado',
    badgeBg:    'rgba(0, 194, 100, 0.12)',
    badgeColor: '#00a855',
  },
];

export default function DemoSection({ onEnterApp }) {
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <View style={styles.section}>

      {/* ── Mockup do app ── */}
      <View style={styles.mockupWrap}>

        {/* Header do app */}
        <View style={styles.mockupHeader}>
          <View style={styles.mockupHeaderLeft}>
            <LogoFind size={isMobile ? 'small' : 'normal'} dark={true} />
          </View>
          <View style={styles.mockupHeaderRight}>
            <Ionicons name="notifications-outline" size={16} color={colors.textMuted} />
            <View style={styles.mockupAvatar}>
              <Text style={styles.mockupAvatarText}>GS</Text>
            </View>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.mockupSearch}>
          <Ionicons name="search-outline" size={13} color={colors.textMuted} />
          <Text style={styles.mockupSearchText}>Buscar item perdido...</Text>
          <View style={styles.mockupSearchFilter}>
            <Ionicons name="options-outline" size={13} color={colors.button} />
          </View>
        </View>

        {/* Label */}
        <Text style={styles.mockupSectionLabel}>Recentes</Text>

        {/* Cards */}
        {MOCK_CARDS.map((card, i) => (
          <View key={i} style={styles.mockupCard}>
            <View style={[styles.mockupCardIcon, { backgroundColor: card.iconBg }]}>
              <Ionicons name={card.icon} size={isMobile ? 14 : 16} color={card.iconColor} />
            </View>
            <View style={styles.mockupCardInfo}>
              <Text style={styles.mockupCardTitle}>{card.title}</Text>
              <View style={styles.mockupCardSubRow}>
                <Ionicons name="location-outline" size={9} color={colors.textMuted} />
                <Text style={styles.mockupCardSub}>{card.sub}</Text>
              </View>
            </View>
            <View style={[styles.mockupBadge, { backgroundColor: card.badgeBg }]}>
              <Text style={[styles.mockupBadgeText, { color: card.badgeColor }]}>
                {card.badgeText}
              </Text>
            </View>
          </View>
        ))}

      </View>

      {/* ── Conteúdo ── */}
      <View style={styles.content}>

        <View style={styles.badge}>
          <Ionicons name="help-circle-outline" size={12} color={colors.button} />
          <Text style={styles.badgeText}>Como funciona</Text>
        </View>

        <Text style={styles.title}>
          Simples, em{'\n'}
          <Text style={styles.titleAccent}>3 passos</Text>
        </Text>

        <View style={styles.stepsList}>
          {STEPS.map(({ icon, bold, rest }, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name={icon} size={isMobile ? 14 : 16} color={colors.button} />
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>{bold} </Text>
                <Text style={styles.stepRest}>{rest}</Text>
              </Text>
            </View>
          ))}
        </View>

        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onEnterApp}>
          <Animated.View style={[styles.btn, { transform: [{ scale: btnScale }] }]}>
            <Ionicons name="rocket-outline" size={16} color="#fff" />
            <Text style={styles.btnText}>Cadastrar agora</Text>
            <View style={styles.btnArrow}>
              <Ionicons name="arrow-forward" size={13} color="#fff" />
            </View>
          </Animated.View>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor:   colors.surface,
    paddingVertical:   isMobile ? 40 : 64,
    paddingHorizontal: isMobile ? 20 : 32,
  },

  // ── Mockup ──
  mockupWrap: {
    backgroundColor: colors.surfaceAlt,
    borderWidth:     1,
    borderColor:     colors.borderAccent,
    borderRadius:    20,
    overflow:        'hidden',
    marginBottom:    isMobile ? 32 : 44,
    shadowColor:     colors.button,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.10,
    shadowRadius:    20,
    elevation:       5,
  },

  mockupHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: isMobile ? 14 : 18,
    paddingVertical:   isMobile ? 10 : 13,
    backgroundColor:   colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mockupHeaderLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           7,
  },
 
  mockupHeaderRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  mockupAvatar: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: colors.accentStrong,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1.5,
    borderColor:     colors.borderStrong,
  },
  mockupAvatarText: {
    fontSize:   8,
    fontWeight: '800',
    color:      colors.buttonDeep,
  },

  mockupSearch: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    backgroundColor:   colors.surface,
    borderWidth:       1,
    borderColor:       colors.borderAccent,
    borderRadius:      10,
    marginHorizontal:  isMobile ? 12 : 16,
    marginVertical:    isMobile ? 10 : 14,
    paddingVertical:   isMobile ? 8 : 10,
    paddingHorizontal: isMobile ? 10 : 13,
  },
  mockupSearchText: {
    flex:     1,
    fontSize: isMobile ? 11 : 13,
    color:    colors.textMuted,
  },
  mockupSearchFilter: {
    width:           24,
    height:          24,
    borderRadius:    7,
    backgroundColor: colors.accent,
    alignItems:      'center',
    justifyContent:  'center',
  },

  mockupSectionLabel: {
    fontSize:          isMobile ? 10 : 11,
    fontWeight:        '700',
    color:             colors.textMuted,
    letterSpacing:     0.6,
    textTransform:     'uppercase',
    marginHorizontal:  isMobile ? 12 : 16,
    marginBottom:      isMobile ? 8 : 10,
  },

  mockupCard: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    backgroundColor:   colors.surface,
    borderTopWidth:    1,
    borderTopColor:    colors.border,
    paddingVertical:   isMobile ? 10 : 13,
    paddingHorizontal: isMobile ? 12 : 16,
  },
  mockupCardIcon: {
    width:          isMobile ? 32 : 38,
    height:         isMobile ? 32 : 38,
    borderRadius:   isMobile ? 9 : 11,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    1,
    borderColor:    colors.borderAccent,
  },
  mockupCardInfo: { flex: 1 },
  mockupCardTitle: {
    fontSize:     isMobile ? 11 : 13,
    fontWeight:   '700',
    color:        colors.text,
    marginBottom: 3,
  },
  mockupCardSubRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
  },
  mockupCardSub: {
    fontSize: isMobile ? 9 : 10,
    color:    colors.textMuted,
  },
  mockupBadge: {
    paddingVertical:   isMobile ? 3 : 4,
    paddingHorizontal: isMobile ? 8 : 10,
    borderRadius:      20,
  },
  mockupBadgeText: {
    fontSize:   isMobile ? 9 : 10,
    fontWeight: '700',
  },

  // ── Conteúdo ──
  content: { alignItems: 'center' },

  badge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingVertical:   7,
    paddingHorizontal: 14,
    borderRadius:      24,
    backgroundColor:   colors.accent,
    borderWidth:       1,
    borderColor:       colors.borderStrong,
    marginBottom:      isMobile ? 20 : 28,
  },
  badgeText: {
    fontSize:      isMobile ? 11 : 12,
    fontWeight:    '700',
    color:         colors.button,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  title: {
    fontSize:      isMobile ? 26 : 38,
    fontWeight:    '900',
    color:         colors.text,
    textAlign:     'center',
    lineHeight:    isMobile ? 34 : 50,
    letterSpacing: isMobile ? -0.5 : -1,
    marginBottom:  isMobile ? 24 : 36,
  },
  titleAccent: { color: colors.button },

  stepsList: {
    width:        '100%',
    maxWidth:     400,
    marginBottom: isMobile ? 28 : 36,
    gap:          isMobile ? 10 : 12,
  },
  stepItem: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    backgroundColor: colors.surfaceAlt,
    borderWidth:    1,
    borderColor:    colors.borderAccent,
    borderRadius:   12,
    padding:        isMobile ? 12 : 14,
  },
  stepNumber: {
    width:           isMobile ? 20 : 22,
    height:          isMobile ? 20 : 22,
    borderRadius:    isMobile ? 10 : 11,
    backgroundColor: colors.button,
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepNumberText: {
    fontSize:   9,
    fontWeight: '800',
    color:      '#fff',
  },
  stepIconWrap: {
    width:           isMobile ? 30 : 34,
    height:          isMobile ? 30 : 34,
    borderRadius:    isMobile ? 8 : 10,
    backgroundColor: colors.accent,
    borderWidth:     1,
    borderColor:     colors.borderStrong,
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepText: {
    flex:       1,
    fontSize:   isMobile ? 12.5 : 13.5,
    lineHeight: isMobile ? 19 : 22,
  },
  stepBold: { fontWeight: '800', color: colors.text     },
  stepRest: { fontWeight: '400', color: colors.textMuted },

  btn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    paddingVertical:   isMobile ? 15 : 17,
    paddingHorizontal: isMobile ? 28 : 36,
    borderRadius:      16,
    backgroundColor:   colors.button,
    shadowColor:       colors.button,
    shadowOffset:      { width: 0, height: 8 },
    shadowOpacity:     0.32,
    shadowRadius:      20,
    elevation:         8,
  },
  btnText: {
    fontSize:      isMobile ? 15 : 16,
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
});