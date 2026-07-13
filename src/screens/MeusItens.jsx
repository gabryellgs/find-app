import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { fetchMyItems, deleteItem } from "../services/api";
import Skeleton from "../components/ui/Skeleton";
import haptics from "../services/haptics";

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  bg: "#F5F7FB",
  surface: "#FFFFFF",
  text: "#0B0F1A",
  textMuted: "#5A6480",
  textLight: "#9AA3BB",
  border: "rgba(0, 30, 100, 0.08)",
  danger: "#B32E29",
  dangerBg: "#fdecea",
  success: "#1F7A51",
  successBg: "#edfaf4",
  info: "#185FA5",
  infoBg: "#e6f1fb",
};

const FILTROS = ["Todos", "Perdido", "Achado", "Devolvido"];

const STATUS_CONFIG = {
  perdido:   { label: "Perdido",   icon: "warning",          color: colors.danger,  bg: colors.dangerBg },
  achado:    { label: "Achado",    icon: "checkmark-circle", color: colors.success, bg: colors.successBg },
  devolvido: { label: "Devolvido", icon: "sync",             color: colors.info,    bg: colors.infoBg },
  confirmado:{ label: "Confirmado",icon: "shield-checkmark", color: colors.info,    bg: colors.infoBg },
};

function ItemCard({ item, onPress, onDelete }) {
  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.perdido;
  const data = item.data
    ? item.data.split("-").reverse().join("/")
    : "";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      {/* Indicador colorido lateral */}
      <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={11} color={cfg.color} />
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>{item.descricao}</Text>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={colors.textLight} />
            <Text style={styles.metaText} numberOfLines={1}>{item.local || "—"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={colors.textLight} />
            <Text style={styles.metaText}>{data}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="trash-outline" size={16} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function MeusItens({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState("Todos");

  const carregar = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await fetchMyItems({ page: 1, perPage: 50 });
      setItems(data?.results ?? []);
    } catch (e) {
      Alert.alert("Erro", e.message || "Não foi possível carregar seus itens.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) carregar();
  }, [isFocused, carregar]);

  const handleDelete = (item) => {
    Alert.alert(
      "Deletar item",
      `Tem certeza que deseja deletar "${item.titulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteItem(item.id);
              setItems((prev) => prev.filter((i) => i.id !== item.id));
              haptics.success();
            } catch (e) {
              haptics.error();
              Alert.alert("Erro", e.message);
            }
          },
        },
      ]
    );
  };

  const filtrados = filtro === "Todos"
    ? items
    : items.filter((i) => i.status === filtro.toLowerCase());

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Itens</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("cadastrar")}
        >
          <Ionicons name="add" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtroRow}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroBtn, filtro === f && styles.filtroBtnActive]}
            onPress={() => { haptics.tap(); setFiltro(f); }}
            activeOpacity={0.75}
          >
            <Text style={[styles.filtroText, filtro === f && styles.filtroTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contador */}
      <Text style={styles.counter}>
        {filtrados.length} {filtrados.length === 1 ? "item" : "itens"}
      </Text>

      {loading ? (
        <View style={styles.listContent}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.card, { padding: 14, gap: 8 }]}>
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="60%" height={15} />
                <Skeleton width="90%" height={12} />
                <Skeleton width="40%" height={11} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          onRefresh={() => carregar(true)}
          refreshing={refreshing}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => navigation.navigate("DetalheItem", { item, id: item.id })}
              onDelete={() => handleDelete(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={52} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Nenhum item cadastrado</Text>
              <Text style={styles.emptySubtitle}>
                Toque em + para registrar um objeto perdido ou achado
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate("cadastrar")}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.emptyBtnText}>Cadastrar item</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.primary,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16, fontWeight: "700",
    color: colors.primaryDark, letterSpacing: -0.3,
  },

  filtroRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  filtroBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 99, borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filtroBtnActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  filtroText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  filtroTextActive: { color: "#fff" },

  counter: {
    fontSize: 12, color: colors.textLight, fontWeight: "600",
    marginHorizontal: 16, marginBottom: 4,
  },

  listContent: { paddingHorizontal: 16, paddingTop: 4 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: colors.border,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardAccent: { width: 4, alignSelf: "stretch" },
  cardBody: { flex: 1, padding: 14, gap: 6 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text, flex: 1, paddingRight: 8 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
  },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  cardMeta: { flexDirection: "row", gap: 14, marginTop: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, color: colors.textLight, fontWeight: "500" },

  deleteBtn: {
    paddingHorizontal: 16, alignSelf: "stretch",
    alignItems: "center", justifyContent: "center",
  },

  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: colors.textMuted, fontWeight: "600" },

  emptyContainer: {
    alignItems: "center", paddingTop: 80, gap: 10,
  },
  emptyTitle: {
    fontSize: 17, fontWeight: "700", color: colors.primaryDark, marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13, color: colors.textLight, textAlign: "center",
    paddingHorizontal: 40, lineHeight: 19,
  },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: 16,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "700", color: colors.primaryDark },
});
