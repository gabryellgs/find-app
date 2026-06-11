import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  background: "#F8FAFC", 
  surface: "#FFFFFF",
  textDark: "#0F172A",
  textLight: "#64748B",
};

const NOTIFICACOES_MOCK = [
  {
    id: "1",
    tipo: "match",
    titulo: "Possível combinação encontrada!",
    descricao: "Um item parecido com o seu 'Moletom Preto' foi cadastrado perto de você.",
    tempo: "Há 5 min",
    icone: "git-compare-outline",
    corIcone: "#10B981", 
  },
  {
    id: "2",
    tipo: "chat",
    titulo: "Nova mensagem no Chat",
    descricao: "Marcos enviou uma mensagem sobre o 'Documento de Identidade'.",
    tempo: "Há 1 hora",
    icone: "chatbubbles-outline",
    corIcone: "#3B82F6", 
  },
  {
    id: "3",
    tipo: "sucesso",
    titulo: "Item Devolvido! 🎉",
    descricao: "Parabéns! O item 'Chave do Carro' foi marcado como devolvido ao dono.",
    tempo: "Ontem",
    icone: "checkmark-circle-outline",
    corIcone: "#F59E0B", 
  },
];

// Componente de Card Animado com efeito de mola e cascata (Staggered Entry)
function AnimatedCard({ item, index, onPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(24)).current; // Começa um pouco abaixo

  useEffect(() => {
    // Dispara a animação com um atraso baseado no index do item
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 80, // Efeito cascata amanteigado
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
      <TouchableOpacity style={styles.card} activeOpacity={0.65} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: item.corIcone + "15" }]}>
          <Ionicons name={item.icone} size={22} color={item.corIcone} />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.titulo} numberOfLines={1}>{item.titulo}</Text>
            <Text style={styles.tempo}>{item.tempo}</Text>
          </View>
          <Text style={styles.descricao}>{item.descricao}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Notificacoes() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); 

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      
      {/* Header Superior Blindado contra o bug de rolagem */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.6}>
          <Ionicons name="chevron-back" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 38 }} /> 
      </View>

      {/* Lista de Notificações com Cards Animados */}
      <FlatList
        data={NOTIFICACOES_MOCK}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatedCard 
            item={item} 
            index={index} 
            onPress={() => {
              if (item.tipo === "chat") {
                navigation.navigate("Chat"); 
              }
            }}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>Nenhuma notificação por enquanto.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20, 
    paddingHorizontal: 12,
    backgroundColor: colors.primary, 
    zIndex: 10,       
    elevation: 5,     
  },
  backBtn: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    backgroundColor: "rgba(255,255,255,0.35)", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: colors.primaryDark,
    letterSpacing: -0.3
  },
  
  listContent: { 
    paddingHorizontal: 16, 
    paddingTop: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16, 
    marginBottom: 12,
    alignItems: "center",
    // Totalmente limpo de bordas feias
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, 
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, alignItems: "center" },
  titulo: { fontSize: 14, fontWeight: "700", color: colors.textDark, flex: 1, paddingRight: 8 },
  tempo: { fontSize: 11, color: colors.textLight, fontWeight: "500" },
  descricao: { fontSize: 13, color: colors.textLight, lineHeight: 18 },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 120 },
  emptyText: { marginTop: 12, fontSize: 14, color: colors.textLight, fontStyle: "italic" },
});