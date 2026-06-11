import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { fetchChats } from "../services/api";

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  bg: "#F5F7FB",
  surface: "#FFFFFF",
  text: "#0B0F1A",
  textMuted: "#5A6480",
  textLight: "#9AA3BB",
  border: "rgba(0, 30, 100, 0.08)",
};

// Cores para avatares baseadas no id do usuário
const AVATAR_COLORS = [
  { bg: "#e6f1fb", color: "#185fa5" },
  { bg: "#e1f9ed", color: "#0a7a3e" },
  { bg: "#fdecea", color: "#b32e29" },
  { bg: "#f3e8ff", color: "#7c3aed" },
  { bg: "#fff7e6", color: "#b45309" },
  { bg: "#e0f2fe", color: "#0369a1" },
];

function getAvatarColor(id) {
  return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
}

function formatHora(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const agora = new Date();
    const diff = agora - date;
    const umDia = 24 * 60 * 60 * 1000;

    if (diff < umDia) {
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 2 * umDia) return "Ontem";
    if (diff < 7 * umDia) {
      const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      return dias[date.getDay()];
    }
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}

export default function Chat({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [busca, setBusca] = useState("");
  const [conversas, setConversas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchChats();
      if (data?.results) {
        setConversas(data.results);
      } else {
        setConversas([]);
      }
    } catch (e) {
      setError(e.message);
      setConversas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      carregarChats();
    }
  }, [isFocused, carregarChats]);

  const filtradas = conversas.filter((c) => {
    const nome = c.outro_usuario?.nome || c.outro_usuario?.username || "";
    const itemTitulo = c.item?.titulo || "";
    const q = busca.toLowerCase();
    return nome.toLowerCase().includes(q) || itemTitulo.toLowerCase().includes(q);
  });

  const totalNaoLidas = conversas.reduce((acc, c) => acc + (c.nao_lidas || 0), 0);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Mensagens</Text>
          {totalNaoLidas > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{totalNaoLidas}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={carregarChats}>
          <Ionicons name="refresh-outline" size={20} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Search */}
        <View style={styles.searchCard}>
          <Ionicons name="search-outline" size={16} color={colors.textLight} />
          <TextInput
            placeholder="Buscar conversa..."
            placeholderTextColor={colors.textLight}
            style={styles.searchInput}
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca("")}>
              <Ionicons name="close-circle" size={16} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.vazio}>
            <ActivityIndicator size="large" color={colors.primaryDark} />
            <Text style={styles.vazioText}>Carregando conversas...</Text>
          </View>
        )}

        {/* Error */}
        {error && !loading && (
          <View style={styles.vazio}>
            <Ionicons name="alert-circle-outline" size={40} color="#e8514a" />
            <Text style={[styles.vazioText, { color: "#e8514a" }]}>{error}</Text>
            <TouchableOpacity onPress={carregarChats} style={styles.retryBtn}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista */}
        {!loading && !error && filtradas.length === 0 ? (
          <View style={styles.vazio}>
            <Ionicons name="chatbubbles-outline" size={40} color={colors.textLight} />
            <Text style={styles.vazioText}>
              {conversas.length === 0
                ? "Nenhuma conversa ainda"
                : "Nenhuma conversa encontrada"}
            </Text>
            <Text style={[styles.vazioText, { fontSize: 12, marginTop: 4 }]}>
              Inicie um chat pela página de detalhes de um item
            </Text>
          </View>
        ) : (
          !loading && !error && filtradas.map((conversa, i) => {
            const outro = conversa.outro_usuario || {};
            const avatarStyle = getAvatarColor(outro.id);
            const iniciais = outro.iniciais || (outro.nome || "??").substring(0, 2).toUpperCase();
            const naoLidas = conversa.nao_lidas || 0;

            return (
              <TouchableOpacity
                key={conversa.id}
                style={[styles.card, i === filtradas.length - 1 && { marginBottom: 0 }]}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("chatConversa", {
                    chatId: conversa.id,
                    nome: outro.nome || outro.username,
                    iniciais: iniciais,
                    avatarBg: avatarStyle.bg,
                    avatarColor: avatarStyle.color,
                    itemTitulo: conversa.item?.titulo || "",
                  })
                }
              >
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                  <View style={[styles.avatar, { backgroundColor: avatarStyle.bg }]}>
                    <Text style={[styles.avatarText, { color: avatarStyle.color }]}>
                      {iniciais}
                    </Text>
                  </View>
                </View>

                {/* Conteúdo */}
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.nome} numberOfLines={1}>{outro.nome || outro.username}</Text>
                    <Text style={[
                      styles.hora,
                      naoLidas > 0 && { color: colors.primaryDark, fontWeight: "700" },
                    ]}>
                      {formatHora(conversa.ultima_hora || conversa.atualizado_em)}
                    </Text>
                  </View>
                  <View style={styles.cardBottom}>
                    <Text
                      style={[
                        styles.ultimaMensagem,
                        naoLidas > 0 && { color: colors.text, fontWeight: "500" },
                      ]}
                      numberOfLines={1}
                    >
                      {conversa.ultima_mensagem || conversa.item?.titulo || "Sem mensagens"}
                    </Text>
                    {naoLidas > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{naoLidas}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.primary,
    paddingBottom: 28, paddingHorizontal: 20,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.primaryDark },
  headerBadge: {
    backgroundColor: colors.primaryDark,
    borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2,
  },
  headerBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },

  body: { flex: 1, marginTop: -16 },
  bodyContent: { paddingHorizontal: 16, paddingTop: 8 },

  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 16, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 0.5, borderColor: colors.border,
    marginBottom: 20, marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 0.5, borderColor: colors.border,
    marginBottom: 10,
  },

  avatarWrap: { position: "relative" },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontWeight: "700" },

  cardBody: { flex: 1, minWidth: 0 },
  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  nome: { fontSize: 14, fontWeight: "600", color: colors.text, flex: 1 },
  hora: { fontSize: 11, color: colors.textLight, marginLeft: 8 },

  cardBottom: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  ultimaMensagem: { fontSize: 13, color: colors.textMuted, flex: 1 },
  badge: {
    backgroundColor: colors.primaryDark,
    borderRadius: 999, minWidth: 20, height: 20,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 5, marginLeft: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },

  vazio: {
    alignItems: "center", justifyContent: "center",
    paddingTop: 60, gap: 12,
  },
  vazioText: { fontSize: 14, color: colors.textLight, textAlign: "center" },
  retryBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: colors.primary, borderRadius: 12,
  },
  retryText: { fontSize: 13, fontWeight: "700", color: colors.primaryDark },
});