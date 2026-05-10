import { ScrollView, SafeAreaView, StatusBar, StyleSheet } from "react-native";

import NavBar from "../components/landing/NavBar";
import HeroSection from "../components/landing/HeroSection";
import SocialProofSection from "../components/landing/SocialProofSection";
import BenefitsSection from "../components/landing/BenefitsSection";
import DemoSection from "../components/landing/DemoSection";
import DifferentialsSection from "../components/landing/DifferentialsSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/layout/Footer";

const colors = {
  bg: "#F5F7FB",
  primary: "#90dbf4",
};

export default function LandingPage({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <NavBar
          onLogin={() => navigation.navigate("login")}
          onRegister={() => navigation.navigate("register")}
        />
        <HeroSection
          onRegister={() => navigation.navigate("register")}
        />
        <SocialProofSection />
        <BenefitsSection />
        <DemoSection />
        <DifferentialsSection />
        <TestimonialsSection />
        <CTASection
          onEnterApp={() => navigation.navigate("register")}
        />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});