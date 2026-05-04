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
  surface:      '#FFFFFF',
  surfaceAlt:   '#ddf3fc',
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

const benefits = [
  {
    icon: 'notifications-outline',
    title: 'Alertas em tempo real',
    desc: 'Notificações instantâneas quando alguém registrar um item que combina com o seu.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Chat seguro',
    desc: 'Converse com o achador sem expor seus dados pessoais.',
  },
  {
    icon: 'sparkles-outline',
    title: 'Busca por IA',
    desc: 'Algoritmo que cruza descrições e fotos para sugerir matches.',
  },
  {
    icon: 'location-outline',
    title: 'Geolocalização',
    desc: 'Veja onde o item foi encontrado e combine o encontro.',
  },
  {
    icon: 'grid-outline',
    title: 'Painel de controle',
    desc: 'Gerencie todos os seus itens em um só lugar.',
  },
  {
    icon: 'gift-outline',
    title: 'Recompensas',
    desc: 'Defina uma recompensa para incentivar devoluções.',
  },
];

export default function BenefitsSection() {
  return (
    <View style={styles.section}>

      {/* Badge */}
      <View style={styles.badge}>
        <Ionicons name="star-outline" size={12} color={colors.button} />
        <Text style={styles.badgeText}>Benefícios</Text>
      </View>

      {/* Title */}
      <Text style={styles.sectionTitle}>
        Tudo para recuperar{'\n'}
        <Text style={styles.sectionTitleAccent}>o que você perdeu</Text>
      </Text>

      {/* Grid */}
      <View style={styles.grid}>
        {benefits.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={item.icon}
                size={isMobile ? 18 : 20}
                color={colors.button}
              />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
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

  sectionTitle: {
    fontSize:      isMobile ? 26 : 38,
    fontWeight:    '900',
    color:         colors.text,
    textAlign:     'center',
    lineHeight:    isMobile ? 34 : 50,
    letterSpacing: isMobile ? -0.5 : -1,
    marginBottom:  isMobile ? 28 : 40,
  },
  sectionTitleAccent: {
    color: colors.button,
  },

  grid: {
    width:    '100%',
    maxWidth: 540,
    gap:      isMobile ? 10 : 14,
  },

  card: {
    backgroundColor: colors.surfaceAlt,
    borderWidth:     1,
    borderColor:     colors.borderAccent,
    borderRadius:    16,
    padding:         isMobile ? 16 : 20,
  },

  iconWrap: {
    width:           isMobile ? 36 : 42,
    height:          isMobile ? 36 : 42,
    borderRadius:    isMobile ? 10 : 12,
    backgroundColor: colors.accent,
    borderWidth:     1,
    borderColor:     colors.borderStrong,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    isMobile ? 12 : 14,
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
});