import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, Alert,
  RefreshControl, TextInput, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import {
  fetchBolsistaPendentes,
  bolsistaConfirmar,
  bolsistaDevolver,
  fetchBolsistaMeuLog,
} from "../services/api";

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
  warning: "#D97706",
  warningBg: "#fffbeb",
};

const ABAS = ["Pendentes", "Meu Histórico"];

function PendenteCard({ item, onConfirmar, onDevolver }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="cube-outline" size={16} color={colors.primaryDark} />
          <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.warningBg }]}>
          <Text style={[styles.badgeText, { color: colors.warning }]}>
            {item.status === "achado" ? "ACHADO" : "PENDENTE"}
          </Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>{item.descricao}</Text>

      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={12} color={colors.textLight} />
        <Text style={styles.metaText}>{item.local || "—"}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Ionicons name="person-outline" size={12} color={colors.textLight} />
        <Text style={styles.metaText}>{item.usuario}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.info }]}
          onPress={() => onConfirmar(item)}
        >
          <Ionicons name="shield-checkmark-outline" size={15} color={colors.info} />
          <Text style={[styles.actionBtnText, { color: colors.info }]}>Confirmar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.success }]}
          onPress={() => onDevolver(item)}
        >
          <Ionicons name="checkmark-done-outline" size={15} color={colors.success} />
          <Text style={[styles.actionBtnText, { color: colors.success }]}>Devolver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LogCard({ log }) {
  const isConfirmou = log.acao === "confirmou";
  const cor = isConfirmou ? colors.info : colors.success;
  const bg = isConfirmou ? colors.infoBg : colors.successBg;
  const icon = isConfirmou ? "shield-checkmark-outline" : "checkmark-done-outline";

  const data = log.timestamp
    ? new Date(log.timestamp).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  return (
    <View style={styles.logCard}>
      <View style={[styles.logIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={cor} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.logAcao}>{log.acao_display}</Text>
        <Text style={styles.logItem} numberOfLines={1}>
          {log.item_titulo || "Item removido"}
        </Text>
        {log.observacao ? (
          <Text style={styles.logObs} numberOfLines={2}>{log.observacao}</Text>
        ) : null}
        <Text style={styles.logData}>{data}</Text>
      </View>
    </View>
  );
}

function ModalDevolucao({ visible, item, onClose, onConfirm }) {
  const [nome, setNome] = useState("");
  const [obs, setObs] = useState("");

  const handleConfirm = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "O nome do recebedor é obrigatório.");
      return;
    }
    onConfirm(nome.trim(), obs.trim());
    setNome("");
    setObs("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Registrar Devolução</Text>
          {item && (
            <Text style={styles.modalSubtitle}>{item.titulo}</Text>
          )}

          <Text style={styles.fieldLabel}>Nome do recebedor *</Text>
          <TextInput
            style={styles.fieldInput}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome completo de quem retirou"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.fieldLabel}>Observação (opcional)</Text>
          <TextInput
            style={[styles.fieldInput, { height: 80, textAlignVertical: "top" }]}
            value={obs}
            onChangeText={setObs}
            placeholder="Alguma observação adicional..."
            placeholderTextColor={colors.textLight}
            multiline
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={onClose}>
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleConfirm}>
              <Text style={styles.modalBtnConfirmText}>Confirmar devolução</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function PainelBolsista({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [aba, setAba] = useState("Pendentes");
  const [pendentes, setPendentes] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalDevolucao, setModalDevolucao] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const carregar = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const [pData, hData] = await Promise.all([
        fetchBolsistaPendentes(),
        fetchBolsistaMeuLog(),
      ]);
      setPendentes(pData?.results ?? []);
      setHistorico(hData?.results ?? []);
    } catch (e) {
      Alert.alert("Erro", e.message || "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) carregar();
  }, [isFocused, carregar]);

  const handleConfirmar = async (item) => {
    Alert.alert(
      "Confirmar item",
      `Confirmar "${item.titulo}" fisicamente no balcão?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await bolsistaConfirmar(item.id);
              Alert.alert("✅ Sucesso", "Item confirmado no balcão!");
              carregar();
            } catch (e) {
              Alert.alert("Erro", e.message);
            }
          },
        },
      ]
    );
  };

  const handleDevolverPress = (item) => {
    setItemSelecionado(item);
    setModalDevolucao(true);
  };

  const handleDevolverConfirm = async (nome, obs) => {
    try {
      await bolsistaDevolver(itemSelecionado.id, nome, obs);
      setModalDevolucao(false);
      setItemSelecionado(null);
      Alert.alert("✅ Sucesso", `Devolução registrada para ${nome}!`);
      carregar();
    } catch (e) {
      Alert.alert("Erro", e.message);
    }
  };

  const dadosAba = aba === "Pendentes" ? pendentes : historico;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.headerTitle}>Painel Bolsista</Text>
          <Text style={styles.headerSub}>Gestão de itens achados</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => carregar(true)}>
          <Ionicons name="refresh-outline" size={18} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Abas */}
      <View style={styles.tabRow}>
        {ABAS.map((a) => (
          <TouchableOpacity
            key={a}
            style={[styles.tab, aba === a && styles.tabActive]}
            onPress={() => setAba(a)}
          >
            <Text style={[styles.tabText, aba === a && styles.tabTextActive]}>{a}</Text>
            {a === "Pendentes" && pendentes.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{pendentes.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      ) : (
        <FlatList
          data={dadosAba}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => carregar(true)} tintColor={colors.primaryDark} />
          }
          renderItem={({ item }) =>
            aba === "Pendentes" ? (
              <PendenteCard
                item={item}
                onConfirmar={handleConfirmar}
                onDevolver={handleDevolverPress}
              />
            ) : (
              <LogCard log={item} />
            )
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={aba === "Pendentes" ? "checkmark-done-circle-outline" : "list-outline"}
                size={52}
                color={colors.textLight}
              />
              <Text style={styles.emptyTitle}>
                {aba === "Pendentes" ? "Nenhum item pendente" : "Nenhuma ação registrada"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {aba === "Pendentes"
                  ? "Todos os itens estão em dia! 🎉"
                  : "Suas ações aparecerão aqui."}
              </Text>
            </View>
          }
        />
      )}

      <ModalDevolucao
        visible={modalDevolucao}
        item={itemSelecionado}
        onClose={() => { setModalDevolucao(false); setItemSelecionado(null); }}
        onConfirm={handleDevolverConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.primary,
    paddingBottom: 20, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.primaryDark, letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: "rgba(11,58,74,0.6)", marginTop: 1 },

  tabRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 14, alignItems: "center",
    flexDirection: "row", justifyContent: "center", gap: 6,
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primaryDark },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.textLight },
  tabTextActive: { color: colors.primaryDark },
  tabBadge: {
    backgroundColor: colors.danger, borderRadius: 99,
    minWidth: 18, height: 18, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 5,
  },
  tabBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },

  listContent: { paddingHorizontal: 16, paddingTop: 16 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16, padding: 16, marginBottom: 12,
    gap: 10, borderWidth: 0.5, borderColor: colors.border,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text, flex: 1 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 99, alignItems: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "700" },
  cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, color: colors.textLight },
  metaDot: { fontSize: 12, color: colors.textLight },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  actionBtnText: { fontSize: 13, fontWeight: "700" },

  logCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    flexDirection: "row", gap: 12, alignItems: "flex-start",
    borderWidth: 0.5, borderColor: colors.border,
  },
  logIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  logAcao: { fontSize: 14, fontWeight: "700", color: colors.text },
  logItem: { fontSize: 13, color: colors.textMuted },
  logObs: { fontSize: 12, color: colors.textLight, lineHeight: 17 },
  logData: { fontSize: 11, color: colors.textLight, marginTop: 2 },

  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: colors.textMuted, fontWeight: "600" },
  emptyContainer: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.primaryDark, marginTop: 8 },
  emptySubtitle: { fontSize: 13, color: colors.textLight, textAlign: "center" },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.primaryDark },
  modalSubtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: colors.primaryDark, textTransform: "uppercase", letterSpacing: 0.5 },
  fieldInput: {
    backgroundColor: colors.bg, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.text,
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    alignItems: "center",
  },
  modalBtnCancelText: { fontSize: 14, fontWeight: "600", color: colors.textMuted },
  modalBtnConfirm: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: colors.primaryDark, alignItems: "center",
  },
  modalBtnConfirmText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
