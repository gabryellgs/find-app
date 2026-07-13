import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
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
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useIsFocused } from "@react-navigation/native";
import HomeHeader from "../components/home/HomeHeader";
import SearchBar from "../components/home/SearchBar";
import CategoryList from "../components/home/CategoryList";
import StatsRow from "../components/home/StatsRow";
import { fetchItems } from "../services/api";
import auth from "../services/auth";

const { width: screenWidth } = Dimensions.get("window");
// 🚀 PROPORÇÃO DE RESPEITO: 62% mantém o card imponente e mostra a fila perfeitamente
const CARD_WIDTH = screenWidth * 0.44; 
const CARD_GAP = 14;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  bg: "#F4F7FA", 
  surface: "#FFFFFF",
  textDark: "#052E3B",       
  textBody: "#185FA5",       
  textMuted: "#64748B",
  border: "rgba(11, 58, 74, 0.08)",
  
  cardBg: "#E3F6FC",         
  danger: "#B32E29",
  success: "#1F7A51",
  info: "#185FA5", 
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=800&auto=format&fit=crop";

export default function Home({ navigation }) {
  const isFocused = useIsFocused();
  const [searchText, setSearchText] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBolsista, setIsBolsista] = useState(false);

  const carregarDadosUsuario = async () => {
    const user = await auth.getUser();
    if (user) {
      setIsAdmin(user.is_admin || false);
      setIsBolsista(user.is_bolsista || false);
    }
  };

  const obterStatusTraduzidoAPI = (status) => {
    const mapa = { "Todos": "todos", "Perdido": "perdido", "Encontrado": "achado" };
    return mapa[status] || status.toLowerCase();
  };

  // ── Busca Visual (IA) ──
  const iniciarBuscaVisual = () => {
    Alert.alert("Busca por Imagem 🔍", "Tire uma foto ou escolha da galeria", [
      { text: "Câmera", onPress: () => abrirPickerBusca("camera") },
      { text: "Galeria", onPress: () => abrirPickerBusca("galeria") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const abrirPickerBusca = async (origem) => {
    const permResult = origem === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert("Permissão negada", "Permita o acesso para usar a busca visual.");
      return;
    }
    const result = origem === "camera"
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      navigation.navigate("Buscar", { visualSearchImageUri: uri });
    }
  };

  const filteredItems = items.filter((item) => {
    const tituloItem = item.titulo || item.title || "";
    const localItem = item.local || item.location || "";
    
    return (
      tituloItem.toLowerCase().includes(searchText.toLowerCase()) ||
      localItem.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const recentItems = filteredItems.slice(0, 6); 
  const perdidos = filteredItems.filter((item) => (item.status || "").toLowerCase() === "perdido");
  const achados = filteredItems.filter((item) => (item.status || "").toLowerCase() === "achado" || (item.status || "").toLowerCase() === "encontrado");
  const devolvidos = filteredItems.filter((item) => (item.status || "").toLowerCase() === "devolvido");

  const dispararAnimacaoMola = () => {
    LayoutAnimation.configureNext({
      duration: 360,
      create: { type: LayoutAnimation.Types.spring, property: LayoutAnimation.Properties.opacity, springDamping: 0.8 },
      update: { type: LayoutAnimation.Types.spring, springDamping: 0.8 },
    });
  };

  const carregarItens = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await fetchItems({
        q: searchText,
        status: obterStatusTraduzidoAPI(statusFiltro),
        categoria: categoriaFiltro,
        page: 1,
        perPage: 20,
      });
      
      if (data && Array.isArray(data.results)) {
        setItems(data.results);
      } else {
        setItems([]);
      }
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      carregarItens();
      carregarDadosUsuario();
    }
  }, [searchText, statusFiltro, categoriaFiltro, isFocused]); 

  // 🔥 CARD REDESENHADO: Sem botão e com metadados acoplados ao badge de status
  const renderCarouselCard = (item, index) => {
    const statusTexto = item.status?.toLowerCase() || "";
    
    let statusColor = colors.success;
    let statusIcon = "checkmark-circle";
    if (statusTexto === "perdido") {
      statusColor = colors.danger;
      statusIcon = "warning";
    } else if (statusTexto === "devolvido") {
      statusColor = colors.info;
      statusIcon = "sync";
    }

    const exibirTitulo = item.titulo || item.title || "Sem título";
    const exibirDescricao = item.descricao || item.description || "Sem descrição.";
    const exibirLocal = item.local || item.location || "Não informado";
    const exibirImagem = item.imagem || item.photo || item.photo_url || PLACEHOLDER_IMAGE;

    const rawData = item.data || item.date || item.criado_em || "Data pendente";
    const exibirData = typeof rawData === "string" && rawData.includes("-") 
      ? rawData.split("-").reverse().join("/") 
      : rawData;

    let exibirCategoria = "Objetos";
    if (item.categoria) {
      exibirCategoria = typeof item.categoria === "object" ? (item.categoria.nome || item.categoria.title) : item.categoria;
    } else if (item.category) {
      exibirCategoria = typeof item.category === "object" ? (item.category.nome || item.category.title) : item.category;
    }

    return (
      <TouchableOpacity 
        key={item.id || index} 
        activeOpacity={0.92} 
        style={styles.ifrnCard} 
        onPress={() => navigation.navigate("DetalheItem", { item, id: item.id })}
      >
        <Image source={{ uri: exibirImagem }} style={styles.ifrnCardImage} />

        <View style={styles.ifrnCardBody}>
          <Text style={styles.ifrnTitle} numberOfLines={1}>{exibirTitulo}</Text>
          <Text style={styles.ifrnDescription} numberOfLines={2}>{exibirDescricao}</Text>
          <Text style={styles.ifrnCategory}>{exibirCategoria.toUpperCase()}</Text>
        </View>

        {/* Rodapé limpo: Textos na esquerda e indicador na direita */}
        <View style={styles.ifrnMetaRow}>
          <View style={styles.ifrnMetaTextContainer}>
            <Text style={styles.ifrnLocation} numberOfLines={1}>
              <Ionicons name="location-outline" size={10} color={colors.textBody} /> {exibirLocal}
            </Text>
            <Text style={styles.ifrnDate}>{exibirData}</Text>
          </View>

          <View style={[styles.ifrnStatusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={12} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      
      <View style={styles.header}>
        <HomeHeader />
        <View style={styles.headerContent}>
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <SearchBar 
                searchText={searchText} 
                setSearchText={(t) => { dispararAnimacaoMola(); setSearchText(t); }} 
                statusFiltro={statusFiltro} 
                setStatusFiltro={(s) => { dispararAnimacaoMola(); setStatusFiltro(s); }} 
              />
            </View>
            <TouchableOpacity style={styles.cameraBtn} onPress={iniciarBuscaVisual} activeOpacity={0.7}>
              <Ionicons name="camera" size={20} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={styles.bodyContent}>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias</Text>
        </View>
        <CategoryList onSelect={(catId) => { dispararAnimacaoMola(); setCategoriaFiltro(catId); }} />

        <StatsRow />

        {loading && <ActivityIndicator size="small" color={colors.primaryDark} style={{ marginVertical: 8, alignSelf: "flex-start", marginLeft: 16 }} />}

        {apiError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color="#e8514a" />
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        )}

        {/* 🚀 PAINEL DE GESTÃO RÁPIDO (SÓ BOLSISTA/ADMIN) */}
        {(isAdmin || isBolsista) && (
          <View style={{ paddingHorizontal: 16, marginTop: 4, marginBottom: 16 }}>
            <View style={styles.sectionHeaderTitleGestao}>
              <Text style={styles.sectionTitle}>Área de Gestão</Text>
              <Text style={styles.sectionSubtitle}>Acesso restrito</Text>
            </View>
            <View style={styles.gestaoContainer}>
              {isBolsista && (
                <TouchableOpacity 
                  activeOpacity={0.8} 
                  style={styles.gestaoCard} 
                  onPress={() => navigation.navigate("painelBolsista")}
                >
                  <View style={[styles.gestaoIconBg, { backgroundColor: "rgba(31, 122, 81, 0.15)" }]}>
                    <Ionicons name="shield-checkmark" size={24} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gestaoTitle}>Painel Bolsista</Text>
                    <Text style={styles.gestaoDesc}>Confirmar e devolver itens</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>
              )}

              {isAdmin && (
                <>
                  {isBolsista && <View style={styles.gestaoDivider} />}
                  <TouchableOpacity 
                    activeOpacity={0.8} 
                    style={styles.gestaoCard} 
                    onPress={() => navigation.navigate("painelAdmin")}
                  >
                    <View style={[styles.gestaoIconBg, { backgroundColor: "rgba(179, 46, 41, 0.15)" }]}>
                      <Ionicons name="settings" size={24} color={colors.danger} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gestaoTitle}>Painel Admin</Text>
                      <Text style={styles.gestaoDesc}>Gestão completa do sistema</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

        {/* CARROSSEL 1: DESTAQUES */}
        <View style={styles.sectionHeaderTitle}>
          <Text style={styles.sectionTitle}>Destaques Recentes</Text>
          <Text style={styles.sectionSubtitle}>Últimas atualizações</Text>
        </View>
        {recentItems.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH + CARD_GAP} decelerationRate="fast" snapToAlignment="start" contentContainerStyle={styles.carouselContainer}>
            {recentItems.map((item, index) => renderCarouselCard(item, index))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}><Text style={styles.emptyText}>Nenhum item recente.</Text></View>
        )}

        {/* CARROSSEL 2: PERDIDOS */}
        <View style={styles.sectionHeaderTitle}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>Objetos Perdidos</Text>
          <Text style={styles.sectionSubtitle}>Comunidade procurando</Text>
        </View>
        {perdidos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH + CARD_GAP} decelerationRate="fast" snapToAlignment="start" contentContainerStyle={styles.carouselContainer}>
            {perdidos.map((item, index) => renderCarouselCard(item, index))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}><Text style={styles.emptyText}>Nenhum item perdido.</Text></View>
        )}

        {/* CARROSSEL 3: ENCONTRADOS */}
        <View style={styles.sectionHeaderTitle}>
          <Text style={[styles.sectionTitle, { color: colors.success }]}>Objetos Encontrados</Text>
          <Text style={styles.sectionSubtitle}>Aguardando o dono legítimo</Text>
        </View>
        {achados.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH + CARD_GAP} decelerationRate="fast" snapToAlignment="start" contentContainerStyle={styles.carouselContainer}>
            {achados.map((item, index) => renderCarouselCard(item, index))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}><Text style={styles.emptyText}>Nenhum item encontrado.</Text></View>
        )}

        {/* CARROSSEL 4: DEVOLVIDOS */}
        <View style={styles.sectionHeaderTitle}>
          <Text style={[styles.sectionTitle, { color: colors.info }]}>Devolvidos com Sucesso</Text>
          <Text style={styles.sectionSubtitle}>Casos solucionados</Text>
        </View>
        {devolvidos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH + CARD_GAP} decelerationRate="fast" snapToAlignment="start" contentContainerStyle={styles.carouselContainer}>
            {devolvidos.map((item, index) => renderCarouselCard(item, index))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}><Text style={styles.emptyText}>Nenhum item devolvido.</Text></View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, paddingBottom: 16 },
  headerContent: { paddingHorizontal: 20, marginTop: -20 },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 60, paddingTop: 20 },
  
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingHorizontal: 16 },
  sectionHeaderTitle: { marginBottom: 12, gap: 2, paddingHorizontal: 16, marginTop: 22 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.primaryDark, letterSpacing: -0.4 },
  sectionSubtitle: { fontSize: 12, color: colors.textMuted },
  viewAllText: { color: colors.primaryDark, fontWeight: "600", fontSize: 13 },

  carouselContainer: {
    paddingLeft: 16,  
    paddingRight: 24, 
    gap: CARD_GAP,
    paddingBottom: 12,
  },

  // 🔥 ESTILO FINAL DO CARD (UPGRADE ESTILO APPLE CARDBOARD)
  ifrnCard: {
    backgroundColor: colors.cardBg,
    width: CARD_WIDTH,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(11, 58, 74, 0.06)",
    shadowColor: "#0B3A4A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  ifrnCardImage: {
    width: "100%",
    height: 120, 
    borderRadius: 9,
    backgroundColor: "#D1E4EC",
    resizeMode: "cover",
  },
  ifrnCardBody: {
    paddingVertical: 10,
    gap: 2,
  },
  ifrnTitle: {
    fontSize: 15, 
    fontWeight: "800",
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  ifrnDescription: {
    fontSize: 12, 
    color: colors.textBody,
    lineHeight: 15,
    fontWeight: "500",
  },
  ifrnCategory: {
    fontSize: 9.5,
    fontWeight: "700",
    color: colors.textBody,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  ifrnMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderColor: "rgba(24, 95, 165, 0.12)",
    paddingTop: 10,
    marginTop: 4,
  },
  ifrnMetaTextContainer: {
    flex: 1,
    gap: 2,
  },
  ifrnLocation: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textDark,
    paddingRight: 6,
  },
  ifrnDate: {
    fontSize: 10.5,
    fontWeight: "600",
    color: colors.textMuted,
  },
  ifrnStatusBadge: {
    width: 24,
    height: 24,
    borderRadius: 6, 
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  
  errorContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff5f5", borderColor: "#e8514a", borderWidth: 1, borderRadius: 12, padding: 12, marginHorizontal: 16, marginBottom: 12, gap: 8 },
  errorText: { color: "#e8514a", fontSize: 12, flex: 1, fontWeight: "500" },
  emptyContainer: { alignItems: "center", paddingVertical: 16, backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(0,0,0,0.02)", width: CARD_WIDTH },
  emptyText: { color: colors.textLight, fontSize: 12, fontStyle: "italic" },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cameraBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },

  // Estilos da Gestão
  sectionHeaderTitleGestao: { marginBottom: 12, gap: 2 },
  gestaoContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gestaoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  gestaoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gestaoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primaryDark,
    marginBottom: 2,
  },
  gestaoDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  gestaoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
});