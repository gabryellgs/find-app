import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  Image,
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  Platform,
  UIManager,
  LayoutAnimation,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import HomeHeader from "../components/search/HomeHeader";
import SearchBar from "../components/search/SearchBar";
import { fetchItems, apiStatusMap, searchByImage } from "../services/api";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  bg: "#F5F7FB",
  surface: "#FFFFFF",
  text: "#0F172A",
  textMuted: "#5A6480",
  textLight: "#9AA3BB",
  border: "rgba(0, 30, 100, 0.05)",
  danger: "#EF4444",
};

const CATEGORIES = [
  { id: "all", label: "Todos", icon: "apps-outline" },
  { id: "pets", label: "Pets", icon: "paw-outline" },
  { id: "docs", label: "Documentos", icon: "document-outline" },
  { id: "electronics", label: "Eletrônicos", icon: "phone-portrait-outline" },
  { id: "bags", label: "Bolsas", icon: "bag-outline" },
  { id: "keys", label: "Chaves", icon: "key-outline" },
];

function CategoryChip({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={item.icon} size={14} color={selected ? colors.primaryDark : colors.textMuted} />
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

function ItemCard({ item }) {
  const title = item.title || item.titulo || "Sem título";
  const location = item.location || item.local || "Não informado";
  const date = item.time || item.date || "Data não informada";
  const statusNormalized = (item.raw_status || item.status || "").toLowerCase();
  const isLost = statusNormalized === "perdido" || item.type === "lost";
  const color = isLost ? "#B32E29" : "#1F7A51";
  const initials = (title.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase() || "??";
  const matches = item.matches ?? 0;
  const imageUrl = item.photo || item.imagem || item.photo_url || "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=800&auto=format&fit=crop";

  return (
    <TouchableOpacity style={styles.itemCard} activeOpacity={0.75}>
      <Image source={{ uri: imageUrl }} style={styles.itemImage} />
      <View style={styles.itemBody}>
        <View style={styles.itemRow}>
          <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
          <View style={[styles.typeBadge, isLost ? styles.typeLost : styles.typeFound]}>
            <Text style={[styles.typeBadgeText, isLost ? styles.typeLostText : styles.typeFoundText]}>
              {isLost ? "Perdido" : "Encontrado"}
            </Text>
          </View>
        </View>
        <View style={styles.itemMeta}>
          <Ionicons name="location-outline" size={12} color={colors.textLight} />
          <Text style={styles.itemMetaText} numberOfLines={1}>{location}</Text>
        </View>
        <View style={styles.itemFooter}>
          <Text style={styles.itemDate}>{date}</Text>
          {matches > 0 && (
            <View style={styles.matchBadge}>
              <Ionicons name="git-compare-outline" size={11} color="#185fa5" />
              <Text style={styles.matchText}>{matches} match{matches > 1 ? "es" : ""}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Busca({ route }) {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Busca visual por imagem
  const [visualSearchActive, setVisualSearchActive] = useState(false);
  const [visualSearchLoading, setVisualSearchLoading] = useState(false);
  const [visualResults, setVisualResults] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const carregarItens = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const response = await fetchItems({
        q: searchText,
        status: apiStatusMap[statusFiltro] || "todos",
        page: 1,
        perPage: 20,
      });

      if (response && Array.isArray(response.results)) {
        setItems(response.results);
      } else {
        setItems([]);
      }
    } catch (error) {
      setApiError(error.message || "Erro ao carregar resultados.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarItens();
  }, [searchText, statusFiltro]);

  useEffect(() => {
    if (route?.params?.visualSearchImageUri) {
      const uri = route.params.visualSearchImageUri;
      executarBuscaVisual(uri);
      // Clean up the parameter so it doesn't trigger again on subsequent renders
      route.params.visualSearchImageUri = null;
    }
  }, [route?.params?.visualSearchImageUri]);

  const filtered = items.filter((item) => {
    const itemTitle = (item.title || item.titulo || "").toLowerCase();
    const itemLocation = (item.location || item.local || "").toLowerCase();
    const statusNormalized = (item.raw_status || item.status || "").toLowerCase();
    const itemType = statusNormalized === "perdido" ? "Perdido" : statusNormalized === "achado" ? "Encontrado" : item.type === "lost" ? "Perdido" : item.type === "found" ? "Encontrado" : "";

    const matchesQuery =
      searchText === "" ||
      itemTitle.includes(searchText.toLowerCase()) ||
      itemLocation.includes(searchText.toLowerCase());

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

    const matchesTab =
      statusFiltro === "Todos" ||
      statusFiltro === itemType;

    return matchesQuery && matchesCategory && matchesTab;
  });

  // Configuração customizada de mola ultra suave (estilo iOS/Premium)
  const dispararAnimacaoMola = () => {
    LayoutAnimation.configureNext({
      duration: 450,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.78, // Controla o "banco" da animação (quanto maior, mais liso e menos oscilante)
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.78,
      },
      delete: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.78,
      },
    });
  };

  const alterarSearchText = (text) => {
    dispararAnimacaoMola();
    setSearchText(text);
  };

  const alterarCategoria = (id) => {
    dispararAnimacaoMola();
    setSelectedCategory(id);
  };

  const alterarStatusFiltro = (status) => {
    dispararAnimacaoMola();
    setStatusFiltro(status);
  };

  // ── Busca Visual (IA) ──
  const iniciarBuscaVisual = () => {
    Alert.alert("Busca por Imagem \uD83D\uDD0D", "Tire uma foto ou escolha da galeria", [
      { text: "C\u00e2mera", onPress: () => abrirPickerBusca("camera") },
      { text: "Galeria", onPress: () => abrirPickerBusca("galeria") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const abrirPickerBusca = async (origem) => {
    const permResult = origem === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert("Permiss\u00e3o negada", "Permita o acesso para usar a busca visual.");
      return;
    }
    const result = origem === "camera"
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets?.length > 0) {
      executarBuscaVisual(result.assets[0].uri);
    }
  };

  const executarBuscaVisual = async (uri) => {
    setPreviewImage(uri);
    setVisualSearchActive(true);
    setVisualSearchLoading(true);
    setVisualResults([]);
    try {
      const resp = await searchByImage(uri);
      setVisualResults(resp.results || []);
    } catch (e) {
      Alert.alert("Erro", e.message || "N\u00e3o foi poss\u00edvel buscar por imagem.");
    } finally {
      setVisualSearchLoading(false);
    }
  };

  const fecharBuscaVisual = () => {
    setVisualSearchActive(false);
    setPreviewImage(null);
    setVisualResults([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      {/* Header principal */}
      <View style={styles.header}>
        <HomeHeader />

        <View style={styles.headerContent}>
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <SearchBar 
                searchText={searchText}
                setSearchText={alterarSearchText}
                statusFiltro={statusFiltro}
                setStatusFiltro={alterarStatusFiltro}
              />
            </View>
            <TouchableOpacity style={styles.cameraBtn} onPress={iniciarBuscaVisual} activeOpacity={0.7}>
              <Ionicons name="camera" size={20} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>

          {/* Abas de Status rápidas */}
          <View style={styles.tabs}>
            {[
              { id: "Todos", label: "Todos" },
              { id: "Perdido", label: "Perdidos" },
              { id: "Encontrado", label: "Encontrados" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, statusFiltro === tab.id && styles.tabActive]}
                onPress={() => alterarStatusFiltro(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, statusFiltro === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Categorias horizontais */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              item={cat}
              selected={selectedCategory === cat.id}
              onPress={() => alterarCategoria(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Lista de Resultados */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.resultsLabel}>
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </Text>

        {loading && <Text style={styles.statusText}>Carregando resultados...</Text>}
        {apiError && <Text style={styles.errorText}>{apiError}</Text>}

        {filtered.length === 0 && !loading ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Nenhum resultado</Text>
            <Text style={styles.emptyText}>Tente ajustar os filtros ou usar outras palavras-chave.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Modal Busca Visual ── */}
      <Modal visible={visualSearchActive} animationType="slide" onRequestClose={fecharBuscaVisual}>
        <View style={styles.visualModal}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
          <View style={styles.visualHeader}>
            <TouchableOpacity onPress={fecharBuscaVisual} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.visualTitle}>Busca Visual IA</Text>
              <Text style={styles.visualSubtitle}>Itens similares à sua foto</Text>
            </View>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color="#7c3aed" />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          </View>

          {previewImage && (
            <View style={styles.previewWrap}>
              <Image source={{ uri: previewImage }} style={styles.previewImg} />
              <TouchableOpacity style={styles.previewRetry} onPress={iniciarBuscaVisual} activeOpacity={0.7}>
                <Ionicons name="camera-reverse" size={16} color={colors.primaryDark} />
                <Text style={styles.previewRetryText}>Trocar foto</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {visualSearchLoading ? (
              <View style={styles.visualLoading}>
                <ActivityIndicator size="large" color={colors.primaryDark} />
                <Text style={styles.visualLoadingText}>Analisando imagem...</Text>
                <Text style={styles.visualLoadingHint}>Comparando com itens cadastrados</Text>
              </View>
            ) : visualResults.length === 0 ? (
              <View style={styles.visualEmpty}>
                <Ionicons name="search-outline" size={48} color={colors.textLight} />
                <Text style={styles.visualEmptyTitle}>Nenhum item similar</Text>
                <Text style={styles.visualEmptyText}>Não encontramos itens parecidos com essa imagem.</Text>
              </View>
            ) : (
              <>
                <Text style={styles.visualCount}>{visualResults.length} item(ns) similar(es)</Text>
                {visualResults.map((item) => (
                  <View key={item.id} style={styles.visualCard}>
                    <Image source={{ uri: item.imagem || "https://via.placeholder.com/80" }} style={styles.visualCardImg} />
                    <View style={styles.visualCardBody}>
                      <View style={styles.visualCardTop}>
                        <Text style={styles.visualCardTitle} numberOfLines={1}>{item.titulo}</Text>
                        <View style={styles.simBadge}>
                          <Ionicons name="sparkles" size={10} color="#7c3aed" />
                          <Text style={styles.simBadgeText}>{item.similaridade}%</Text>
                        </View>
                      </View>
                      <View style={styles.itemMeta}>
                        <Ionicons name="location-outline" size={12} color={colors.textLight} />
                        <Text style={styles.itemMetaText} numberOfLines={1}>{item.local || "Não informado"}</Text>
                      </View>
                      <View style={[styles.typeBadge, item.status === "perdido" ? styles.typeLost : styles.typeFound, { alignSelf: "flex-start", marginTop: 4 }]}>
                        <Text style={[styles.typeBadgeText, item.status === "perdido" ? styles.typeLostText : styles.typeFoundText]}>
                          {item.status === "perdido" ? "Perdido" : "Encontrado"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, paddingBottom: 18 },
  headerContent: { paddingHorizontal: 20, gap: 12, marginTop: -20 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cameraBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  tabs: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 12, padding: 3, gap: 2, marginTop: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabText: { fontSize: 13, fontWeight: "600", color: "rgba(11,58,74,0.5)" },
  tabTextActive: { color: colors.primaryDark, fontWeight: "700" },
  categoriesWrapper: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.02)" },
  categories: { paddingHorizontal: 20, paddingVertical: 14 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  chipSelected: { backgroundColor: colors.primary, borderColor: "transparent" },
  chipLabel: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  chipLabelSelected: { color: colors.primaryDark, fontWeight: "700" },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  resultsLabel: { fontSize: 12, fontWeight: "700", color: colors.textLight, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16, marginLeft: 2 },
  statusText: { fontSize: 13, color: colors.textMuted, marginBottom: 10 },
  errorText: { fontSize: 13, color: colors.danger, marginBottom: 10 },
  list: { gap: 12 },
  itemCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.border, shadowColor: colors.primaryDark, shadowOpacity: 0.02, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  itemAvatar: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  itemAvatarText: { fontSize: 15, fontWeight: "700" },
  itemImage: { width: 84, height: 84, borderRadius: 16, marginRight: 12, backgroundColor: colors.border },
  itemBody: { flex: 1, gap: 4 },
  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  itemTitle: { fontSize: 14, fontWeight: "700", color: colors.text, flex: 1, letterSpacing: -0.2 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  typeLost: { backgroundColor: "#FEE2E2" },
  typeFound: { backgroundColor: "rgba(144,219,244,0.2)" },
  typeBadgeText: { fontSize: 11, fontWeight: "700" },
  typeLostText: { color: colors.danger },
  typeFoundText: { color: colors.primaryDark },
  itemMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  itemMetaText: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
  itemFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  itemDate: { fontSize: 11, color: colors.textLight, fontWeight: "500" },
  matchBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(24,95,165,0.08)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  matchText: { fontSize: 11, fontWeight: "700", color: "#185fa5" },
  empty: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.textMuted },
  emptyText: { fontSize: 13, color: colors.textLight, textAlign: "center", maxWidth: 240, lineHeight: 18 },

  // Visual Search Modal
  visualModal: { flex: 1, backgroundColor: colors.surface },
  visualHeader: { flexDirection: "row", alignItems: "center", paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  visualTitle: { fontSize: 18, fontWeight: "700", color: colors.primaryDark },
  visualSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(124,58,237,0.1)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  aiBadgeText: { fontSize: 11, fontWeight: "800", color: "#7c3aed" },
  previewWrap: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.bg },
  previewImg: { width: 64, height: 64, borderRadius: 14, borderWidth: 2, borderColor: colors.primary },
  previewRetry: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  previewRetryText: { fontSize: 13, fontWeight: "600", color: colors.primaryDark },
  visualLoading: { alignItems: "center", paddingTop: 60, gap: 12 },
  visualLoadingText: { fontSize: 16, fontWeight: "700", color: colors.primaryDark },
  visualLoadingHint: { fontSize: 13, color: colors.textMuted },
  visualEmpty: { alignItems: "center", paddingTop: 60, gap: 10 },
  visualEmptyTitle: { fontSize: 16, fontWeight: "700", color: colors.textMuted },
  visualEmptyText: { fontSize: 13, color: colors.textLight, textAlign: "center", maxWidth: 260, lineHeight: 18 },
  visualCount: { fontSize: 12, fontWeight: "700", color: colors.textLight, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 },
  visualCard: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 16, padding: 12, gap: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border, elevation: 1, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6 },
  visualCardImg: { width: 72, height: 72, borderRadius: 14, backgroundColor: colors.bg },
  visualCardBody: { flex: 1, gap: 4 },
  visualCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  visualCardTitle: { fontSize: 14, fontWeight: "700", color: colors.text, flex: 1 },
  simBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(124,58,237,0.1)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  simBadgeText: { fontSize: 11, fontWeight: "800", color: "#7c3aed" },
});