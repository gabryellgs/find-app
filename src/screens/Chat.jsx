import React, { useState } from "react";
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const conversas = [
  {
    id: 1,
    nome: "João Silva",
    ultimaMensagem: "Oi! Você encontrou a carteira?",
    hora: "14:32",
    naoLidas: 2,
    iniciais: "JS",
    avatarBg: "#e6f1fb",
    avatarColor: "#185fa5",
    online: true,
  },
  {
    id: 2,
    nome: "Maria Souza",
    ultimaMensagem: "Sim, está aqui comigo! Podemos nos encontrar amanhã?",
    hora: "13:10",
    naoLidas: 0,
    iniciais: "MS",
    avatarBg: "#e1f9ed",
    avatarColor: "#0a7a3e",
    online: false,
  },
  {
    id: 3,
    nome: "Carlos Mendes",
    ultimaMensagem: "Perfeito, obrigado!",
    hora: "Ontem",
    naoLidas: 0,
    iniciais: "CM",
    avatarBg: "#fdecea",
    avatarColor: "#b32e29",
    online: false,
  },
  {
    id: 4,
    nome: "Ana Paula",
    ultimaMensagem: "Achei seu celular no metrô, como faço para te entregar?",
    hora: "Ontem",
    naoLidas: 1,
    iniciais: "AP",
    avatarBg: "#f3e8ff",
    avatarColor: "#7c3aed",
    online: true,
  },
  {
    id: 5,
    nome: "Roberto Lima",
    ultimaMensagem: "Tudo bem, qualquer coisa me avisa.",
    hora: "Seg",
    naoLidas: 0,
    iniciais: "RL",
    avatarBg: "#fff7e6",
    avatarColor: "#b45309",
    online: false,
  },
];

export default function Chat({ navigation }) {
  const insets = useSafeAreaInsets();
  const [busca, setBusca] = useState("");

  const filtradas = conversas.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totalNaoLidas = conversas.reduce((acc, c) => acc + c.naoLidas, 0);

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
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="create-outline" size={20} color={colors.primaryDark} />
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

        {/* Lista */}
        {filtradas.length === 0 ? (
          <View style={styles.vazio}>
            <Ionicons name="chatbubbles-outline" size={40} color={colors.textLight} />
            <Text style={styles.vazioText}>Nenhuma conversa encontrada</Text>
          </View>
        ) : (
          filtradas.map((conversa, i) => (
            <TouchableOpacity
              key={conversa.id}
              style={[styles.card, i === filtradas.length - 1 && { marginBottom: 0 }]}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("chatConversa", {
                  nome: conversa.nome,
                  iniciais: conversa.iniciais,
                  avatarBg: conversa.avatarBg,
                  avatarColor: conversa.avatarColor,
                  online: conversa.online,
                })
              }
            >
              {/* Avatar */}
              <View style={styles.avatarWrap}>
                <View style={[styles.avatar, { backgroundColor: conversa.avatarBg }]}>
                  <Text style={[styles.avatarText, { color: conversa.avatarColor }]}>
                    {conversa.iniciais}
                  </Text>
                </View>
                {conversa.online && <View style={styles.onlineDot} />}
              </View>

              {/* Conteúdo */}
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.nome} numberOfLines={1}>{conversa.nome}</Text>
                  <Text style={[
                    styles.hora,
                    conversa.naoLidas > 0 && { color: colors.primaryDark, fontWeight: "700" },
                  ]}>
                    {conversa.hora}
                  </Text>
                </View>
                <View style={styles.cardBottom}>
                  <Text
                    style={[
                      styles.ultimaMensagem,
                      conversa.naoLidas > 0 && { color: colors.text, fontWeight: "500" },
                    ]}
                    numberOfLines={1}
                  >
                    {conversa.ultimaMensagem}
                  </Text>
                  {conversa.naoLidas > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{conversa.naoLidas}</Text>
                    </View>
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          ))
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
  onlineDot: {
    position: "absolute", bottom: 2, right: 2,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: "#0a7a3e",
    borderWidth: 2, borderColor: colors.surface,
  },

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
  vazioText: { fontSize: 14, color: colors.textLight },
});