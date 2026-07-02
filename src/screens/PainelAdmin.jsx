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
  fetchAdminBolsistas,
  adminAdicionarBolsista,
  adminRemoverBolsista,
  fetchAdminRelatorio,
  fetchAdminLog,
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
};

const ABAS = ["Relatório", "Bolsistas", "Histórico"];

function StatCard({ label, value, icon, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BolsistaCard({ user, onRemover }) {
  const iniciais = (user.full_name || user.username || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={styles.bolsistaCard}>
      <View style={styles.bolsistaAvatar}>
        <Text style={styles.bolsistaIniciais}>{iniciais}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.bolsistaName}>{user.full_name || user.username}</Text>
        <Text style={styles.bolsistaEmail}>{user.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.removerBtn}
        onPress={() => onRemover(user)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="person-remove-outline" size={17} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

function LogCard({ log }) {
  const acaoIcon = {
    confirmou: "shield-checkmark-outline",
    devolveu: "checkmark-done-outline",
    editou: "pencil-outline",
    status_alterado: "swap-horizontal-outline",
  };
  const acaoCor = {
    confirmou: colors.info,
    devolveu: colors.success,
    editou: "#D97706",
    status_alterado: colors.textMuted,
  };

  const data = log.timestamp
    ? new Date(log.timestamp).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  const cor = acaoCor[log.acao] ?? colors.textMuted;
  const icon = acaoIcon[log.acao] ?? "information-circle-outline";

  return (
    <View style={styles.logCard}>
      <View style={[styles.logIcon, { backgroundColor: cor + "15" }]}>
        <Ionicons name={icon} size={18} color={cor} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.logAcao}>{log.acao_display}</Text>
        <Text style={styles.logItem}>
          {log.item ? log.item.titulo : "Item removido"}
        </Text>
        <Text style={styles.logBolsista}>
          Por: {log.bolsista ? log.bolsista.username : "—"}
        </Text>
        {log.observacao ? (
          <Text style={styles.logObs} numberOfLines={2}>{log.observacao}</Text>
        ) : null}
        <Text style={styles.logData}>{data}</Text>
      </View>
    </View>
  );
}

function ModalAdicionarBolsista({ visible, onClose, onConfirm }) {
  const [email, setEmail] = useState("");

  const handleConfirm = () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Erro", "Digite um e-mail válido.");
      return;
    }
    onConfirm(email.trim());
    setEmail("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Adicionar Bolsista</Text>
          <Text style={styles.modalSubtitle}>
            Digite o e-mail do usuário para adicioná-lo ao grupo de Bolsistas.
          </Text>
          <Text style={styles.fieldLabel}>E-mail do usuário</Text>
          <TextInput
            style={styles.fieldInput}
            value={email}
            onChangeText={setEmail}
            placeholder="usuario@email.com"
            placeholderTextColor={colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={onClose}>
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleConfirm}>
              <Text style={styles.modalBtnConfirmText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function PainelAdmin({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [aba, setAba] = useState("Relatório");
  const [relatorio, setRelatorio] = useState(null);
  const [bolsistas, setBolsistas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalAddBolsista, setModalAddBolsista] = useState(false);

  const carregar = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const [rData, bData, hData] = await Promise.all([
        fetchAdminRelatorio(),
        fetchAdminBolsistas(),
        fetchAdminLog(),
      ]);
      setRelatorio(rData?.data ?? null);
      setBolsistas(bData?.results ?? []);
      setHistorico(hData?.results ?? []);
    } catch (e) {
      Alert.alert("Acesso Negado", "Você não tem permissão de administrador.");
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) carregar();
  }, [isFocused, carregar]);

  const handleAdicionarBolsista = async (email) => {
    try {
      await adminAdicionarBolsista(email);
      setModalAddBolsista(false);
      Alert.alert("✅ Sucesso", "Bolsista adicionado com sucesso!");
      carregar();
    } catch (e) {
      Alert.alert("Erro", e.message || "Não foi possível adicionar o bolsista.");
    }
  };

  const handleRemoverBolsista = (user) => {
    Alert.alert(
      "Remover Bolsista",
      `Remover ${user.username} do grupo de Bolsistas?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await adminRemoverBolsista(user.id);
              Alert.alert("✅ Sucesso", "Bolsista removido.");
              carregar();
            } catch (e) {
              Alert.alert("Erro", e.message);
            }
          },
        },
      ]
    );
  };

  const renderConteudo = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
          <Text style={styles.loadingText}>Carregando painel...</Text>
        </View>
      );
    }

    if (aba === "Relatório") {
      return (
        <FlatList
          data={[]}
          ListHeaderComponent={
            <View style={{ gap: 12, paddingTop: 8 }}>
              <Text style={styles.sectionLabel}>Resumo Geral</Text>
              <View style={styles.statsGrid}>
                <StatCard label="Total" value={relatorio?.total ?? 0} icon="layers-outline" color={colors.primaryDark} />
                <StatCard label="Perdidos" value={relatorio?.por_status?.perdido ?? 0} icon="warning-outline" color={colors.danger} />
                <StatCard label="Achados" value={relatorio?.por_status?.achado ?? 0} icon="checkmark-circle-outline" color={colors.success} />
                <StatCard label="Devolvidos" value={relatorio?.por_status?.devolvido ?? 0} icon="sync-outline" color={colors.info} />
                <StatCard label="Confirmados" value={relatorio?.por_status?.confirmado ?? 0} icon="shield-checkmark-outline" color={colors.info} />
                <StatCard label="Pendentes" value={relatorio?.por_status?.pendente_confirmacao ?? 0} icon="time-outline" color="#D97706" />
              </View>

              {relatorio?.periodo && (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Período Analisado</Text>
                  <View style={styles.periodoCard}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primaryDark} />
                    <Text style={styles.periodoText}>
                      De {relatorio.periodo.inicio} até {relatorio.periodo.fim}
                    </Text>
                  </View>
                </>
              )}

              {relatorio?.por_categoria && Object.keys(relatorio.por_categoria).length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Por Categoria</Text>
                  <View style={styles.statsGrid}>
                    {Object.entries(relatorio.por_categoria).map(([catNome, catTotal]) => (
                      <StatCard
                        key={catNome}
                        label={catNome}
                        value={catTotal}
                        icon="pricetag-outline"
                        color="#6B7280"
                      />
                    ))}
                  </View>
                </>
              )}
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => carregar(true)} tintColor={colors.primaryDark} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          keyExtractor={() => "relatorio"}
        />
      );
    }

    if (aba === "Bolsistas") {
      return (
        <FlatList
          data={bolsistas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => carregar(true)} tintColor={colors.primaryDark} />}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.addBolsistaBtn}
              onPress={() => setModalAddBolsista(true)}
            >
              <Ionicons name="person-add-outline" size={18} color={colors.primaryDark} />
              <Text style={styles.addBolsistaBtnText}>Adicionar bolsista</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <BolsistaCard user={item} onRemover={handleRemoverBolsista} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={52} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Nenhum bolsista cadastrado</Text>
            </View>
          }
        />
      );
    }

    if (aba === "Histórico") {
      return (
        <FlatList
          data={historico}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => carregar(true)} tintColor={colors.primaryDark} />}
          renderItem={({ item }) => <LogCard log={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="list-outline" size={52} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Nenhuma ação registrada</Text>
            </View>
          }
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.headerTitle}>Painel Administrador</Text>
          <Text style={styles.headerSub}>Gestão do sistema Find</Text>
        </View>
        <View style={[styles.backBtn, { backgroundColor: "rgba(255,255,255,0.5)" }]}>
          <Ionicons name="shield-half-outline" size={18} color={colors.primaryDark} />
        </View>
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
          </TouchableOpacity>
        ))}
      </View>

      {renderConteudo()}

      <ModalAdicionarBolsista
        visible={modalAddBolsista}
        onClose={() => setModalAddBolsista(false)}
        onConfirm={handleAdicionarBolsista}
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
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primaryDark },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.textLight },
  tabTextActive: { color: colors.primaryDark },

  listContent: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: colors.primaryDark,
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4,
  },
  statsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
  },
  statCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, gap: 6,
    width: "47%",
    borderLeftWidth: 3,
    borderWidth: 0.5, borderColor: colors.border,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },

  periodoCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.surface, borderRadius: 12,
    padding: 14, borderWidth: 0.5, borderColor: colors.border,
  },
  periodoText: { fontSize: 13, fontWeight: "600", color: colors.text },

  addBolsistaBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 18,
    marginBottom: 14, justifyContent: "center",
  },
  addBolsistaBtnText: { fontSize: 14, fontWeight: "700", color: colors.primaryDark },

  bolsistaCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 0.5, borderColor: colors.border,
  },
  bolsistaAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(144,219,244,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  bolsistaIniciais: { fontSize: 15, fontWeight: "700", color: colors.primaryDark },
  bolsistaName: { fontSize: 14, fontWeight: "700", color: colors.text },
  bolsistaEmail: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  removerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.dangerBg,
    alignItems: "center", justifyContent: "center",
  },

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
  logAcao: { fontSize: 13, fontWeight: "700", color: colors.text },
  logItem: { fontSize: 13, color: colors.textMuted },
  logBolsista: { fontSize: 12, color: colors.textLight },
  logObs: { fontSize: 12, color: colors.textLight, lineHeight: 17 },
  logData: { fontSize: 11, color: colors.textLight, marginTop: 2 },

  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: colors.textMuted, fontWeight: "600" },
  emptyContainer: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.primaryDark, marginTop: 8 },

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
  modalSubtitle: { fontSize: 13, color: colors.textMuted },
  fieldLabel: {
    fontSize: 12, fontWeight: "700", color: colors.primaryDark,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: colors.bg, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.text,
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, alignItems: "center",
  },
  modalBtnCancelText: { fontSize: 14, fontWeight: "600", color: colors.textMuted },
  modalBtnConfirm: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: colors.primaryDark, alignItems: "center",
  },
  modalBtnConfirmText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
