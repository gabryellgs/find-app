import React, { useState, useRef } from "react";
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Text, 
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Platform,
  UIManager,
  LayoutAnimation
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const colors = {
  primary: "#90dbf4", // Azul oficial do site
  primaryDark: "#0B3A4A",
  textDark: "#0F172A",
  textMuted: "#5A6480",
  surface: "#FFFFFF",
  border: "rgba(0, 30, 100, 0.04)",
  babyBlue: "#EBF9FE", // Fundo azul bebê
};

export default function SearchBar({ searchText, setSearchText, statusFiltro, setStatusFiltro }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [periodoFiltro, setPeriodoFiltro] = useState("Qualquer data");

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const animarMudancaInterna = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const abrirModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const fecharModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      setModalVisible(false);
    });
  };

  const handleClearFilters = () => {
    animarMudancaInterna();
    setStatusFiltro("Todos");
    setPeriodoFiltro("Qualquer data");
  };

  const selecionarStatus = (label) => {
    animarMudancaInterna();
    setStatusFiltro(label);
  };

  const selecionarPeriodo = (time) => {
    animarMudancaInterna();
    setPeriodoFiltro(time);
  };

  return (
    <View style={styles.searchCard}>
      <Ionicons name="search-outline" size={18} color="#9AA3BB" style={styles.searchIcon} />
      <TextInput
        placeholder="Buscar por item ou local..."
        placeholderTextColor="#9AA3BB"
        style={styles.input}
        underlineColorAndroid="transparent"
        value={searchText}
        onChangeText={setSearchText}
      />
      
      <View style={styles.searchDivider} />

      <TouchableOpacity 
        style={styles.filterBtn} 
        activeOpacity={0.6}
        onPress={abrirModal}
      >
        <Ionicons name="options-outline" size={19} color={colors.primaryDark} />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={fecharModal}
        animationType="none" 
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={fecharModal}>
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
          </TouchableWithoutFeedback>

          {/* Painel do Modal */}
          <Animated.View 
            style={[
              styles.modalContent, 
              { transform: [{ translateY: sheetTranslateY }] }
            ]}
          >
            <View style={styles.modalIndicator} />

            {/* Cabeçalho */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Filtrar</Text>
                <Text style={styles.modalSubtitle}>Escolha o que deseja encontrar</Text>
              </View>
              <TouchableOpacity 
                style={styles.clearBtn} 
                onPress={handleClearFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>Limpar tudo</Text>
              </TouchableOpacity>
            </View>

            {/* Seção: Status */}
            <Text style={styles.filterSectionTitle}>Status do Objeto</Text>
            <View style={styles.optionsRow}>
              {[
                { label: "Todos", icon: "apps-outline" },
                { label: "Perdido", icon: "alert-circle-outline" },
                { label: "Encontrado", icon: "checkmark-circle-outline" }
              ].map((item) => {
                const isSelected = statusFiltro === item.label;
                return (
                  <TouchableOpacity
                    key={item.label}
                    activeOpacity={0.8}
                    style={[
                      styles.optionChip,
                      isSelected && styles.optionChipSelected
                    ]}
                    onPress={() => selecionarStatus(item.label)}
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={15} 
                      color={isSelected ? colors.primaryDark : "rgba(11, 58, 74, 0.45)"} 
                      style={styles.chipIcon}
                    />
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Seção: Período */}
            <Text style={styles.filterSectionTitle}>Período de publicação</Text>
            <View style={styles.optionsRow}>
              {[
                { time: "Qualquer data", icon: "calendar-outline" },
                { time: "Hoje", icon: "time-outline" },
                { time: "Esta semana", icon: "paper-plane-outline" }
              ].map((item) => {
                const isPeriodSelected = periodoFiltro === item.time;
                return (
                  <TouchableOpacity 
                    key={item.time} 
                    style={[
                      styles.optionChip, 
                      isPeriodSelected && styles.optionChipSelected
                    ]}
                    activeOpacity={0.8}
                    onPress={() => selecionarPeriodo(item.time)}
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={14} 
                      color={isPeriodSelected ? colors.primaryDark : "rgba(11, 58, 74, 0.45)"} 
                      style={styles.chipIcon}
                    />
                    <Text style={[
                      styles.optionText, 
                      isPeriodSelected && styles.optionTextSelected
                    ]}>
                      {item.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Botão de Ação Principal atualizado com o azul do site */}
            <TouchableOpacity 
              style={styles.applyBtn}
              activeOpacity={0.85}
              onPress={fecharModal}
            >
              <Text style={styles.applyBtnText}>Aplicar Filtros</Text>
            </TouchableOpacity>

          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    minHeight: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0B3A4A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  searchIcon: { marginLeft: 6 },
  input: { flex: 1, color: colors.textDark, fontSize: 15, marginLeft: 8, paddingVertical: 0, outlineStyle: "none" },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    marginHorizontal: 8,
  },
  filterBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 14, 
    backgroundColor: "#F1F5F9", 
    alignItems: "center", 
    justifyContent: "center",
    marginRight: 2,
  },

  /* MODAL */
  modalOverlay: { 
    flex: 1, 
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 58, 74, 0.2)", 
  },
  modalContent: { 
    backgroundColor: colors.babyBlue, 
    borderTopLeftRadius: 36, 
    borderTopRightRadius: 36, 
    paddingHorizontal: 24, 
    paddingBottom: 42, 
    paddingTop: 12,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
  },
  modalIndicator: { 
    width: 38, 
    height: 5, 
    borderRadius: 99, 
    backgroundColor: "rgba(11, 58, 74, 0.1)", 
    alignSelf: "center", 
    marginBottom: 26 
  },
  modalHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    marginBottom: 32 
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: "800", 
    color: colors.primaryDark, 
    letterSpacing: -0.6 
  },
  modalSubtitle: { 
    fontSize: 13, 
    color: "rgba(11, 58, 74, 0.6)", 
    fontWeight: "600",
    marginTop: 2 
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(11, 58, 74, 0.05)", 
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDark
  },
  filterSectionTitle: { 
    fontSize: 11, 
    fontWeight: "800", 
    color: colors.primaryDark, 
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  optionsRow: { 
    flexDirection: "row", 
    gap: 8, 
    marginBottom: 28 
  },
  optionChip: { 
    flex: 1, 
    flexDirection: "row", 
    paddingVertical: 14, 
    borderRadius: 16, 
    backgroundColor: "#FFFFFF", 
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.01)",
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  optionChipSelected: {
    backgroundColor: colors.primary, 
    borderColor: "transparent",
  },
  chipIcon: {
    marginRight: 5,
  },
  optionText: { 
    fontSize: 12, 
    fontWeight: "700", 
    color: "rgba(11, 58, 74, 0.65)" 
  },
  optionTextSelected: {
    color: colors.primaryDark, 
    fontWeight: "700",
  },
  applyBtn: { 
    backgroundColor: colors.primary, // Ajustado para a cor azul do site
    paddingVertical: 16, 
    borderRadius: 18, 
    alignItems: "center", 
    justifyContent: "center",
    marginTop: 6,
    // Sombra leve para destacar o botão no fundo azul claro
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  applyBtnText: { 
    color: colors.primaryDark, // Ajustado para azul escuro para dar contraste sobre o azul claro do site
    fontSize: 15, 
    fontWeight: "700",
    letterSpacing: -0.1,
  },
});