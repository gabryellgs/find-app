import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
} from "react-native";

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
};

function SectionLabel({ title }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function SettingRow({ icon, iconBg, iconColor, label, sublabel, onPress, right, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg || "rgba(144,219,244,0.18)" }]}>
        <Ionicons name={icon} size={18} color={iconColor || colors.primaryDark} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
        {sublabel ? <Text style={styles.rowSub}>{sublabel}</Text> : null}
      </View>
      {right ? right : (
        <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function Dashboard({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [locationAlert, setLocationAlert] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Minha conta</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={20} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Perfil */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>João Dantas</Text>
            <Text style={styles.profileEmail}>joao.dantas@email.com</Text>
            <View style={styles.profileBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#185fa5" />
              <Text style={styles.profileBadgeText}>Conta verificada</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={15} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Mini stats */}
        <View style={styles.miniStats}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>3</Text>
            <Text style={styles.miniStatLabel}>Perdidos</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>7</Text>
            <Text style={styles.miniStatLabel}>Encontrados</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Text style={[styles.miniStatValue, { color: "#185fa5" }]}>2</Text>
            <Text style={styles.miniStatLabel}>Matches</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bodyContent}
      >

        {/* ── Dados pessoais ── */}
        <SectionLabel title="Dados pessoais" />
        <View style={styles.card}>
          <SettingRow
            icon="person-outline"
            label="Nome completo"
            sublabel="João Dantas"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="mail-outline"
            label="E-mail"
            sublabel="joao.dantas@email.com"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="call-outline"
            label="Telefone"
            sublabel="+55 (11) 99999-0000"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="location-outline"
            label="Cidade"
            sublabel="São Paulo, SP"
            onPress={() => {}}
          />
        </View>

        {/* ── Segurança ── */}
        <SectionLabel title="Segurança" />
        <View style={styles.card}>
          <SettingRow
            icon="lock-closed-outline"
            label="Alterar senha"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="finger-print-outline"
            label="Biometria"
            sublabel="Usar para entrar"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="qr-code-outline"
            label="Autenticação em dois fatores"
            sublabel="Desativado"
            onPress={() => {}}
          />
        </View>

        {/* ── Notificações ── */}
        <SectionLabel title="Notificações" />
        <View style={styles.card}>
          <SettingRow
            icon="notifications-outline"
            label="Notificações push"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={notifications ? colors.primaryDark : "#ccc"}
              />
            }
          />
          <Divider />
          <SettingRow
            icon="location-outline"
            label="Alertas por localização"
            sublabel="Itens próximos a você"
            right={
              <Switch
                value={locationAlert}
                onValueChange={setLocationAlert}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={locationAlert ? colors.primaryDark : "#ccc"}
              />
            }
          />
          <Divider />
          <SettingRow
            icon="mail-outline"
            label="Atualizações por e-mail"
            right={
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={emailUpdates ? colors.primaryDark : "#ccc"}
              />
            }
          />
        </View>

        {/* ── Suporte ── */}
        <SectionLabel title="Suporte" />
        <View style={styles.card}>
          <SettingRow
            icon="help-circle-outline"
            label="Central de ajuda"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="chatbubble-ellipses-outline"
            label="Falar com suporte"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="document-text-outline"
            label="Termos de uso"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="shield-outline"
            label="Política de privacidade"
            onPress={() => {}}
          />
        </View>

        {/* ── Conta ── */}
        <SectionLabel title="Conta" />
        <View style={styles.card}>
          <SettingRow
            icon="log-out-outline"
            iconBg={colors.dangerBg}
            iconColor={colors.danger}
            label="Sair da conta"
            danger
            onPress={() => navigation.navigate("landing")}
          />
          <Divider />
          <SettingRow
            icon="trash-outline"
            iconBg={colors.dangerBg}
            iconColor={colors.danger}
            label="Excluir conta"
            sublabel="Esta ação é irreversível"
            danger
            onPress={() => {}}
          />
        </View>

        <Text style={styles.version}>Find v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // ── Header
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
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
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
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Mini stats
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

  // ── Body
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  // Section label
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 4,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 20,
    overflow: "hidden",
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  rowSub: {
    fontSize: 12,
    color: colors.textMuted,
  },

  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginLeft: 64,
  },

  version: {
    textAlign: "center",
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    marginBottom: 8,
  },
});