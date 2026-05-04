import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

const differentials = [
  {
    icon:       'sparkles',
    iconSecond: 'analytics-outline',
    title:      'Tecnologia de matching por IA',
    desc:       'Precisão de 94% na identificação de matches. O Find faz tudo por você, 24h por dia.',
    hero:       true,
    stats: [
      { icon: 'trending-up-outline', value: '94%',  label: 'precisão'  },
      { icon: 'time-outline',        value: '24h',  label: 'ativo'     },
      { icon: 'flash-outline',       value: '18min', label: 'p/ match' },
    ],
  },
  {
    icon:  'shield-checkmark',
    title: 'Privacidade total',
    desc:  'Seus dados nunca são expostos. Comunicação mediada e verificada.',
    tag:   { icon: 'lock-closed-outline', label: 'Criptografado' },
  },
  {
    icon:  'timer',
    title: 'Resposta em minutos',
    desc:  'Tempo médio de 18min entre cadastro e primeiro contato.',
    tag:   { icon: 'flash-outline', label: 'Tempo real' },
  },
  {
    icon:  'people',
    title: 'Comunidade ativa',
    desc:  '120mil+ usuários verificados dispostos a ajudar.',
    tag:   { icon: 'checkmark-circle-outline', label: '120k+ membros' },
  },
];

