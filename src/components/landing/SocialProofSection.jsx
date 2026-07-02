import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { fetchStats } from "../../services/api";

const { width: screenWidth } = Dimensions.get("window");
const isMobile = screenWidth < 768;

const colors = {
  button:       '#1eaed4',
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

// Metrics are dynamically calculated

function Counter({ target, suffix, style }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = null;
    const duration = 1400;
    const isFloat = !Number.isInteger(target);
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = eased * target;
      setVal(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));
      if (progress < 1) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), 400);
    return () => clearTimeout(timer);
  }, [target]);

  return (
    <Text style={style}>
      {val}
      <Text style={styles.metricSuffix}>{suffix}</Text>
    </Text>
  );
}

export default function SocialProofSection() {
  const [stats, setStats] = useState({ total: 0, encontrados: 0, devolvidos: 0 });

  useEffect(() => {
    fetchStats().then(res => {
      if (res && res.data) setStats(res.data);
    }).catch(() => {});
  }, []);

  let taxaRecuperacao = 0;
  if (stats.encontrados > 0) {
    taxaRecuperacao = Math.floor((stats.devolvidos / stats.encontrados) * 100);
  } else if (stats.devolvidos > 0 && stats.total > 0) {
    taxaRecuperacao = Math.floor((stats.devolvidos / stats.total) * 100);
  }
  if (taxaRecuperacao === 0 && stats.total > 0) {
    taxaRecuperacao = (stats.devolvidos === stats.encontrados && stats.devolvidos > 0) ? 100 : 0;
  }

  const METRICS = [
    { value: taxaRecuperacao, suffix: '%', label: 'taxa de recuperação', icon: 'trending-up-outline'      },
    { value: stats.encontrados, suffix: '', label: 'itens achados',   icon: 'bag-check-outline'        },
    { value: 4.9,  suffix: '★',  label: 'avaliação média',     icon: 'star-outline'             },
  ];

  return (
    <View style={styles.wrapper}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="bar-chart-outline" size={12} color={colors.button} />
          <Text style={styles.badgeText}>Números que impressionam</Text>
        </View>
      </View>

      {/* Metrics row */}
      <View style={styles.metricsRow}>
        {METRICS.map(({ value, suffix, label, icon }, i) => (
          <View
            key={label}
            style={[
              styles.metricItem,
              i < METRICS.length - 1 && styles.metricItemBorder,
            ]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={icon} size={isMobile ? 14 : 16} color={colors.button} />
            </View>
            <Counter target={value} suffix={suffix} style={styles.metricNum} />
            <Text style={styles.metricLabel}>{label}</Text>
          </View>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor:   colors.surface,
    borderTopWidth:    1,
    borderBottomWidth: 1,
    borderColor:       colors.border,
    paddingVertical:   isMobile ? 24 : 36,
    paddingHorizontal: isMobile ? 20 : 32,
    alignItems:        'center',
  },

  header: {
    marginBottom: isMobile ? 20 : 28,
    alignItems:   'center',
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
  },
  badgeText: {
    fontSize:      isMobile ? 11 : 12,
    fontWeight:    '700',
    color:         colors.button,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  metricsRow: {
    flexDirection:   'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     colors.border,
    overflow:        'hidden',
    width:           '100%',
    maxWidth:        540,
  },

  metricItem: {
    flex:              1,
    alignItems:        'center',
    paddingVertical:   isMobile ? 16 : 22,
    paddingHorizontal: 8,
    gap:               3,
  },
  metricItemBorder: {
    borderRightWidth:  1,
    borderRightColor:  colors.border,
  },

  iconWrap: {
    width:           isMobile ? 26 : 30,
    height:          isMobile ? 26 : 30,
    borderRadius:    isMobile ? 13 : 15,
    backgroundColor: colors.accent,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    2,
  },

  metricNum: {
    fontSize:      isMobile ? 22 : 28,
    fontWeight:    '900',
    color:         colors.button,
    letterSpacing: -0.5,
  },
  metricSuffix: {
    fontSize:   isMobile ? 14 : 18,
    fontWeight: '700',
    color:      colors.accentStrong,
  },
  metricLabel: {
    fontSize:   isMobile ? 10 : 11,
    color:      colors.textMuted,
    fontWeight: '500',
    textAlign:  'center',
  },
});