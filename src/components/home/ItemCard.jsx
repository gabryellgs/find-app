import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");
// Mantido nos 62% para o carrossel de respeito funcionar perfeitamente
const CARD_WIDTH = screenWidth * 0.32; 

const colors = {
  cardBg: "#E3F6FC",         
  surface: "#FFFFFF",
  textDark: "#052E3B",       // Azul profundo dos títulos
  textBody: "#185FA5",       // Azul intermediário clássico
  textMuted: "#5A738E",
  danger: "#B32E29",         
  success: "#1F7A51",        
  info: "#185FA5",
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=800&auto=format&fit=crop";

export default function ItemCard({ item, onPress }) {
  const statusTexto = (item?.status || "").toLowerCase();
  
  // Definição inteligente de cores e ícones baseados no status da API
  let statusColor = colors.success;
  let statusIcon = "checkmark-circle";
  if (statusTexto === "perdido") {
    statusColor = colors.danger;
    statusIcon = "warning";
  } else if (statusTexto === "devolvido") {
    statusColor = colors.info;
    statusIcon = "sync";
  }

  // Fallbacks de segurança para chaves do Django
  const exibirTitulo = item?.titulo || item?.title || "Sem título";
  const exibirDescricao = item?.descricao || item?.description || "Sem descrição informada.";
  const exibirLocal = item?.local || item?.location || "Não informado";
  const exibirImagem = item?.imagem || item?.photo || item?.photo_url || PLACEHOLDER_IMAGE;
  
  // Formata strings ISO (AAAA-MM-DD) para padrão brasileiro (DD/MM/AAAA)
  const rawData = item?.data || item?.date || item?.criado_em || "Data pendente";
  const exibirData = typeof rawData === "string" && rawData.includes("-") 
    ? rawData.split("-").reverse().join("/") 
    : rawData;

  // Trata a categoria vinda da API
  let exibirCategoria = "Objetos";
  if (item?.categoria) {
    exibirCategoria = typeof item.categoria === "object" ? (item.categoria.nome || item.categoria.title) : item.categoria;
  } else if (item?.category) {
    exibirCategoria = typeof item.category === "object" ? (item.category.nome || item.category.title) : item.category;
  }

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={onPress}>
      
      {/* Imagem superior */}
      <Image source={{ uri: exibirImagem }} style={styles.cardImage} />

      {/* Corpo de informações textuais */}
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>{exibirTitulo}</Text>
        <Text style={styles.description} numberOfLines={2}>{exibirDescricao}</Text>
        <Text style={styles.category}>{exibirCategoria.toUpperCase()}</Text>
      </View>

      {/* Rodapé Metadados integrado com o Badge de Status */}
      <View style={styles.metaRow}>
        <View style={styles.metaTextContainer}>
          <Text style={styles.locationText} numberOfLines={1}>
            <Ionicons name="location-outline" size={10} color={colors.textBody} /> {exibirLocal}
          </Text>
          <Text style={styles.dateText}>{exibirData}</Text>
        </View>

        {/* O indicador quadrado agora fica integrado de forma limpa no canto inferior */}
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
          <Ionicons name={statusIcon} size={13} color="#fff" />
        </View>
      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  cardImage: {
    width: "100%",
    height: 125, 
    borderRadius: 9,
    backgroundColor: "#D1E4EC",
    resizeMode: "cover",
  },
  cardBody: {
    paddingVertical: 10,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 12,
    color: colors.textBody,
    lineHeight: 15,
    fontWeight: "500",
  },
  category: {
    fontSize: 9.5,
    fontWeight: "700",
    color: colors.textBody,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderColor: "rgba(24, 95, 165, 0.12)",
    paddingTop: 10,
    marginTop: 4,
  },
  metaTextContainer: {
    flex: 1,
    gap: 2,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textDark,
    paddingRight: 6,
  },
  dateText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: colors.textMuted,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 6, 
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});