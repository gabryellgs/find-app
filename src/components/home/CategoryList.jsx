import React, { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchCategories } from "../../services/api";

const CATEGORY_ICONS = {
  "eletronicos": "phone-portrait-outline",
  "documentos": "card-outline",
  "objetos pessoais": "wallet-outline",
  "vestuario": "shirt-outline",
  "livros e papelaria": "book-outline",
  "outros": "cube-outline",
};

function getIconForCategory(nome) {
  const key = (nome || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return CATEGORY_ICONS[key] || "cube-outline";
}

export default function CategoryList({ onSelect }) {
  const [active, setActive] = useState(0);
  const [categories, setCategories] = useState([{ id: null, label: "Todos", icon: "apps" }]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCategories();
        if (data?.results) {
          const apiCats = data.results.map((c) => ({
            id: c.id,
            label: c.nome,
            icon: getIconForCategory(c.nome),
          }));
          setCategories([{ id: null, label: "Todos", icon: "apps" }, ...apiCats]);
        }
      } catch (e) {
        setCategories([
          { id: null, label: "Todos", icon: "apps" },
          { id: 1, label: "Eletrônicos", icon: "phone-portrait-outline" },
          { id: 2, label: "Documentos", icon: "card-outline" },
          { id: 3, label: "Objetos Pessoais", icon: "wallet-outline" },
          { id: 4, label: "Vestuário", icon: "shirt-outline" },
          { id: 5, label: "Livros e Papelaria", icon: "book-outline" },
          { id: 6, label: "Outros", icon: "cube-outline" },
        ]);
      }
    };
    load();
  }, []);

  const handleSelect = (index, catId) => {
    setActive(index);
    if (onSelect) onSelect(catId);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {categories.map((cat, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => handleSelect(i, cat.id)}
          style={[styles.cat, active === i && styles.catActive]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={cat.icon}
            size={14}
            color={active === i ? "#0B3A4A" : "#5A6480"}
          />
          <Text style={[styles.catText, active === i && styles.catTextActive]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginBottom: 24, marginTop: -4 },
  row: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  cat: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, borderWidth: 0.5,
    borderColor: "rgba(0,30,100,0.08)", backgroundColor: "#fff",
  },
  catActive: { backgroundColor: "#90dbf4", borderColor: "#90dbf4" },
  catText: { fontSize: 13, color: "#5A6480", fontWeight: "500" },
  catTextActive: { color: "#0B3A4A", fontWeight: "600" },
});