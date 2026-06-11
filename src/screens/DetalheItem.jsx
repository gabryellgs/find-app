import React, { useEffect, useState } from "react";
import {
  View, Text, Image, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchItemDetail, startChat, deleteItem, changeItemStatus } from "../services/api";
import auth from "../services/auth";

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  bg: "#EBF5FB",
  surface: "#FFFFFF",
  textDark: "#0B3A4A",
  textMuted: "#475569",
  textLight: "#94A3B8",
  borderLight: "rgba(15, 23, 42, 0.08)",
  danger: "#B32E29",
  success: "#1F7A51",
  info: "#185FA5",
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=800&auto=format&fit=crop";

function formatDate(raw) {
  if (!raw) return "";
  if (typeof raw === "string" && raw.includes("-")) {
    return raw.split("-").reverse().join("/");
  }
  return raw;
}

export default function DetalheItem({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { item: itemParam, id } = route.params ?? {};
  const [itemDetail, setItemDetail] = useState(itemParam ?? null);
  const [loading, setLoading] = useState(!itemParam);
  const [currentUser, setCurrentUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Carrega o usuário atual
    auth.getUser().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!itemDetail && id) {
      const loadItem = async () => {
        try {
          setLoading(true);
          const data = await fetchItemDetail(id);
          setItemDetail(data);
        } catch (error) {
          console.warn("Erro ao buscar detalhe do item:", error.message);
        } finally {
          setLoading(false);
        }
      };
      loadItem();
    }
  }, [id, itemDetail]);

  const currentItem = itemDetail;

  // Mapeia os campos da API
  const titulo = currentItem?.titulo || currentItem?.title || "Sem título";
  const descricao = currentItem?.descricao || currentItem?.description || "Descrição não disponível.";
  const local = currentItem?.local || currentItem?.location || "Local não informado";
  const imagem = currentItem?.imagem || currentItem?.photo || currentItem?.photo_url || null;
  const status = currentItem?.status || "indefinido";
  const statusDisplay = currentItem?.status_display || status;
  const rawData = currentItem?.data || currentItem?.date || currentItem?.criado_em || "";
  const dataFormatada = formatDate(rawData);
  const categoria = currentItem?.categoria || null;
  const usuario = currentItem?.usuario || "";
  const itemId = currentItem?.id || id;

  // Determina se o usuário logado é o dono do item
  const isOwner = currentUser?.username === usuario;

  // Cor do status
  let statusColor = colors.success;
  let statusIcon = "checkmark-circle";
  const statusLower = status.toLowerCase();
  if (statusLower === "perdido") {
    statusColor = colors.danger;
    statusIcon = "warning";
  } else if (statusLower === "devolvido") {
    statusColor = colors.info;
    statusIcon = "sync";
  }

  // Ações
  const handleChat = async () => {
    if (!itemId) return;
    try {
      setActionLoading(true);
      const data = await startChat(itemId);
      if (data?.ok && data?.data) {
        navigation.navigate("chatConversa", {
          chatId: data.data.id,
          nome: usuario,
          iniciais: usuario.substring(0, 2).toUpperCase(),
          avatarBg: "#e6f1fb",
          avatarColor: "#185fa5",
          itemTitulo: titulo,
        });
      } else {
        Alert.alert("Erro", data?.detail || "Não foi possível iniciar o chat.");
      }
    } catch (e) {
      Alert.alert("Erro", e.message || "Não foi possível iniciar o chat.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Deletar item", "Tem certeza que deseja deletar este item?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: async () => {
          try {
            setActionLoading(true);
            await deleteItem(itemId);
            Alert.alert("Sucesso", "Item deletado.", [
              { text: "Ok", onPress: () => navigation.goBack() },
            ]);
          } catch (e) {
            Alert.alert("Erro", e.message);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleChangeStatus = (novoStatus) => {
    const labels = { perdido: "perdido", achado: "encontrado", devolvido: "devolvido" };
    Alert.alert(
      "Alterar status",
      `Marcar item como ${labels[novoStatus]}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setActionLoading(true);
              const data = await changeItemStatus(itemId, novoStatus);
              if (data?.ok && data?.data) {
                setItemDetail(data.data);
              }
              Alert.alert("Sucesso", `Item marcado como ${labels[novoStatus]}!`);
            } catch (e) {
              Alert.alert("Erro", e.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !currentItem) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
        <ActivityIndicator size="large" color={colors.primaryDark} />
        <Text style={{ color: colors.textDark, fontWeight: "600", marginTop: 12 }}>
          Carregando item...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primaryDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalhes do objeto</Text>

        {isOwner ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      >
        {/* Imagem */}
        <View style={styles.heroCard}>
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.detailImage} />
          ) : (
            <View style={styles.largeIconContainer}>
              <Ionicons name="cube-outline" size={42} color={colors.primaryDark} />
            </View>
          )}
        </View>

        <View style={styles.contentPadding}>
          {/* Status + Data */}
          <View style={styles.metaRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
              <Ionicons name={statusIcon} size={14} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusDisplay}
              </Text>
            </View>
            <Text style={styles.timeText}>{dataFormatada}</Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>{titulo}</Text>

          {/* Categoria */}
          {categoria && (
            <View style={styles.categoryBadge}>
              <Ionicons name="pricetag-outline" size={12} color={colors.info} />
              <Text style={styles.categoryText}>{categoria}</Text>
            </View>
          )}

          {/* Publicado por */}
          <View style={styles.userRow}>
            <Ionicons name="person-circle-outline" size={16} color={colors.textMuted} />
            <Text style={styles.userText}>Publicado por {usuario}</Text>
          </View>

          {/* Local */}
          <Text style={styles.sectionLabel}>Local do registro</Text>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={16} color={colors.primaryDark} />
            <Text style={styles.infoText}>{local}</Text>
          </View>

          {/* Descrição */}
          <Text style={styles.sectionLabel}>Descrição</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{descricao}</Text>
          </View>

          {/* Ações do dono */}
          {isOwner && (
            <>
              <Text style={styles.sectionLabel}>Alterar status</Text>
              <View style={styles.statusActions}>
                {statusLower !== "perdido" && (
                  <TouchableOpacity
                    style={[styles.statusActionBtn, { borderColor: colors.danger }]}
                    onPress={() => handleChangeStatus("perdido")}
                    disabled={actionLoading}
                  >
                    <Ionicons name="warning" size={14} color={colors.danger} />
                    <Text style={[styles.statusActionText, { color: colors.danger }]}>Perdido</Text>
                  </TouchableOpacity>
                )}
                {statusLower !== "achado" && (
                  <TouchableOpacity
                    style={[styles.statusActionBtn, { borderColor: colors.success }]}
                    onPress={() => handleChangeStatus("achado")}
                    disabled={actionLoading}
                  >
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={[styles.statusActionText, { color: colors.success }]}>Achado</Text>
                  </TouchableOpacity>
                )}
                {statusLower !== "devolvido" && (
                  <TouchableOpacity
                    style={[styles.statusActionBtn, { borderColor: colors.info }]}
                    onPress={() => handleChangeStatus("devolvido")}
                    disabled={actionLoading}
                  >
                    <Ionicons name="sync" size={14} color={colors.info} />
                    <Text style={[styles.statusActionText, { color: colors.info }]}>Devolvido</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Botão de contato (para outros usuários) */}
          {!isOwner && (
            <TouchableOpacity
              style={[styles.actionBtn, actionLoading && { opacity: 0.6 }]}
              activeOpacity={0.85}
              onPress={handleChat}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={colors.primaryDark} />
              ) : (
                <>
                  <Ionicons name="chatbubbles" size={18} color={colors.primaryDark} />
                  <Text style={styles.actionBtnText}>Entrar em contato</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
    elevation: 6,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    color: colors.primaryDark,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  body: { flex: 1 },
  contentPadding: { paddingHorizontal: 16, paddingTop: 16 },
  heroCard: {
    height: 260,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  detailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  largeIconContainer: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: "rgba(144, 219, 244, 0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textLight,
  },
  title: {
    fontSize: 22,
    color: colors.textDark,
    fontWeight: "800",
    lineHeight: 29,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: "rgba(24, 95, 165, 0.08)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.info,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  userText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
  },
  sectionLabel: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: "600",
  },
  descriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  statusActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  statusActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  statusActionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  actionBtn: {
    marginTop: 28,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primaryDark,
  },
});
