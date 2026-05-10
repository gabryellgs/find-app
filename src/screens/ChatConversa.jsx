import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, TextInput, KeyboardAvoidingView,
  Platform,
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

const mensagensIniciais = [
  { id: 1, meu: false, texto: "Oi! Você encontrou a carteira?", hora: "14:28" },
  { id: 2, meu: true,  texto: "Sim! Achei aqui perto da Av. Paulista.", hora: "14:29" },
  { id: 3, meu: false, texto: "Que alívio! Como posso recuperar?", hora: "14:30" },
  { id: 4, meu: true,  texto: "Podemos nos encontrar amanhã de manhã?", hora: "14:31" },
  { id: 5, meu: false, texto: "Oi! Você encontrou a carteira?", hora: "14:32" },
];

export default function ChatConversa({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const { nome, iniciais, avatarBg, avatarColor, online } = route.params ?? {
    nome: "João Silva",
    iniciais: "JS",
    avatarBg: "#e6f1fb",
    avatarColor: "#185fa5",
    online: true,
  };

  const [mensagens, setMensagens] = useState(mensagensIniciais);
  const [texto, setTexto] = useState("");

  function enviar() {
    if (!texto.trim()) return;
    const nova = {
      id: Date.now(),
      meu: true,
      texto: texto.trim(),
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMensagens((prev) => [...prev, nova]);
    setTexto("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primaryDark} />
        </TouchableOpacity>

        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[styles.avatarText, { color: avatarColor }]}>{iniciais}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerNome}>{nome}</Text>
          <Text style={styles.headerStatus}>
            {online ? "● Online agora" : "● Offline"}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={18} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Mensagens */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.body}
          contentContainerStyle={[styles.bodyContent, { paddingBottom: 12 }]}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        >
          {mensagens.map((msg, i) => {
            const mostrarHora =
              i === mensagens.length - 1 ||
              mensagens[i + 1]?.meu !== msg.meu;

            return (
              <View
                key={msg.id}
                style={[
                  styles.msgWrap,
                  msg.meu ? styles.msgWrapMeu : styles.msgWrapDele,
                ]}
              >
                <View style={[styles.bubble, msg.meu ? styles.bubbleMeu : styles.bubbleDele]}>
                  <Text style={[styles.bubbleText, msg.meu && styles.bubbleTextMeu]}>
                    {msg.texto}
                  </Text>
                </View>
                {mostrarHora && (
                  <Text style={[styles.hora, msg.meu && styles.horaMeu]}>
                    {msg.hora}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Digite uma mensagem..."
              placeholderTextColor={colors.textLight}
              value={texto}
              onChangeText={setTexto}
              multiline
            />
            <TouchableOpacity
              onPress={enviar}
              style={[styles.sendBtn, texto.trim() && styles.sendBtnActive]}
              activeOpacity={0.8}
            >
              <Ionicons
                name="send"
                size={18}
                color={texto.trim() ? colors.primaryDark : colors.textLight}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.primary,
    paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 13, fontWeight: "700" },
  headerInfo: { flex: 1 },
  headerNome: { fontSize: 15, fontWeight: "700", color: colors.primaryDark },
  headerStatus: { fontSize: 11, color: colors.primaryDark, opacity: 0.7, marginTop: 1 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 16, paddingTop: 16 },

  msgWrap: { marginBottom: 2, maxWidth: "80%" },
  msgWrapMeu: { alignSelf: "flex-end", alignItems: "flex-end" },
  msgWrapDele: { alignSelf: "flex-start", alignItems: "flex-start" },

  bubble: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMeu: {
    backgroundColor: colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  bubbleDele: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 0.5, borderColor: colors.border,
  },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  bubbleTextMeu: { color: "#fff" },

  hora: { fontSize: 10, color: colors.textLight, marginTop: 4, marginHorizontal: 4 },
  horaMeu: { textAlign: "right" },

  inputBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0.5, borderTopColor: colors.border,
    paddingHorizontal: 16, paddingTop: 10,
  },
  inputCard: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    backgroundColor: colors.bg,
    borderRadius: 24, borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  input: { flex: 1, fontSize: 14, color: colors.text, maxHeight: 100 },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.bg,
  },
  sendBtnActive: { backgroundColor: colors.primary },
});