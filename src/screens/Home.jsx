import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LogoFind from './LogoFind';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;

const colors = {
  primary: '#abe8ff',
  surface: '#FFFFFF',
  text: '#0B0F1A',
  border: 'rgba(0, 30, 100, 0.09)',
};

export default function NavBar({ onEnterApp }) {
  const logoSize = isMobile ? 'small' : 'normal';

  return (
    <View style={styles.nav}>
      <LogoFind size={logoSize} dark={false} />

      {!isMobile && (
        <View style={styles.navLinks}>
          <TouchableOpacity><Text style={styles.navLink}>Benefícios</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navLink}>Como funciona</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navLink}>Depoimentos</Text></TouchableOpacity>
        </View>
      )}

      <View style={styles.navActions}>
        <TouchableOpacity style={styles.btnGhost} onPress={onEnterApp}>
          <Text style={styles.btnGhostText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={onEnterApp}>
          <Text style={styles.btnPrimaryText}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    // no mobile junta tudo; no desktop espalha
    justifyContent: isMobile ? 'space-between' : 'space-between',
    paddingHorizontal: isMobile ? 12 : 16,
    paddingVertical: isMobile ? 10 : 10,
    marginTop: isMobile ? 0 : 20,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  navLink: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  navActions: {
    flexDirection: 'row',
    gap: isMobile ? 4 : 8,
  },
  btnGhost: {
    paddingVertical: isMobile ? 6 : 8,
    paddingHorizontal: isMobile ? 8 : 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  btnGhostText: {
    fontSize: isMobile ? 11 : 12,
    fontWeight: '600',
    color: colors.text,
  },
  btnPrimary: {
    paddingVertical: isMobile ? 6 : 8,
    paddingHorizontal: isMobile ? 8 : 12,
    borderRadius: 6,
    backgroundColor: colors.text,
  },
  btnPrimaryText: {
    fontSize: isMobile ? 11 : 12,
    fontWeight: '700',
    color: colors.primary,
  },
});