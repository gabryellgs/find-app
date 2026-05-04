import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LogoFind from "./LogoFind";

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

const COLS = [
  {
    title: 'Produto',
    links: [
      { label: 'Como funciona', icon: 'help-circle-outline'    },
      { label: 'Benefícios',    icon: 'star-outline'           },
      { label: 'Preços',        icon: 'pricetag-outline'       },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nós', icon: 'information-circle-outline' },
      { label: 'Blog',      icon: 'newspaper-outline'          },
      { label: 'Carreiras', icon: 'briefcase-outline'          },
    ],
  },
  {
    title: 'Suporte',
    links: [
      { label: 'Ajuda',   icon: 'chatbubble-ellipses-outline'  },
      { label: 'Contato', icon: 'mail-outline'                 },
      { label: 'Status',  icon: 'pulse-outline'                },
    ],
  },
];

const SOCIALS = [
  { icon: 'logo-instagram' },
  { icon: 'logo-linkedin'  },
  { icon: 'logo-twitter'   },
];

export default function Footer() {
  return (
    <View style={styles.footer}>

      {/* Orb decorativo */}
      <View style={styles.orb} pointerEvents="none" />

      {/* Topo — brand + colunas */}
      <View style={styles.top}>

        {/* Brand */}
        <View style={styles.brand}>
          <LogoFind size="small" dark={true} />
          <Text style={styles.brandDesc}>
            A plataforma mais eficiente do Brasil para recuperar itens perdidos.
          </Text>

          {/* Trust pills */}
          <View style={styles.trustRow}>
            <View style={styles.trustPill}>
              <View style={styles.trustDot} />
              <Text style={styles.trustPillText}>Serviço ativo</Text>
            </View>
            <View style={styles.trustPill}>
              <Ionicons name="shield-checkmark-outline" size={10} color={colors.button} />
              <Text style={styles.trustPillText}>Dados protegidos</Text>
            </View>
          </View>

          {/* Sociais */}
          <View style={styles.socialsRow}>
            {SOCIALS.map(({ icon }, i) => (
              <View key={i} style={styles.socialBtn}>
                <Ionicons name={icon} size={15} color={colors.button} />
              </View>
            ))}
          </View>
        </View>

        {/* Colunas de links */}
        <View style={styles.cols}>
          {COLS.map((col) => (
            <View key={col.title} style={styles.col}>
              <Text style={styles.colTitle}>{col.title}</Text>
              {col.links.map(({ label, icon }) => (
                <View key={label} style={styles.linkRow}>
                  <Ionicons name={icon} size={12} color={colors.button} style={{ opacity: 0.7 }} />
                  <Text style={styles.linkText}>{label}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.bottomLeft}>
          <Ionicons name="location-outline" size={12} color={colors.button} />
          <Text style={styles.bottomText}>Feito com ♥ no Brasil · © 2025 Find Tecnologia</Text>
        </View>
        <View style={styles.bottomRight}>
          <Text style={styles.bottomLink}>Privacidade</Text>
          <View style={styles.bottomDot} />
          <Text style={styles.bottomLink}>Termos</Text>
          <View style={styles.bottomDot} />
          <Text style={styles.bottomLink}>Cookies</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor:   colors.surfaceAlt,
    borderTopWidth:    1,
    borderTopColor:    colors.borderAccent,
    paddingVertical:   isMobile ? 40 : 60,
    paddingHorizontal: isMobile ? 20 : 32,
    overflow:          'hidden',
  },

  orb: {
    position:        'absolute',
    top:             -80,
    right:           -80,
    width:           280,
    height:          280,
    borderRadius:    140,
    backgroundColor: colors.accentStrong,
    opacity:         0.5,
  },

  top: {
    flexDirection: isMobile ? 'column' : 'row',
    gap:           isMobile ? 32 : 48,
    marginBottom:  isMobile ? 28 : 40,
  },

  brand: {
    flex:     isMobile ? undefined : 1,
    gap:      isMobile ? 12 : 16,
    maxWidth: isMobile ? '100%' : 220,
  },
  brandDesc: {
    fontSize:   isMobile ? 12.5 : 13.5,
    color:      colors.textMuted,
    lineHeight: isMobile ? 19 : 22,
  },

  trustRow: {
    flexDirection: 'row',
    gap:           8,
    flexWrap:      'wrap',
  },
  trustPill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    paddingVertical:   5,
    paddingHorizontal: 10,
    borderRadius:      20,
    backgroundColor:   colors.accent,
    borderWidth:       1,
    borderColor:       colors.borderStrong,
  },
  trustDot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: '#00c264',
  },
  trustPillText: {
    fontSize:   isMobile ? 10 : 11,
    fontWeight: '600',
    color:      colors.button,
  },

  socialsRow: {
    flexDirection: 'row',
    gap:           8,
  },
  socialBtn: {
    width:           34,
    height:          34,
    borderRadius:    10,
    backgroundColor: colors.accent,
    borderWidth:     1,
    borderColor:     colors.borderAccent,
    alignItems:      'center',
    justifyContent:  'center',
  },

  cols: {
    flex:           isMobile ? undefined : 2,
    flexDirection:  'row',
    gap:            isMobile ? 24 : 0,
    justifyContent: isMobile ? 'flex-start' : 'space-between',
    flexWrap:       'wrap',
  },
  col: {
    gap:      isMobile ? 10 : 12,
    minWidth: isMobile ? 90 : undefined,
  },
  colTitle: {
    fontSize:      isMobile ? 10 : 11,
    fontWeight:    '700',
    color:         colors.text,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom:  isMobile ? 2 : 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           7,
  },
  linkText: {
    fontSize:   isMobile ? 12.5 : 13.5,
    color:      colors.textMuted,
    fontWeight: '500',
  },

  divider: {
    height:          1,
    backgroundColor: colors.borderAccent,
    marginBottom:    isMobile ? 20 : 24,
  },

  bottom: {
    flexDirection:  isMobile ? 'column' : 'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            isMobile ? 12 : 0,
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  bottomText: {
    fontSize:   isMobile ? 11 : 12,
    color:      colors.textMuted,
    fontWeight: '500',
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  bottomLink: {
    fontSize:   isMobile ? 11 : 12,
    color:      colors.textMuted,
    fontWeight: '500',
  },
  bottomDot: {
    width:           3,
    height:          3,
    borderRadius:    2,
    backgroundColor: colors.borderAccent,
  },
});