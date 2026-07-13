import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Animated, ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { fetchNotificacoes, marcarNotificacaoLida, marcarTodasLidas } from "../services/api";

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  textDark: "#0F172A",
  textLight: "#64748B",
  border: "rgba(0, 30, 100, 0.08)",
  danger: "#B32E29",
  success: "#1F7A51",
  info: "#185FA5",
};

const ICON_MAP = {
  "bi-bell-fill":            { icon: "notifications-outline",       cor: "#6366f1" },
  "bi-chat-dots-fill":       { icon: "chatbubbles-outline",         cor: "#3B82F6" },
  "bi-check-circle-fill":    { icon: "checkmark-circle-outline",    cor: "#10B981" },
  "bi-exclamation-triangle": { icon: "warning-outline",             cor: colors.danger },
  "bi-arrow-repeat":         { icon: "sync-outline",                cor: colors.info },
  "bi-person-fill":          { icon: "person-outline",              cor: colors.primaryDark },
};

function resolveIcon(iconeStr) {
  return ICON_MAP[iconeStr] ?? { icon: "notifications-outline", cor: "#6366f1" };
}

function formatTempo(isoString) {
  if (!isoString) return "";
  try {
    const now = new Date();
    const d = new Date(isoString);
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Agora";
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Há ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return "Ontem";
    return `Há ${diffD} dias`;
  } catch {
    return "";
  }
}

function AnimatedCard({ item, index, onPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 350,
        delay: index * 70, useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0, duration: 400,
        delay: index * 70, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const { icon, cor } = resolveIcon(item.icone);
  const naoLida = !item.lida;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
      <TouchableOpacity
        style={[styles.card, naoLida && styles.cardUnread]}
        activeOpacity={0.7}
        onPress={() => onPress(item)}
      >
        {naoLida && <View style={styles.unreadDot} />}
        <View style={[styles.iconContainer, { backgroundColor: cor + "18" }]}>
          <Ionicons name={icon} size={22} color={cor} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.cardHeader}>
            <Text style={[styles.titulo, naoLida && { color: colors.primaryDark }]} numberOfLines={1}>
              {item.titulo}
            </Text>
            <Text style={styles.tempo}>{formatTempo(item.criado_em)}</Text>
          </View>
          <Text style={styles.descricao}>{item.mensagem}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Notificacoes() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usandoMock, setUsandoMock] = useState(false);

  const carregar = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await fetchNotificacoes();
      setNotificacoes(data?.results ?? []);
      setUsandoMock(false);
    } catch {
      // Fallback com dados mock se API não disponível
      setUsandoMock(true);
      setNotificacoes([
        {
          id: "1", lida: false,
          icone: "bi-chat-dots-fill",
          titulo: "Nova mensagem no Chat",
          mensagem: "Alguém enviou uma mensagem sobre um de seus itens.",
          criado_em: new Date(Date.now() - 5 * 60000).toISOString(),
          link: "/chats/",
        },
        {
          id: "2", lida: true,
          icone: "bi-check-circle-fill",
          titulo: "Item Devolvido! 🎉",
          mensagem: "Parabéns! Um item foi marcado como devolvido ao dono.",
          criado_em: new Date(Date.now() - 60 * 60000 * 24).toISOString(),
          link: null,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) carregar();
  }, [isFocused, carregar]);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const handleNotificacao = async (item) => {
    // Marca como lida se ainda não estiver
    if (!item.lida && !usandoMock) {
      try {
        await marcarNotificacaoLida(item.id);
        setNotificacoes((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, lida: true } : n))
        );
      } catch {}
    }
    // Navega se tiver link
    if (item.link?.includes("chats")) {
      navigation.navigate("main", { screen: "Chat" });
    }
  };

  const handleMarcarTodas = async () => {
    if (usandoMock) return;
    try {
      await marcarTodasLidas();
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    } catch {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.6}>
          <Ionicons name="chevron-back" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notificações {naoLidas > 0 ? `(${naoLidas})` : ""}
        </Text>
        {naoLidas > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleMarcarTodas} activeOpacity={0.6}>
            <Ionicons name="checkmark-done-outline" size={20} color={colors.primaryDark} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
        </View>
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <AnimatedCard item={item} index={index} onPress={handleNotificacao} />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => carregar(true)} tintColor={colors.primaryDark} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>Nenhuma notificação por enquanto.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20, paddingHorizontal: 12,
    backgroundColor: colors.primary,
    zIndex: 10, elevation: 5,
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingHorizontal: 16, paddingTop: 16 },
  card: {
    flexDirection: "row", backgroundColor: colors.surface,
    padding: 16, borderRadius: 16, marginBottom: 10,
    alignItems: "center",
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    borderWidth: 0.5, borderColor: colors.border,
    position: "relative",
  },
  cardUnread: {
    borderColor: "rgba(144,219,244,0.5)",
    backgroundColor: "#f0fbff",
  },
  unreadDot: {
    position: "absolute", top: 12, right: 12,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primaryDark,
  },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  contentContainer: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, alignItems: "center" },
  titulo: { fontSize: 14, fontWeight: "700", color: colors.textDark, flex: 1, paddingRight: 8 },
  tempo: { fontSize: 11, color: colors.textLight, fontWeight: "500" },
  descricao: { fontSize: 13, color: colors.textLight, lineHeight: 18 },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 120 },
  emptyText: { marginTop: 12, fontSize: 14, color: colors.textLight, fontStyle: "italic" },
});