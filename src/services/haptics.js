import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Wrapper de feedback tátil — no-op silencioso no web (expo-haptics não
 * tem suporte lá) e nunca deixa uma vibração derrubar a ação do usuário.
 */
const safeRun = (fn) => {
  if (Platform.OS === "web") return;
  fn().catch(() => {});
};

const haptics = {
  /** Toque leve — seleção, troca de filtro, abrir modal. */
  tap: () => safeRun(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Confirmação de ação importante — enviar mensagem, aplicar filtro. */
  success: () => safeRun(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Ação concluída com destaque — item confirmado, devolvido, cadastrado. */
  celebrate: () => safeRun(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Erro ou ação bloqueada. */
  error: () => safeRun(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

export default haptics;
