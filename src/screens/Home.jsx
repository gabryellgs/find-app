import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeHeader from "../components/home/HomeHeader";
import SearchBar from "../components/home/SearchBar";
import CategoryList from "../components/home/CategoryList";
import StatsRow from "../components/home/StatsRow";
import ItemCard from "../components/home/ItemCard";

const items = [
  {
    icon: "bag-handle", iconColor: "#0a7a3e", iconBg: "#e1f9ed",
    title: "Carteira preta — Couro", location: "Copacabana, RJ",
    time: "há 2h", status: "Encontrado",
    badgeStyle: { bg: "#e1f9ed", text: "#0a7a3e" },
  },
  {
    icon: "phone-portrait", iconColor: "#b32e29", iconBg: "#fdecea",
    title: "iPhone 15 Pro — Preto", location: "Pinheiros, SP",
    time: "há 5h", status: "Perdido",
    badgeStyle: { bg: "#fdecea", text: "#b32e29" },
  },
  {
    icon: "key", iconColor: "#185fa5", iconBg: "#e6f1fb",
    title: "Chave de moto — Honda", location: "Moema, SP",
    time: "há 12min", status: "Match!",
    badgeStyle: { bg: "#e6f1fb", text: "#185fa5" },
  },
];

export default function Home({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#90dbf4" />
      <HomeHeader />
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bodyContent}
      >
        <SearchBar />
        <Text style={styles.sectionTitle}>Categorias</Text>
        <CategoryList />
        <StatsRow />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destaques</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {items.map((item, i) => (
          <ItemCard key={i} item={item} />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#0B3A4A" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  body: { flex: 1, marginTop: -16 },
  bodyContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#0B0F1A", marginBottom: 12 },
  seeAll: { fontSize: 13, color: "#0B3A4A", fontWeight: "500" },
  fab: {
    position: "absolute", right: 20, bottom: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#90dbf4", alignItems: "center", justifyContent: "center",
    shadowColor: "#90dbf4", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
});