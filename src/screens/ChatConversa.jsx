import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchChatMessages, sendChatMessage, API_BASE_URL } from "../services/api";
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
};

function formatHora(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatConversa({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const {
    chatId,
    nome = "Usuário",
    iniciais = "??",
    avatarBg = "#e6f1fb",
    avatarColor = "#185fa5",
    itemTitulo = "",
  } = route.params ?? {};

  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatStatus, setChatStatus] = useState("ativo");
  const [error, setError] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const pollingRef = useRef(null);
  const typingResetRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const wsRef = useRef(null);

  const carregarMensagens = useCallback(async () => {
    if (!chatId) return;
    try {
      setError(null);
      const data = await fetchChatMessages(chatId);
      if (data?.results) {
        setMensagens(data.results);
      }
      if (data?.status) {
        setChatStatus(data.status);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  // WebSocket e carga inicial
  useEffect(() => {
    carregarMensagens();

    if (!chatId) return;

    const wsProtocol = API_BASE_URL.startsWith("https") ? "wss" : "ws";
    const wsUrl = `${API_BASE_URL.replace(/^https?/, wsProtocol)}/ws/chat/${chatId}/`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected to", wsUrl);
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.type === "typing") {
          setOtherTyping(true);
          clearTimeout(typingResetRef.current);
          typingResetRef.current = setTimeout(() => setOtherTyping(false), 3000);
          return;
        }

        if (data.message && data.id) {
          setOtherTyping(false);
          clearTimeout(typingResetRef.current);
          // Adiciona apenas se não for de quem enviou (is_me) e a API já não adicionou
          // Ou simplesmente adiciona no estado e tira do enviar()
          setMensagens((prev) => {
             // previne duplicação
             if (prev.find(m => m.id === data.id)) return prev;
             
             // O WebSocket devolve is_me relativo ao servidor, vamos adaptar.
             // Para simplificar, a API REST ainda vai enviar as minhas mensagens localmente,
             // então aqui precisamos garantir que não duplique.
             return [...prev, data];
          });
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e.message);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      clearTimeout(typingResetRef.current);
      ws.close();
    };
  }, [carregarMensagens, chatId]);

  /** Avisa o outro participante que estou digitando (no máximo 1x a cada 2s). */
  function notificarDigitando() {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const agora = Date.now();
    if (agora - lastTypingSentRef.current < 2000) return;
    lastTypingSentRef.current = agora;
    wsRef.current.send(JSON.stringify({ type: "typing" }));
  }

  async function enviar() {
    if (!texto.trim() || sending || !chatId) return;

    // Se o socket estiver aberto, envia via socket. Senão, fallback via API.
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
       wsRef.current.send(JSON.stringify({ message: texto.trim() }));
       setTexto("");
       haptics.tap();
    } else {
      try {
        setSending(true);
        const data = await sendChatMessage(chatId, texto.trim());
        if (data?.ok && data?.data) {
          setMensagens((prev) => [...prev, data.data]);
        }
        setTexto("");
        haptics.tap();
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (e) {
        haptics.error();
        console.log("Erro ao enviar via API:", e.message);
      } finally {
        setSending(false);
      }
    }
  }

  if (!chatId) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textLight} />
        <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 14 }}>
          Chat não encontrado
        </Text>
      </View>
    );
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
          {otherTyping ? (
            <Text style={[styles.headerStatus, styles.headerStatusTyping]}>digitando...</Text>
          ) : itemTitulo ? (
            <Text style={styles.headerStatus} numberOfLines={1}>
              📦 {itemTitulo}
            </Text>
          ) : (
            <Text style={styles.headerStatus}>
              {chatStatus === "ativo" ? "● Chat ativo" : "● Chat fechado"}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.headerBtn} onPress={carregarMensagens}>
          <Ionicons name="refresh-outline" size={18} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Mensagens */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={colors.primaryDark} />
            <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 13 }}>
              Carregando mensagens...
            </Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
            <Ionicons name="alert-circle-outline" size={40} color="#e8514a" />
            <Text style={{ color: "#e8514a", fontSize: 13 }}>{error}</Text>
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              style={styles.body}
              contentContainerStyle={[styles.bodyContent, { paddingBottom: 12 }]}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
              showsVerticalScrollIndicator={false}
            >
              {mensagens.length === 0 && (
                <View style={{ alignItems: "center", paddingTop: 60 }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.textLight} />
                  <Text style={{ color: colors.textLight, marginTop: 8, fontSize: 13 }}>
                    Envie a primeira mensagem!
                  </Text>
                </View>
              )}

              {mensagens.map((msg, i) => {
                const isMe = msg.is_me;
                const mostrarHora =
                  i === mensagens.length - 1 ||
                  mensagens[i + 1]?.is_me !== msg.is_me;

                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.msgWrap,
                      isMe ? styles.msgWrapMeu : styles.msgWrapDele,
                    ]}
                  >
                    <View style={[styles.bubble, isMe ? styles.bubbleMeu : styles.bubbleDele]}>
                      <Text style={[styles.bubbleText, isMe && styles.bubbleTextMeu]}>
                        {msg.conteudo}
                      </Text>
                    </View>
                    {mostrarHora && (
                      <Text style={[styles.hora, isMe && styles.horaMeu]}>
                        {formatHora(msg.data_envio)}
                      </Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            {/* Input */}
            {chatStatus === "ativo" ? (
              <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10 }]}>
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite uma mensagem..."
                    placeholderTextColor={colors.textLight}
                    value={texto}
                    onChangeText={(v) => { setTexto(v); notificarDigitando(); }}
                    multiline
                    editable={!sending}
                  />
                  <TouchableOpacity
                    onPress={enviar}
                    style={[styles.sendBtn, texto.trim() && styles.sendBtnActive]}
                    activeOpacity={0.8}
                    disabled={!texto.trim() || sending}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color={colors.primaryDark} />
                    ) : (
                      <Ionicons
                        name="send"
                        size={18}
                        color={texto.trim() ? colors.primaryDark : colors.textLight}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10 }]}>
                <View style={[styles.inputCard, { justifyContent: "center" }]}>
                  <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600" }}>
                    Este chat foi encerrado
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
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
  headerStatusTyping: { fontStyle: "italic", opacity: 1, fontWeight: "600" },
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