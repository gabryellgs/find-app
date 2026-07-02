import React from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import auth from "./src/services/auth";

import LandingPage from "./src/screens/LandingPage";
import Login from "./src/screens/Login";
import Register from "./src/screens/Register";
import Home from "./src/screens/Home";
import Dashboard from "./src/screens/Dashboard";
import CadastrarItem from "./src/screens/CadastrarItem";
import Chat from "./src/screens/Chat";
import ChatConversa from "./src/screens/ChatConversa";
import Busca from "./src/screens/Busca";
import Notificacoes from "./src/screens/Notificacoes";
import DetalheItem from "./src/screens/DetalheItem";
import MeusItens from "./src/screens/MeusItens";
import PainelBolsista from "./src/screens/PainelBolsista";
import PainelAdmin from "./src/screens/PainelAdmin";

const colors = {
  primary: "#90dbf4",
  primaryDark: "#0B3A4A",
  surface: "#FFFFFF",
  textLight: "#9AA3BB",
  border: "rgba(0, 30, 100, 0.08)",
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PlaceholderScreen({ route }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: colors.textLight, fontSize: 14 }}>
        {route.name} — em breve
      </Text>
    </View>
  );
}

function AddButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("cadastrar")}
      activeOpacity={0.8}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 8,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="add" size={26} color={colors.primaryDark} />
      </View>
    </TouchableOpacity>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          height: 62 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: { active: "home", inactive: "home-outline" },
            Buscar: { active: "search", inactive: "search-outline" },
            Chat: { active: "chatbubbles", inactive: "chatbubbles-outline" },
            Perfil: { active: "person", inactive: "person-outline" },
          };
          const name = icons[route.name]?.[focused ? "active" : "inactive"] ?? "ellipse";
          return <Ionicons name={name} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Buscar" component={Busca} />
      <Tab.Screen
        name="Novo"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: () => <AddButton />,
        }}
      />
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="Perfil" component={Dashboard} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const tokens = await auth.getTokens();
      setUserToken(tokens?.access ? tokens.access : null);
    } catch (e) {
      console.log("Failed to restore token", e);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.surface }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          // 💡 Se você quiser abrir DIRETO na Home para ver as mudanças sem passar por nada: mude para "main"
          initialRouteName="landing" 
        >
          {/* 🔓 TODAS AS ROTAS JUNTAS E LIVRES PARA VOCÊ DESENVOLVER SEM TRAVAS */}
          <Stack.Screen name="landing" component={LandingPage} />
          <Stack.Screen name="login" component={Login} />
          <Stack.Screen name="register" component={Register} />
          
          <Stack.Screen name="main" component={TabNavigator} />
          <Stack.Screen name="chatConversa" component={ChatConversa} />
          <Stack.Screen name="cadastrar" component={CadastrarItem} options={{ presentation: "modal" }} />
          <Stack.Screen name="notificacoes" component={Notificacoes} />
          <Stack.Screen name="DetalheItem" component={DetalheItem} />
          <Stack.Screen name="meusItens" component={MeusItens} />
          <Stack.Screen name="painelBolsista" component={PainelBolsista} />
          <Stack.Screen name="painelAdmin" component={PainelAdmin} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}