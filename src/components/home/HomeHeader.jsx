import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; 
import LogoFind from "../layout/LogoFind";
import auth from "../../services/auth";

const colors = { primary: "#90dbf4", primaryDark: "#0B3A4A" };

export default function HomeHeader() {
  const navigation = useNavigation(); 
  const [userProfilePic, setUserProfilePic] = useState(null);

  useEffect(() => {
    auth.getUser().then((user) => {
      if (user?.foto) setUserProfilePic(user.foto);
    }).catch(() => {});
  }, []);

  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <View style={{ transform: [{ scale: 0.8 }], transformOrigin: "left" }}>
          <LogoFind color={colors.primaryDark} />
        </View>
      </View>
      
      {/* Botão de Notificações - Redireciona para a tela de notificações */}
      <TouchableOpacity 
        style={styles.notifBtn}
        onPress={() => navigation.navigate("notificacoes")}
        activeOpacity={0.7}
      >
        <Ionicons name="notifications-outline" size={20} color={colors.primaryDark} />
      </TouchableOpacity>
      
      {/* Botão do Avatar (Redireciona para a aba Perfil) */}
      <TouchableOpacity 
        style={styles.avatar} 
        onPress={() => navigation.navigate("Perfil")}
        activeOpacity={0.7} 
      >
        {userProfilePic ? (
          <Image 
            source={{ uri: userProfilePic }} 
            style={styles.avatarImage} 
          />
        ) : (
          /* Ícone de usuário padrão profissional */
          <Ionicons name="person" size={20} color={colors.primaryDark} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingBottom: 28,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notifBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.5)", 
    borderWidth: 2, borderColor: "rgba(255,255,255,0.8)",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden", 
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});