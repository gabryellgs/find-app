import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./api";

const TOKEN_KEY = "auth_tokens";
const USER_KEY = "auth_user";

const saveTokens = async (tokens) => {
  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

const clearTokens = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const saveUser = async (userData) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const login = async (email, password) => {
  const resp = await fetch(`${API_BASE_URL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.detail || "Erro ao autenticar");

  await saveTokens(data);

  // Busca o perfil logo após o login e salva localmente
  try {
    const profileResp = await fetch(`${API_BASE_URL}/api/profile/`, {
      headers: {
        Authorization: `Bearer ${data.access}`,
        "Content-Type": "application/json",
      },
    });
    if (profileResp.ok) {
      const profileData = await profileResp.json();
      const profile = profileData.data || profileData;
      await saveUser({
        name:
          profile.full_name ||
          `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
          profile.username,
        username: profile.username,
        email: profile.email,
        telefone: profile.telefone || "",
        cidade: profile.cidade || "",
        estado: profile.estado || "",
        data_nascimento: profile.data_nascimento || "",
        foto: profile.foto || "",
        is_admin: profile.is_admin || false,
        is_bolsista: profile.is_bolsista || false,
      });
    }
  } catch (e) {
    console.log("Não foi possível buscar perfil após login:", e);
  }
  return data;
};

export const googleLogin = async (idToken) => {
  const resp = await fetch(`${API_BASE_URL}/api/google-login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.detail || "Erro ao autenticar com Google");

  await saveTokens(data.tokens || data);
  
  const user = data.data?.user || data;
  if (user) {
    try {
      const profileResp = await fetch(`${API_BASE_URL}/api/profile/`, {
        headers: {
          Authorization: `Bearer ${data.tokens?.access || data.access}`,
          "Content-Type": "application/json",
        },
      });
      if (profileResp.ok) {
        const profileData = await profileResp.json();
        const profile = profileData.data || profileData;
        await saveUser({
          name: profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.username,
          username: profile.username,
          email: profile.email,
          telefone: profile.telefone || "",
          cidade: profile.cidade || "",
          estado: profile.estado || "",
          foto: profile.foto || "",
          is_admin: profile.is_admin || false,
          is_bolsista: profile.is_bolsista || false,
        });
      }
    } catch (e) {
      console.log("Não foi possível buscar perfil após Google login:", e);
    }
  }
  return data;
};

/**
 * Registra um novo usuário.
 * @param {string} fullName - Nome completo
 * @param {string} email - E-mail
 * @param {string} password - Senha
 * @param {string} username - Nome de usuário
 * @param {string} dataNascimento - Data de nascimento (YYYY-MM-DD)
 */
export const register = async (fullName, email, password, username, dataNascimento) => {
  const resp = await fetch(`${API_BASE_URL}/api/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username || email,
      email,
      password,
      full_name: fullName,
      data_nascimento: dataNascimento || null,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.detail || "Erro ao registrar");

  const tokens = data.tokens || data;
  await saveTokens(tokens);

  // Salva o usuário localmente
  await saveUser({
    name: fullName,
    username: username || email,
    email: email,
    telefone: "",
    cidade: "",
    estado: "",
    data_nascimento: dataNascimento || "",
  });

  return data;
};

export const logout = async () => {
  await clearTokens();
  await AsyncStorage.removeItem(USER_KEY);
};

export const getTokens = async () => {
  const raw = await AsyncStorage.getItem(TOKEN_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const getAuthHeaders = async () => {
  const tokens = await getTokens();
  return tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {};
};

export default {
  login,
  register,
  logout,
  getTokens,
  getAuthHeaders,
  getUser,
  saveUser,
};