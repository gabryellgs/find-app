import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, Platform, UIManager, LayoutAnimation,
  ActivityIndicator, Alert
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { createItem, fetchCategories } from "../services/api";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const colors = {
  primary: "#90dbf4", primaryDark: "#0B3A4A", bg: "#F8FAFC", surface: "#FFFFFF",
  textDark: "#0F172A", textMuted: "#475569", textLight: "#94A3B8",
  borderLight: "rgba(15, 23, 42, 0.04)", danger: "#FF3B30", success: "#34C759",
};

// Ícones para categorias (fallback visual)
const CATEGORY_ICONS = {
  "eletrônico": "phone-portrait-outline",
  "eletronico": "phone-portrait-outline",
  "documento": "card-outline",
  "chave": "key-outline",
  "carteira": "bag-handle-outline",
  "roupa": "shirt-outline",
  "outro": "cube-outline",
  "pet": "paw-outline",
  "bolsa": "bag-outline",
};

function getIconForCategory(nome) {
  const key = (nome || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return CATEGORY_ICONS[key] || "cube-outline";
}

export default function CadastrarItem({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tipo, setTipo] = useState("Perdido");
  const [categoria, setCategoria] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [local, setLocal] = useState("");
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carrega categorias da API
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCategories();
        if (data?.results) {
          setCategorias(data.results.map((c) => ({
            id: c.id,
            label: c.nome,
            icon: getIconForCategory(c.nome),
          })));
        }
      } catch (e) {
        // Fallback estático caso a API falhe
        setCategorias([
          { id: 1, label: "Eletrônico", icon: "phone-portrait-outline" },
          { id: 2, label: "Documento", icon: "card-outline" },
          { id: 3, label: "Chave", icon: "key-outline" },
          { id: 4, label: "Carteira", icon: "bag-handle-outline" },
          { id: 5, label: "Roupa", icon: "shirt-outline" },
          { id: 6, label: "Outro", icon: "cube-outline" },
        ]);
      }
    };
    load();
  }, []);

  const animarLayout = () => {
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.spring, springDamping: 0.85 },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity }
    });
  };

  async function escolherFoto(origem) {
    let result;
    if (origem === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 4 - fotos.length,
        quality: 0.7,
      });
    }
    if (!result.canceled && result.assets) {
      animarLayout();
      setFotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 4));
    }
  }

  function removerFoto(index) {
    animarLayout();
    setFotos((prev) => prev.filter((_, i) => i !== index));
  }

  const handlePublicar = async () => {
    if (!categoria) { Alert.alert("Erro", "Selecione uma categoria."); return; }
    if (!titulo.trim()) { Alert.alert("Erro", "Insira um título."); return; }
    if (!local.trim()) { Alert.alert("Erro", "Informe o local."); return; }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("titulo", titulo.trim());
      formData.append("descricao", descricao.trim());
      formData.append("local", local.trim());
      formData.append("status", tipo === "Perdido" ? "perdido" : "achado");
      formData.append("categoria", categoria.id);

      if (fotos.length > 0) {
        const uri = fotos[0];
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        formData.append("imagem", { uri, name: filename, type: match ? `image/${match[1]}` : `image/jpeg` });
      }

      const resData = await createItem(formData);

      if (resData?.ok) {
        Alert.alert("Sucesso! 🎉", "Item publicado com sucesso.", [{ text: "Ok", onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert("Erro", resData?.detail || "Falha ao publicar.");
      }
    } catch (e) {
      Alert.alert("Erro", e.message || "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Registro</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 40 }]}>
        <Text style={styles.sectionTitle}>Propósito do anúncio</Text>
        <View style={styles.tipoSegmentedTrack}>
          {["Perdido", "Encontrado"].map((label) => (
            <TouchableOpacity key={label} onPress={() => { animarLayout(); setTipo(label); }} style={[styles.tipoSegmentButton, tipo === label && styles.tipoSegmentButtonActive]}>
              <Text style={[styles.tipoSegmentText, tipo === label && { color: label === "Perdido" ? colors.danger : colors.success, fontWeight: "700" }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Selecione a Categoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScrollView} contentContainerStyle={styles.catsScrollContainer}>
          {categorias.map((cat) => (
            <TouchableOpacity key={cat.id} onPress={() => { animarLayout(); setCategoria(cat); }} style={[styles.catPill, categoria?.id === cat.id && styles.catPillActive]}>
              <Ionicons name={cat.icon} size={15} color={categoria?.id === cat.id ? colors.primaryDark : colors.textMuted} />
              <Text style={[styles.catText, categoria?.id === cat.id && styles.catTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Fotos do Objeto <Text style={styles.sectionSub}>({fotos.length}/4)</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fotosRow}>
          {fotos.map((uri, i) => (
            <View key={i} style={styles.fotoThumb}>
              <Image source={{ uri }} style={styles.fotoImg} />
              <TouchableOpacity onPress={() => removerFoto(i)} style={styles.fotoRemove}><Ionicons name="close" size={12} color="#fff" /></TouchableOpacity>
            </View>
          ))}
          {fotos.length < 4 && (
            <View style={styles.photoActionsContainer}>
              <TouchableOpacity onPress={() => escolherFoto("camera")} style={styles.fotoAddBtn}><Ionicons name="camera" size={20} color={colors.primaryDark} /><Text style={styles.fotoAddText}>Câmera</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => escolherFoto("galeria")} style={styles.fotoAddBtn}><Ionicons name="images" size={20} color={colors.primaryDark} /><Text style={styles.fotoAddText}>Galeria</Text></TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <Text style={styles.sectionTitle}>Título da publicação</Text>
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Título</Text>
          <TextInput style={styles.input} placeholder="Ex: Chaveiro azul" placeholderTextColor={colors.textLight} value={titulo} onChangeText={setTitulo} />
        </View>

        <Text style={styles.sectionTitle}>Local aproximado</Text>
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Local</Text>
          <TextInput style={styles.input} placeholder="Bairro ou cidade" placeholderTextColor={colors.textLight} value={local} onChangeText={setLocal} />
        </View>

        <Text style={styles.sectionTitle}>Descrição detalhada</Text>
        <View style={[styles.inputCard, { alignItems: "flex-start", paddingTop: 14 }]}>
          <Text style={[styles.inputLabel, { marginTop: 2 }]}>Descrição</Text>
          <TextInput style={[styles.input, styles.inputMultiline]} placeholder="Características marcantes..." placeholderTextColor={colors.textLight} value={descricao} onChangeText={setDescricao} multiline numberOfLines={4} textAlignVertical="top" />
        </View>

        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handlePublicar} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color={colors.primaryDark} /> : <><Text style={styles.submitText}>Publicar Registro</Text><Ionicons name="arrow-forward" size={16} color={colors.primaryDark} /></>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, paddingBottom: 20, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10, elevation: 5 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255, 255, 255, 0.35)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.primaryDark, letterSpacing: -0.3 },
  body: { flex: 1 }, bodyContent: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: colors.primaryDark, marginBottom: 8, marginTop: 22, textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4 },
  sectionSub: { fontSize: 11, color: colors.textLight, textTransform: "none" },
  tipoSegmentedTrack: { backgroundColor: "rgba(15, 23, 42, 0.05)", padding: 3, borderRadius: 12, flexDirection: "row", gap: 2, marginBottom: 4 },
  tipoSegmentButton: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 9 },
  tipoSegmentButtonActive: { backgroundColor: colors.surface, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  tipoSegmentText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  catsScrollView: { marginHorizontal: -16, paddingVertical: 2 }, catsScrollContainer: { paddingHorizontal: 16, gap: 8 },
  catPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight, gap: 6 },
  catPillActive: { backgroundColor: colors.primary, borderColor: "transparent" },
  catText: { fontSize: 13, color: colors.textDark, fontWeight: "600" }, catTextActive: { color: colors.primaryDark, fontWeight: "700" },
  fotosRow: { flexDirection: "row", gap: 10, paddingVertical: 4 },
  fotoThumb: { width: 84, height: 84, borderRadius: 14, overflow: "hidden" }, fotoImg: { width: "100%", height: "100%" },
  fotoRemove: { position: "absolute", top: 5, right: 5, width: 18, height: 18, borderRadius: 9, backgroundColor: "rgba(15, 23, 42, 0.6)", alignItems: "center", justifyContent: "center" },
  photoActionsContainer: { flexDirection: "row", gap: 10 },
  fotoAddBtn: { width: 84, height: 84, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight, alignItems: "center", justifyContent: "center", gap: 4 },
  fotoAddText: { fontSize: 11, color: colors.primaryDark, fontWeight: "700" },
  inputCard: { backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.borderLight, flexDirection: "row", alignItems: "center", shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  inputLabel: { width: 80, fontSize: 14, color: colors.primaryDark, fontWeight: "700" },
  input: { flex: 1, fontSize: 14, color: colors.textDark, fontWeight: "500", paddingVertical: 14 },
  inputMultiline: { height: 80, paddingVertical: 0 },
  submitBtn: { marginTop: 32, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  submitText: { fontSize: 15, fontWeight: "700", color: colors.primaryDark },
});