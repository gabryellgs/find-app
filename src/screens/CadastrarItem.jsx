import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  bg: "#F5F7FB",
  surface: "#FFFFFF",
  text: "#0B0F1A",
  textMuted: "#5A6480",
  textLight: "#9AA3BB",
  border: "rgba(0, 30, 100, 0.08)",
  error: "#b32e29",
  success: "#0a7a3e",
};

const tipos = [
  { label: "Perdido",    icon: "alert-circle-outline",     color: "#b32e29", bg: "#fdecea" },
  { label: "Encontrado", icon: "checkmark-circle-outline", color: "#0a7a3e", bg: "#e1f9ed" },
];

const categorias = [
  { label: "Eletrônico", icon: "phone-portrait-outline" },
  { label: "Documento",  icon: "card-outline" },
  { label: "Chave",      icon: "key-outline" },
  { label: "Carteira",   icon: "bag-handle-outline" },
  { label: "Roupa",      icon: "shirt-outline" },
  { label: "Outro",      icon: "cube-outline" },
];

export default function CadastrarItem({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tipo, setTipo]           = useState("Perdido");
  const [categoria, setCategoria] = useState(null);
  const [titulo, setTitulo]       = useState("");
  const [descricao, setDescricao] = useState("");
  const [local, setLocal]         = useState("");
  const [fotos, setFotos]         = useState([]);

  async function escolherFoto(origem) {
    let result;
    if (origem === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 4,
        quality: 0.8,
      });
    }
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setFotos((prev) => [...prev, ...uris].slice(0, 4));
    }
  }

  function removerFoto(index) {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  }

  function voltar() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("main");
    }
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={voltar} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Item</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 40 }]}
      >

        {/* Tipo */}
        <Text style={styles.sectionTitle}>Tipo</Text>
        <View style={styles.tipoRow}>
          {tipos.map((t) => (
            <TouchableOpacity
              key={t.label}
              onPress={() => setTipo(t.label)}
              activeOpacity={0.7}
              style={[styles.tipoBtn, tipo === t.label && { backgroundColor: t.bg, borderColor: t.color }]}
            >
              <Ionicons name={t.icon} size={18} color={tipo === t.label ? t.color : colors.textLight} />
              <Text style={[styles.tipoBtnText, tipo === t.label && { color: t.color, fontWeight: "700" }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categoria */}
        <Text style={styles.sectionTitle}>Categoria</Text>
        <View style={styles.catsGrid}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              onPress={() => setCategoria(cat.label)}
              activeOpacity={0.7}
              style={[styles.catBtn, categoria === cat.label && styles.catBtnActive]}
            >
              <Ionicons
                name={cat.icon}
                size={22}
                color={categoria === cat.label ? colors.primaryDark : colors.textLight}
              />
              <Text style={[styles.catText, categoria === cat.label && styles.catTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fotos */}
        <Text style={styles.sectionTitle}>
          Fotos <Text style={styles.sectionSub}>(máx. 4)</Text>
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fotosRow}
        >
          {fotos.map((uri, i) => (
            <View key={i} style={styles.fotoThumb}>
              <Image source={{ uri }} style={styles.fotoImg} />
              <TouchableOpacity onPress={() => removerFoto(i)} style={styles.fotoRemove}>
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {fotos.length < 4 && (
            <>
              <TouchableOpacity
                onPress={() => escolherFoto("camera")}
                style={styles.fotoAddBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={24} color={colors.primaryDark} />
                <Text style={styles.fotoAddText}>Câmera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => escolherFoto("galeria")}
                style={styles.fotoAddBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="images-outline" size={24} color={colors.primaryDark} />
                <Text style={styles.fotoAddText}>Galeria</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        {/* Título */}
        <Text style={styles.sectionTitle}>Título</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Ex: iPhone 15 Pro preto"
            placeholderTextColor={colors.textLight}
            value={titulo}
            onChangeText={setTitulo}
          />
        </View>

        {/* Descrição */}
        <Text style={styles.sectionTitle}>Descrição</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Detalhes, marcas, características..."
            placeholderTextColor={colors.textLight}
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Local */}
        <Text style={styles.sectionTitle}>Local</Text>
        <View style={[styles.inputCard, styles.inputRow]}>
          <Ionicons name="location-outline" size={16} color={colors.textLight} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Bairro, cidade..."
            placeholderTextColor={colors.textLight}
            value={local}
            onChangeText={setLocal}
          />
        </View>

        {/* Publicar */}
        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85}>
          <Text style={styles.submitText}>Publicar</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.primaryDark} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.primary,
    paddingBottom: 28, paddingHorizontal: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.primaryDark },

  body: { flex: 1, marginTop: -16 },
  bodyContent: { paddingHorizontal: 16 },

  sectionTitle: {
    fontSize: 16, fontWeight: "600",
    color: colors.text, marginBottom: 12, marginTop: 24,
  },
  sectionSub: { fontSize: 12, fontWeight: "400", color: colors.textLight },

  tipoRow: { flexDirection: "row", gap: 10 },
  tipoBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 16,
    borderWidth: 0.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tipoBtnText: { fontSize: 14, fontWeight: "500", color: colors.textMuted },

  catsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catBtn: {
    width: "30.5%", paddingVertical: 16, borderRadius: 14,
    borderWidth: 0.5, borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center", gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  catBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
  catTextActive: { color: colors.primaryDark, fontWeight: "700" },

  fotosRow: { flexDirection: "row", gap: 10, paddingBottom: 4 },
  fotoThumb: {
    width: 90, height: 90, borderRadius: 14,
    overflow: "hidden",
  },
  fotoImg: { width: "100%", height: "100%" },
  fotoRemove: {
    position: "absolute", top: 5, right: 5,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center",
  },
  fotoAddBtn: {
    width: 90, height: 90, borderRadius: 14,
    borderWidth: 1, borderColor: colors.primary,
    borderStyle: "dashed",
    backgroundColor: "rgba(144,219,244,0.08)",
    alignItems: "center", justifyContent: "center", gap: 6,
  },
  fotoAddText: { fontSize: 11, color: colors.primaryDark, fontWeight: "600" },

  inputCard: {
    backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 0.5, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 13 },
  inputMultiline: { height: 100 },

  submitBtn: {
    marginTop: 32, backgroundColor: colors.primary,
    borderRadius: 16, paddingVertical: 16,
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 4,
  },
  submitText: { fontSize: 15, fontWeight: "700", color: colors.primaryDark },
});