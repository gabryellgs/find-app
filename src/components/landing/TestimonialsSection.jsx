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

const testimonials = [
  {
    text:     'Perdi minha carteira e recuperei em menos de 3 horas. Nunca pensei que fosse possível.',
    name:     'Ana Martins',
    role:     'Designer',
    city:     'São Paulo, SP',
    initials: 'AM',
    avatarBg: colors.accent,
    avatarColor: colors.buttonDeep,
    item:     { icon: 'card-outline', label: 'Carteira recuperada' },
    time:     '3h',
  },
  {
    text:     'Devolvi um celular que encontrei no metrô. Processo super simples, fiquei feliz em ajudar.',
    name:     'Rafael Costa',
    role:     'Engenheiro',
    city:     'Curitiba, PR',
    initials: 'RC',
    avatarBg: 'rgba(5, 150, 105, 0.12)',
    avatarColor: '#047857',
    item:     { icon: 'phone-portrait-outline', label: 'Celular devolvido' },
    time:     '1h',
  },
  {
    text:     'Implementamos o Find nos nossos eventos. Zero problemas com itens perdidos desde então.',
    name:     'Juliana Santos',
    role:     'Gerente de Eventos',
    city:     'Rio de Janeiro, RJ',
    initials: 'JS',
    avatarBg: 'rgba(124, 58, 237, 0.10)',
    avatarColor: '#6d28d9',
    item:     { icon: 'calendar-outline', label: 'Eventos cobertos' },
    time:     '—',
  },
];

export default function TestimonialsSection() {
  return (
    <View style={styles.section}>

      {/* Badge */}
      <View style={styles.badge}>
        <Ionicons name="chatbubble-ellipses" size={12} color={colors.button} />
        <Text style={styles.badgeText}>Depoimentos</Text>
      </View>

      {/* Título */}
      <Text style={styles.title}>
        Quem usou,{'\n'}
        <Text style={styles.titleAccent}>aprova</Text>
      </Text>

      {/* Cards */}
      <View style={styles.grid}>
        {testimonials.map((item, index) => (
          <View key={index} style={styles.card}>

            {/* Topo — estrelas + item recuperado */}
            <View style={styles.cardTop}>
              <View style={styles.starsRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={12} color="#f59e0b" />
                ))}
              </View>
              <View style={styles.itemTag}>
                <Ionicons name={item.item.icon} size={10} color={colors.button} />
                <Text style={styles.itemTagText}>{item.item.label}</Text>
              </View>
            </View>

            {/* Aspas decorativas */}
            <View style={styles.quoteIconWrap}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.accentStrong} />
            </View>

            {/* Texto */}
            <Text style={styles.quoteText}>"{item.text}"</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Rodapé — avatar + info + tempo */}
            <View style={styles.cardFooter}>
              <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
                <Text style={[styles.avatarText, { color: item.avatarColor }]}>
                  {item.initials}
                </Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{item.name}</Text>
                <View style={styles.authorMeta}>
                  <Ionicons name="briefcase-outline" size={10} color={colors.textMuted} />
                  <Text style={styles.authorRole}>{item.role}</Text>
                  <Text style={styles.authorDot}>·</Text>
                  <Ionicons name="location-outline" size={10} color={colors.textMuted} />
                  <Text style={styles.authorRole}>{item.city}</Text>
                </View>
              </View>
              {item.time !== '—' && (
                <View style={styles.timeTag}>
                  <Ionicons name="flash" size={10} color={colors.button} />
                  <Text style={styles.timeTagText}>{item.time}</Text>
                </View>
              )}
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
    gap:      isMobile ? 12 : 16,
  },

  card: {
    backgroundColor: colors.surfaceAlt,
    borderWidth:     1,
    borderColor:     colors.borderAccent,
    borderRadius:    18,
    padding:         isMobile ? 16 : 20,
  },

  // Topo
  cardTop: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   isMobile ? 12 : 14,
  },
  starsRow: {
    flexDirection: 'row',
    gap:           2,
  },
  itemTag: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    paddingVertical:   4,
    paddingHorizontal: 9,
    borderRadius:      20,
    backgroundColor:   colors.accent,
    borderWidth:       1,
    borderColor:       colors.borderStrong,
  },
  itemTagText: {
    fontSize:   isMobile ? 9 : 10,
    fontWeight: '700',
    color:      colors.button,
  },

  // Quote
  quoteIconWrap: {
    marginBottom: isMobile ? 6 : 8,
  },
  quoteText: {
    fontSize:     isMobile ? 13 : 14.5,
    color:        colors.text,
    lineHeight:   isMobile ? 20 : 24,
    fontWeight:   '500',
    marginBottom: isMobile ? 14 : 18,
  },

  divider: {
    height:          1,
    backgroundColor: colors.borderAccent,
    marginBottom:    isMobile ? 12 : 16,
  },

  // Rodapé
  cardFooter: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  avatar: {
    width:          isMobile ? 36 : 42,
    height:         isMobile ? 36 : 42,
    borderRadius:   isMobile ? 18 : 21,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    1.5,
    borderColor:    colors.borderAccent,
  },
  avatarText: {
    fontSize:   isMobile ? 11 : 13,
    fontWeight: '800',
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize:     isMobile ? 13 : 14,
    fontWeight:   '800',
    color:        colors.text,
    marginBottom: 3,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    flexWrap:      'wrap',
  },
  authorRole: {
    fontSize:   isMobile ? 10 : 11,
    color:      colors.textMuted,
    fontWeight: '500',
  },
  authorDot: {
    fontSize: 10,
    color:    colors.textMuted,
  },

  timeTag: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingVertical:   5,
    paddingHorizontal: 9,
    borderRadius:      20,
    backgroundColor:   colors.accent,
    borderWidth:       1,
    borderColor:       colors.borderStrong,
  },
  timeTagText: {
    fontSize:   isMobile ? 10 : 11,
    fontWeight: '800',
    color:      colors.button,
  },
});