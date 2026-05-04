import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const colors = {
  primary: "#abe8ff",
  bg: "#F5F7FB",
  surface: "#FFFFFF",
  text: "#0B0F1A",
  textMuted: "#5A6480",
  textLight: "#9AA3BB",
  border: "rgba(0, 30, 100, 0.09)",
};

export default function Dashboard({ onBack }) {
  const categories = ["🍔 Comida", "🚗 Carro", "🏠 Casa", "📱 Tech", "👕 Moda"];
  const items = [
    {
      title: "Carteira preta — Couro",
      location: "Copacabana, RJ",
      time: "há 2h",
      status: "Encontrado",
      statusColor: "#00C264",
    },
    {
      title: "iPhone 15 Pro — Preto",
      location: "Pinheiros, SP",
      time: "há 5h",
      status: "Perdido",
      statusColor: "#FF6450",
    },
    {
      title: "Chave de moto — Honda",
      location: "Moema, SP",
      time: "há 12min",
      status: "Match!",
      statusColor: "#4D8AFF",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Find</Text>
          <Text style={styles.headerSubtitle}>Encontre o que você precisa</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Buscar por item ou local..."
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          <View style={styles.categoriesRow}>
            {categories.map((cat, i) => (
              <View key={i} style={styles.categoryItem}>
                <Text style={styles.categoryText}>{cat}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Items */}
      <View style={styles.itemsSection}>
        <View style={styles.itemsHeader}>
          <Text style={styles.sectionTitle}>Destaques</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.itemsList}>
          {items.map((item, i) => (
            <View key={i} style={styles.itemCard}>
              <View style={styles.itemImage}>
                <Text style={styles.itemImageIcon}>📦</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemLocation}>
                  {item.location} • {item.time}
                </Text>
                <View
                  style={[
                    styles.itemStatus,
                    { backgroundColor: item.statusColor + "20" },
                  ]}
                >
                  <Text
                    style={[styles.itemStatusText, { color: item.statusColor }]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <View style={styles.navItemActive}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navTextActive}>Início</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navText}>Buscar</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navText}>Favoritos</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Perfil</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { marginRight: 12, padding: 8 },
  backButtonText: { color: "#fff", fontSize: 24 },
  headerContent: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 2,
  },

  // Search
  searchWrapper: { paddingHorizontal: 16, marginTop: -16 },
  searchBar: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: { marginRight: 8, fontSize: 16 },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },

  // Categories
  categoriesSection: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoriesScroll: { flexGrow: 0 },
  categoriesRow: { flexDirection: "row", gap: 12 },
  categoryItem: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryText: { color: colors.textMuted, fontSize: 14 },

  // Items
  itemsSection: { flex: 1, paddingHorizontal: 16, marginTop: 24 },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  itemsList: { flex: 1 },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemImage: {
    width: 60,
    height: 60,
    backgroundColor: colors.bg,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemImageIcon: { fontSize: 24 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemTitle: { color: colors.text, fontWeight: "600", fontSize: 15 },
  itemLocation: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  itemStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  itemStatusText: { fontSize: 12, fontWeight: "700" },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "300" },

  // Bottom Nav
  bottomNav: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navItemActive: { alignItems: "center" },
  navItem: { alignItems: "center" },
  navIcon: { fontSize: 20 },
  navTextActive: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  navText: { color: colors.textLight, fontSize: 12, marginTop: 4 },
});