export default function DifferentialsSection() {
  return (
    <View style={styles.section}>

      {/* Badge */}
      <View style={styles.badge}>
        <Ionicons name="ribbon" size={12} color={colors.button} />
        <Text style={styles.badgeText}>Diferenciais</Text>
      </View>

      {/* Título */}
      <Text style={styles.title}>
        Por que o Find{'\n'}
        <Text style={styles.titleAccent}>é diferente</Text>
      </Text>

      {/* Grid */}
      <View style={styles.grid}>

        {/* Card hero */}
        {(() => {
          const item = differentials[0];
          return (
            <View style={styles.heroCard}>

              {/* Orbs decorativos */}
              <View style={styles.heroOrb1} pointerEvents="none" />
              <View style={styles.heroOrb2} pointerEvents="none" />

              {/* Topo */}
              <View style={styles.heroTop}>
                <View style={styles.heroIconWrap}>
                  <Ionicons name={item.icon} size={22} color={colors.button} />
                </View>
                <View style={styles.heroBadgePill}>
                  <View style={styles.heroBadgeDot} />
                  <Text style={styles.heroBadgePillText}>IA ativa</Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>{item.title}</Text>
              <Text style={styles.heroDesc}>{item.desc}</Text>

              {/* Mini stats */}
              <View style={styles.heroStats}>
                {item.stats.map((s, i) => (
                  <View key={i} style={[styles.heroStat, i < 2 && styles.heroStatBorder]}>
                    <Ionicons name={s.icon} size={13} color={colors.button} />
                    <Text style={styles.heroStatValue}>{s.value}</Text>
                    <Text style={styles.heroStatLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

            </View>
          );
        })()}

        {/* Cards secundários */}
        {differentials.slice(1).map((item, index) => (
          <View key={index} style={styles.card}>

            {/* Linha topo */}
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={isMobile ? 18 : 20} color={colors.button} />
              </View>
              {item.tag && (
                <View style={styles.tag}>
                  <Ionicons name={item.tag.icon} size={10} color={colors.button} />
                  <Text style={styles.tagText}>{item.tag.label}</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>

            {/* Linha decorativa inferior */}
            <View style={styles.cardFooter}>
              <View style={styles.cardFooterLine} />
              <Ionicons name="chevron-forward" size={12} color={colors.borderStrong} />
            </View>

          </View>
        ))}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor:   colors.surface,
    paddingVertical:   isMobile ? 40 : 64,
    paddingHorizontal: isMobile ? 20 : 32,
    alignItems:        'center',
  },

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
    marginBottom:  isMobile ? 28 : 40,
  },
  titleAccent: { color: colors.button },

  grid: {
    width:    '100%',
    maxWidth: 540,
    gap:      isMobile ? 10 : 14,
  },

  // ── Hero card ──
  heroCard: {
    backgroundColor: colors.accent,
    borderWidth:     1.5,
    borderColor:     colors.borderStrong,
    borderRadius:    20,
    padding:         isMobile ? 18 : 24,
    overflow:        'hidden',
  },
  heroOrb1: {
    position:        'absolute',
    top:             -40,
    right:           -40,
    width:           140,
    height:          140,
    borderRadius:    70,
    backgroundColor: colors.accentStrong,
    opacity:         0.45,
  },
  heroOrb2: {
    position:        'absolute',
    bottom:          -30,
    left:            -30,
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: colors.accentStrong,
    opacity:         0.30,
  },

  heroTop: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   isMobile ? 14 : 18,
  },
  heroIconWrap: {
    width:           isMobile ? 48 : 56,
    height:          isMobile ? 48 : 56,
    borderRadius:    isMobile ? 14 : 16,
    backgroundColor: colors.surface,
    borderWidth:     1.5,
    borderColor:     colors.borderStrong,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     colors.button,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.15,
    shadowRadius:    12,
    elevation:       4,
  },
  heroBadgePill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingVertical:   5,
    paddingHorizontal: 11,
    borderRadius:      20,
    backgroundColor:   colors.surface,
    borderWidth:       1,
    borderColor:       colors.borderStrong,
  },
  heroBadgeDot: {
    width:           7,
    height:          7,
    borderRadius:    4,
    backgroundColor: '#00c264',
  },
  heroBadgePillText: {
    fontSize:   isMobile ? 10 : 11,
    fontWeight: '700',
    color:      colors.buttonDeep,
  },

  heroTitle: {
    fontSize:     isMobile ? 16 : 18,
    fontWeight:   '900',
    color:        colors.text,
    marginBottom: isMobile ? 6 : 8,
    letterSpacing: -0.3,
  },
  heroDesc: {
    fontSize:     isMobile ? 12.5 : 13.5,
    color:        colors.buttonDeep,
    lineHeight:   isMobile ? 19 : 22,
    marginBottom: isMobile ? 16 : 20,
  },

  heroStats: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     colors.borderAccent,
    overflow:        'hidden',
  },
  heroStat: {
    flex:           1,
    alignItems:     'center',
    paddingVertical: isMobile ? 10 : 13,
    gap:            3,
  },
  heroStatBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.borderAccent,
  },
  heroStatValue: {
    fontSize:   isMobile ? 14 : 16,
    fontWeight: '900',
    color:      colors.button,
    letterSpacing: -0.3,
  },
  heroStatLabel: {
    fontSize:   isMobile ? 9 : 10,
    color:      colors.textMuted,
    fontWeight: '500',
  },

  // ── Cards secundários ──
  card: {
    backgroundColor: colors.surfaceAlt,
    borderWidth:     1,
    borderColor:     colors.borderAccent,
    borderRadius:    16,
    padding:         isMobile ? 16 : 20,
  },

  cardTop: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   isMobile ? 12 : 14,
  },
  iconWrap: {
    width:           isMobile ? 42 : 48,
    height:          isMobile ? 42 : 48,
    borderRadius:    isMobile ? 12 : 14,
    backgroundColor: colors.accent,
    borderWidth:     1,
    borderColor:     colors.borderStrong,
    alignItems:      'center',
    justifyContent:  'center',
  },

  tag: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    paddingVertical:   5,
    paddingHorizontal: 10,
    borderRadius:      20,
    backgroundColor:   colors.surfaceDeep,
    borderWidth:       1,
    borderColor:       colors.borderAccent,
  },
  tagText: {
    fontSize:   isMobile ? 10 : 11,
    fontWeight: '700',
    color:      colors.button,
  },

  cardTitle: {
    fontSize:     isMobile ? 14 : 15,
    fontWeight:   '800',
    color:        colors.text,
    marginBottom: 5,
  },
  cardDesc: {
    fontSize:   isMobile ? 12.5 : 13.5,
    color:      colors.textMuted,
    lineHeight: isMobile ? 19 : 22,
  },

  cardFooter: {
    flexDirection:  'row',
    alignItems:     'center',
    marginTop:      isMobile ? 14 : 16,
    gap:            8,
  },
  cardFooterLine: {
    flex:            1,
    height:          1,
    backgroundColor: colors.borderAccent,
  },
});