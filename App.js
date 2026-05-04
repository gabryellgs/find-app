import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LandingPage from "./src/screens/LandingPage";
import Dashboard from "./src/screens/Dashboard";
import Login from "./src/screens/Login";
import Register from "./src/screens/Register";

export default function App() {
  const [screen, setScreen] = useState("landing");

  return (
    <SafeAreaProvider>
      <StatusBar
        style="dark"
        backgroundColor="transparent"
        translucent
      />

      {/* Landing Page */}
      {screen === "landing" && (
        <LandingPage
          onLogin={() => setScreen("login")}
          onRegister={() => setScreen("register")}
        />
      )}

      {/* Login */}
      {screen === "login" && (
        <Login
          onLogin={() => setScreen("dashboard")}
          onRegister={() => setScreen("register")}
        />
      )}

      {/* Register */}
      {screen === "register" && (
        <Register
          onLogin={() => setScreen("login")}
        />
      )}

      {/* Dashboard */}
      {screen === "dashboard" && (
        <Dashboard
          onBack={() => setScreen("landing")}
        />
      )}
    </SafeAreaProvider>
  );
}