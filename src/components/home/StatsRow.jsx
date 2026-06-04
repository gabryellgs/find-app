import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { fetchStats } from "../../services/api";

const colors = {
  surface: "#FFFFFF",
  textDark: "#0B3A4A",
  textMuted: "#64748B",
  borderLight: "rgba(30, 174, 212, 0.15)", // Borda milimétrica e sutil do print
  
  // Cores exatas dos ícones do teu print
  totalIcon: "#F59E0B",      
  dangerIcon: "#E8514A",     
  successIcon: "#10B981",    
  infoIcon: "#185FA5",       
};

export default function StatsRow() {
  const isFocused = useIsFocused();
  const [stats, setStats] = useState({
    total: 3,
    perdidos: 3,
    encontrados: 0,
    devolvidos: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchStats();
        const data = response?.data || response;
        setStats({
          total: data.total ?? stats.total,
          devolvidos: data.devolvidos ?? stats.devolvidos,
          encontrados: data.encontrados ?? stats.encontrados,
          perdidos: data.perdidos ?? stats.perdidos,
        });
      } catch (error) {
        // Mantém os valores padrão se a API falhar
      }
    };
    if (isFocused) {
      loadStats();
    }
  }, [isFocused]);

  const { total, devolvidos, encontrados, perdidos } = stats;

  return (
    <View style={styles.gridContainer}>
      
      {/* PRIMEIRA LINHA */}
      <View style={styles.row}>
        
        {/* Total */}
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
          <Ionicons name="cube-outline" size={20} color={colors.totalIcon} />
          <Text style={styles.value}>{total}</Text>
          <Text style={styles.labelText}>Total</Text>
        </TouchableOpacity>

        {/* Perdidos */}
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
          <Ionicons name="warning-outline" size={20} color={colors.dangerIcon} />
          <Text style={styles.value}>{perdidos}</Text>
          <Text style={styles.labelText}>Perdidos</Text>
        </TouchableOpacity>

      </View>

      {/* SEGUNDA LINHA */}
      <View style={styles.row}>
        
        {/* Encontrados */}
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.successIcon} />
          <Text style={styles.value}>{encontrados}</Text>
          <Text style={styles.labelText}>Encontrados</Text>
        </TouchableOpacity>

        {/* Devolvidos */}
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
          <Ionicons name="sync-outline" size={20} color={colors.infoIcon} />
          <Text style={styles.value}>{devolvidos}</Text>
          <Text style={styles.labelText}>Devolvidos</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    gap: 10, 
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  row: { 
    flexDirection: "row", 
    gap: 10, 
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14, // Cantos suavizados na medida
    paddingVertical: 12, // Reduzido bastante para achatar o card
    paddingHorizontal: 10,
    borderWidth: 1, 
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { 
    fontSize: 19, // Tamanho equilibrado, sem estourar o card
    fontWeight: "800", 
    color: colors.textDark,
    letterSpacing: -0.5,
    marginTop: 4,  // Margem milimétrica entre o ícone e o número
    marginBottom: 2, // Margem milimétrica entre o número e o texto
  },
  labelText: { 
    fontSize: 9.5, // Legenda pequena em caixa alta igual ao print
    fontWeight: "700",
    color: colors.textMuted, 
    letterSpacing: 0.6,
    textTransform: "uppercase",
    textAlign: "center",
  },
});