import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import auth from "../services/auth";
import { fetchStats as apiFetchStats, fetchProfile as apiFetchProfile, updateProfileWithPhoto, updateProfile as apiUpdateProfile, resizeProfilePhoto } from "../services/api";

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  bg: "#F5F7FB",
  surface: "#FFFFFF",
  text: "#0B0F1A",
  textMuted: "#5A6480",
  textLight: "#9AA3BB",
  border: "rgba(0, 30, 100, 0.08)",
  danger: "#b32e29",
  dangerBg: "#fdecea",
  success: "#10b981",
};

function SectionLabel({ title }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function Dashboard({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Controlador do modo de edição
  const [stats, setStats] = useState({ perdidos: 0, encontrados: 0, matches: 0 });

  // Estados dos Campos do Usuário
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  
  // Campos Bloqueados (Apenas Leitura)
  const [email, setEmail] = useState("");
  const [idade, setIdade] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoLocal, setFotoLocal] = useState(null); // URI local da nova foto (prévia)
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBolsista, setIsBolsista] = useState(false);

  // Configurações de preferência (Switches)
  const [notifications, setNotifications] = useState(true);
  const [locationAlert, setLocationAlert] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

  useEffect(() => {
    carregarDadosPerfil();
  }, []);

  const carregarDadosPerfil = async () => {
    try {
      setLoading(true);

      // Tenta buscar perfil da API primeiro
      try {
        const profileData = await apiFetchProfile();
        const profile = profileData?.data || profileData;
        if (profile?.username) {
          const fullName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username;
          setName(fullName);
          setEmail(profile.email || "");
          setUsername(profile.username || "");
          setTelefone(profile.telefone || "");
          setCidade(profile.cidade ? `${profile.cidade}${profile.estado ? ', ' + profile.estado : ''}` : "");
          setIdade(profile.data_nascimento || "");
          setFotoUrl(profile.foto || "");
          setIsAdmin(profile.is_admin || false);
          setIsBolsista(profile.is_bolsista || false);
          // Atualiza cache local
          await auth.saveUser({ name: fullName, username: profile.username, email: profile.email, telefone: profile.telefone || '', cidade: profile.cidade || '', estado: profile.estado || '', foto: profile.foto || '', is_admin: profile.is_admin || false, is_bolsista: profile.is_bolsista || false });
        }
      } catch {
        // Fallback para dados locais
        const localUserData = await auth.getUser();
        if (localUserData) {
          setName(localUserData.name || localUserData.username || "");
          setEmail(localUserData.email || "");
          setUsername(localUserData.username || "");
          setTelefone(localUserData.telefone || "");
          setCidade(localUserData.cidade || "");
          setIdade(localUserData.data_nascimento || localUserData.idade || "");
          setFotoUrl(localUserData.foto || "");
          setIsAdmin(localUserData.is_admin || false);
          setIsBolsista(localUserData.is_bolsista || false);
        }
      }

      // Busca estatísticas da API
      try {
        const statsData = await apiFetchStats();
        const d = statsData?.data || statsData;
        setStats({
          perdidos: d.perdidos || 0,
          encontrados: d.encontrados || 0,
          matches: d.devolvidos || 0,
        });
      } catch {
        setStats({ perdidos: 0, encontrados: 0, matches: 0 });
      }
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Salva as alterações feitas de volta no Banco/AsyncStorage
  const salvarAlteracoes = async () => {
    if (!name.trim() || !username.trim()) {
      Alert.alert("Erro", "Nome e Nome de Usuário não podem ficar vazios.");
      return;
    }

    try {
      setLoading(true);
      
      // Salva localmente
      const dadosAtualizados = { name, username, telefone, cidade, email, idade };
      await auth.saveUser(dadosAtualizados);

      // Sincroniza com o Django via API centralizada
      try {
        // Separa cidade e estado se vier no formato "Cidade, UF"
        const cidadeParts = cidade.split(",").map(s => s.trim());
        await apiUpdateProfile({
          full_name: name,
          username: username.replace("@", ""),
          telefone: telefone,
          cidade: cidadeParts[0] || "",
          estado: cidadeParts[1] || "",
          data_nascimento: idade || "",
        });
      } catch (e) {
        console.log("Erro ao sincronizar com servidor:", e.message);
      }

      setIsEditing(false);
      Alert.alert("Sucesso ✨", "As informações do seu perfil foram atualizadas!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  // ── Foto de Perfil ──
  const escolherFoto = () => {
    Alert.alert("Foto de perfil", "Como deseja escolher?", [
      { text: "Câmera", onPress: () => abrirPicker("camera") },
      { text: "Galeria", onPress: () => abrirPicker("galeria") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const abrirPicker = async (origem) => {
    const permResult = origem === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert("Permissão negada", "Permita o acesso para alterar sua foto.");
      return;
    }
    const result = origem === "camera"
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setFotoLocal(uri);      // mostra prévia imediatamente
      enviarFoto(uri);        // envia direto sem modal
    }
  };

  const enviarFoto = async (uri) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      const uriParts = uri.split(".");
      const ext = uriParts[uriParts.length - 1]?.toLowerCase().split("?")[0] || "jpg";
      formData.append("image", {
        uri,
        name: `profile.${ext}`,
        type: ext === "png" ? "image/png" : "image/jpeg",
      });
      formData.append("tamanho", "grande"); // alta qualidade fixa
      const resp = await updateProfileWithPhoto(formData);
      const novaUrl = resp?.data?.foto || resp?.foto;
      if (novaUrl) {
        // Cache-busting: força recarregamento da imagem no app
        const urlComCache = `${novaUrl}?t=${Date.now()}`;
        setFotoUrl(urlComCache);
        setFotoLocal(null);
        const userData = await auth.getUser();
        await auth.saveUser({ ...userData, foto: urlComCache });
        Alert.alert("Sucesso ✨", "Foto de perfil atualizada!");
      } else {
        Alert.alert("Atenção", "Foto enviada, mas recarregue para ver a atualização.");
      }
    } catch (e) {
      Alert.alert("Erro", e.message || "Não foi possível enviar a foto.");
      setFotoLocal(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const obterIniciais = (nomeCompleto) => {
    if (!nomeCompleto) return "U";
    const partes = nomeCompleto.trim().split(" ");
    if (partes.length > 1) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0].substring(0, 2).toUpperCase();
  };

  const executarLogout = async () => {
    Alert.alert("Sair da conta", "Deseja realmente encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await auth.logout();
          (navigation.getParent() ?? navigation).reset({ index: 0, routes: [{ name: "landing" }] });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryDark} />
        <Text style={styles.loadingText}>Atualizando dados...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>
              {isEditing ? "Editando Perfil" : "Minha conta"}
            </Text>
            
            {/* Botão de Lápis/Cancelar */}
            <TouchableOpacity 
              style={[styles.iconBtn, isEditing && { backgroundColor: colors.dangerBg }]} 
              activeOpacity={0.7}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Ionicons 
                name={isEditing ? "close" : "pencil"} 
                size={18} 
                color={isEditing ? colors.danger : colors.primaryDark} 
              />
            </TouchableOpacity>
          </View>

          {/* Card do Perfil */}
          <View style={styles.profileCard}>
            <TouchableOpacity onPress={escolherFoto} activeOpacity={0.8} style={styles.avatarWrap}>
              <View style={styles.avatarLarge}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (fotoLocal || fotoUrl) ? (
                  <Image source={{ uri: fotoLocal || fotoUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{obterIniciais(name)}</Text>
                )}
              </View>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>{name}</Text>
              <Text style={styles.profileEmail} numberOfLines={1}>{email}</Text>
              <View style={styles.profileBadge}>
                <Ionicons name="shield-checkmark" size={11} color="#185fa5" />
                <Text style={styles.profileBadgeText}>Conta ativa</Text>
              </View>
            </View>
          </View>

          {/* Mini Stats */}
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatValue}>{stats.perdidos}</Text>
              <Text style={styles.miniStatLabel}>Perdidos</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatValue}>{stats.encontrados}</Text>
              <Text style={styles.miniStatLabel}>Achados</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatValue, { color: "#185fa5" }]}>{stats.matches}</Text>
              <Text style={styles.miniStatLabel}>Matches</Text>
            </View>
          </View>
        </View>

        {/* ── Corpo das Configurações ── */}
        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bodyContent}
        >
          {/* Dados Pessoais Editáveis */}
          <SectionLabel title="Dados pessoais" />
          <View style={styles.card}>
            
            {/* Campo: NOME COMPLETADO */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="person-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Nome completo</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.inputInline}
                    value={name}
                    onChangeText={setName}
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <Text style={styles.rowSub}>{name}</Text>
                )}
              </View>
            </View>
            <Divider />

            {/* Campo: NOME DE USUÁRIO */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="finger-print-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Nome de usuário</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.inputInline}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Ex: gabryell_12"
                    autoCapitalize="none"
                  />
                ) : (
                  <Text style={styles.rowSub}>@{username.replace("@", "")}</Text>
                )}
              </View>
            </View>
            <Divider />

            {/* Campo: TELEFONE */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="call-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Telefone</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.inputInline}
                    value={telefone}
                    onChangeText={setTelefone}
                    placeholder="Seu número"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.rowSub}>{telefone}</Text>
                )}
              </View>
            </View>
            <Divider />

            {/* Campo: CIDADE */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="location-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Cidade / Estado</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.inputInline}
                    value={cidade}
                    onChangeText={setCidade}
                    placeholder="Cidade, UF"
                  />
                ) : (
                  <Text style={styles.rowSub}>{cidade}</Text>
                )}
              </View>
            </View>
            <Divider />

            {/* Campo: DATA DE NASCIMENTO */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="calendar-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Data de Nascimento</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.inputInline}
                    value={idade}
                    onChangeText={setIdade}
                    placeholder="AAAA-MM-DD"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                  />
                ) : (
                  <Text style={styles.rowSub}>{idade || "Não informada"}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Campos Trancados (🔒 NÃO EDITÁVEIS - Email) */}
          <SectionLabel title="Informações de registro (Trancadas)" />
          <View style={styles.card}>
            
            {/* Campo Bloqueado: EMAIL */}
            <View style={[styles.row, styles.disabledRow]}>
              <View style={styles.rowIcon}>
                <Ionicons name="mail-outline" size={18} color={colors.textLight} />
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowLabel, { color: colors.textMuted }]}>E-mail da conta</Text>
                <Text style={styles.rowSub}>{email}</Text>
              </View>
              <Ionicons name="lock-closed" size={14} color={colors.textLight} style={{ marginRight: 4 }} />
            </View>
          </View>

          {/* Botão de Salvar Alterações (Só aparece se estiver editando) */}
          {isEditing && (
            <TouchableOpacity 
              style={styles.btnSave} 
              activeOpacity={0.8}
              onPress={salvarAlteracoes}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.btnSaveText}>Salvar Alterações</Text>
            </TouchableOpacity>
          )}

          {/* ── Preferências de Notificações ── */}
          <SectionLabel title="Notificações" />
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="notifications-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Notificações push</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={notifications ? colors.primaryDark : "#ccc"}
              />
            </View>
            <Divider />
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="location-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Alertas por localização</Text>
                <Text style={styles.rowSub}>Itens próximos a você</Text>
              </View>
              <Switch
                value={locationAlert}
                onValueChange={setLocationAlert}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={locationAlert ? colors.primaryDark : "#ccc"}
              />
            </View>
            <Divider />
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="mail-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Atualizações por e-mail</Text>
              </View>
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={emailUpdates ? colors.primaryDark : "#ccc"}
              />
            </View>
          </View>

          {/* ── Acesso Rápido ── */}
          <SectionLabel title="Acesso rápido" />
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}
              onPress={() => navigation.navigate("meusItens")}>
              <View style={styles.rowIcon}>
                <Ionicons name="cube-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Meus Itens</Text>
                <Text style={styles.rowSub}>Ver e gerenciar seus itens</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.row} activeOpacity={0.7}
              onPress={() => navigation.navigate("notificacoes")}>
              <View style={styles.rowIcon}>
                <Ionicons name="notifications-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Notificações</Text>
                <Text style={styles.rowSub}>Alertas e atualizações</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
            
            {isBolsista && (
              <>
                <Divider />
                <TouchableOpacity style={styles.row} activeOpacity={0.7}
                  onPress={() => navigation.navigate("painelBolsista")}>
                  <View style={styles.rowIcon}>
                    <Ionicons name="shield-outline" size={18} color={colors.primaryDark} />
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowLabel}>Painel Bolsista</Text>
                    <Text style={styles.rowSub}>Confirmar e devolver itens</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                </TouchableOpacity>
              </>
            )}

            {isAdmin && (
              <>
                <Divider />
                <TouchableOpacity style={styles.row} activeOpacity={0.7}
                  onPress={() => navigation.navigate("painelAdmin")}>
                  <View style={styles.rowIcon}>
                    <Ionicons name="settings-outline" size={18} color={colors.primaryDark} />
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowLabel}>Painel Administrador</Text>
                    <Text style={styles.rowSub}>Gestão de usuários e relatórios</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* ── Suporte ── */}
          <SectionLabel title="Suporte" />
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <View style={styles.rowIcon}>
                <Ionicons name="help-circle-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Central de ajuda</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* ── Sair do Sistema ── */}
          <SectionLabel title="Conta" />
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={executarLogout} activeOpacity={0.7}>
              <View style={[styles.rowIcon, { backgroundColor: colors.dangerBg }]}>
                <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowLabel, { color: colors.danger }]}>Sair da conta</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>Find v1.0.0</Text>
        </ScrollView>

      </View>
    </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: colors.primaryDark, fontWeight: "600" },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primaryDark,
    letterSpacing: -0.4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Perfil
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: { position: "relative" },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
  },
  profileInfo: { flex: 1, gap: 3 },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primaryDark,
    letterSpacing: -0.2,
  },
  profileEmail: {
    fontSize: 12,
    color: "rgba(11,58,74,0.6)",
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 2,
  },
  profileBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#185fa5",
  },

  // Mini Stats
  miniStats: {
    backgroundColor: "rgba(255,255,255,0.45)",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  miniStat: { alignItems: "center", flex: 1 },
  miniStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  miniStatLabel: {
    fontSize: 11,
    color: "rgba(11,58,74,0.6)",
    marginTop: 2,
  },
  miniStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(11,58,74,0.12)",
  },

  // Conteúdo do Menu de Linhas
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  disabledRow: {
    backgroundColor: "#fafafa",
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(144,219,244,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  rowSub: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    marginTop: 1,
  },
  inputInline: {
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.bg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
    fontWeight: "500",
    width: "100%",
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginLeft: 64,
  },
  btnSave: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 14,
    marginVertical: 12,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnSaveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: colors.textLight,
    marginTop: 24,
    marginBottom: 8,
  },
});