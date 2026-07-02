/**
 * API Service — Camada centralizada de comunicação com o backend Django.
 * Todas as telas do app devem usar estas funções em vez de chamar fetch diretamente.
 */
import auth from "./auth";

export const API_BASE_URL = "https://projeto-find.onrender.com";
const API = `${API_BASE_URL}/api`;

// ─── Helpers ────────────────────────────────────────────────────────────────

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.detail || data?.error || response.statusText || "Erro na API";
    throw new Error(message);
  }
  return data;
};

/**
 * Fetch autenticado — injeta o header Authorization automaticamente.
 */
const authFetch = async (url, options = {}) => {
  const headers = await auth.getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
      ...(options.headers || {}),
    },
  });
};

/**
 * Fetch autenticado para FormData (sem Content-Type — o browser define com boundary).
 */
const authFetchForm = async (url, options = {}) => {
  const headers = await auth.getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...headers,
      ...(options.headers || {}),
    },
  });
};

// ─── Status Map ─────────────────────────────────────────────────────────────

export const apiStatusMap = {
  Todos: "todos",
  Encontrado: "achado",
  Perdido: "perdido",
  Devolvido: "devolvido",
  Confirmado: "confirmado",
  Pendente: "pendente_confirmacao",
};

// ─── Itens ──────────────────────────────────────────────────────────────────

export const fetchItems = async ({
  q = "",
  status = "todos",
  page = 1,
  perPage = 20,
  categoria,
} = {}) => {
  const params = new URLSearchParams({
    q,
    status,
    page: String(page),
    per_page: String(perPage),
  });
  if (categoria) params.set("categoria", String(categoria));
  return handleResponse(await fetch(`${API}/items/?${params.toString()}`));
};

export const searchByImage = async (imageUri) => {
  const formData = new FormData();
  const uriParts = imageUri.split(".");
  const ext = uriParts[uriParts.length - 1] || "jpg";
  formData.append("imagem", {
    uri: imageUri,
    name: `busca.${ext}`,
    type: `image/${ext === "png" ? "png" : "jpeg"}`,
  });
  return handleResponse(
    await fetch(`${API}/items/busca-visual/`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    })
  );
};

export const fetchItemDetail = async (itemId) => {
  const resp = await fetch(`${API}/items/${itemId}/`);
  const data = await handleResponse(resp);
  // A API retorna { ok, data: {...} } — retorna o item diretamente
  return data?.data || data;
};

export const createItem = async (formData) => {
  return handleResponse(
    await authFetchForm(`${API}/items/criar/`, {
      method: "POST",
      body: formData,
    })
  );
};

export const editItem = async (itemId, formData) => {
  return handleResponse(
    await authFetchForm(`${API}/items/${itemId}/editar/`, {
      method: "PUT",
      body: formData,
    })
  );
};

export const deleteItem = async (itemId) => {
  return handleResponse(
    await authFetch(`${API}/items/${itemId}/deletar/`, {
      method: "DELETE",
    })
  );
};

export const changeItemStatus = async (itemId, status) => {
  return handleResponse(
    await authFetch(`${API}/items/${itemId}/status/`, {
      method: "POST",
      body: JSON.stringify({ status }),
    })
  );
};

export const fetchMyItems = async ({ page = 1, perPage = 20 } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  return handleResponse(
    await authFetch(`${API}/meus-itens/?${params.toString()}`)
  );
};

// ─── Stats & Categorias ─────────────────────────────────────────────────────

export const fetchStats = async () => {
  return handleResponse(await fetch(`${API}/stats/`));
};

export const fetchCategories = async () => {
  return handleResponse(await fetch(`${API}/categorias/`));
};

// ─── Profile ────────────────────────────────────────────────────────────────

export const fetchProfile = async () => {
  return handleResponse(await authFetch(`${API}/profile/`));
};

export const updateProfile = async (data) => {
  return handleResponse(
    await authFetch(`${API}/profile/update/`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  );
};

export const updateProfileWithPhoto = async (formData) => {
  return handleResponse(
    await authFetchForm(`${API}/profile/update/`, {
      method: "POST",
      body: formData,
    })
  );
};

export const resizeProfilePhoto = async (tamanho = "medio") => {
  return handleResponse(
    await authFetch(`${API}/profile/resize-photo/`, {
      method: "POST",
      body: JSON.stringify({ tamanho }),
    })
  );
};

export const fetchPhotoSizes = async () => {
  return handleResponse(await fetch(`${API}/profile/photo-sizes/`));
};

// ─── Chats ──────────────────────────────────────────────────────────────────

export const fetchChats = async () => {
  return handleResponse(await authFetch(`${API}/chats/`));
};

export const startChat = async (itemId) => {
  return handleResponse(
    await authFetch(`${API}/chats/iniciar/${itemId}/`, {
      method: "POST",
    })
  );
};

export const fetchChatMessages = async (chatId) => {
  return handleResponse(
    await authFetch(`${API}/chats/${chatId}/mensagens/`)
  );
};

export const sendChatMessage = async (chatId, conteudo) => {
  return handleResponse(
    await authFetch(`${API}/chats/${chatId}/enviar/`, {
      method: "POST",
      body: JSON.stringify({ conteudo }),
    })
  );
};

export const closeChat = async (chatId) => {
  return handleResponse(
    await authFetch(`${API}/chats/${chatId}/fechar/`, {
      method: "POST",
    })
  );
};

// ─── Notificações ────────────────────────────────────────────────────────────

export const fetchNotificacoes = async () => {
  return handleResponse(await authFetch(`${API}/notificacoes/`));
};

export const marcarNotificacaoLida = async (id) => {
  return handleResponse(
    await authFetch(`${API}/notificacoes/${id}/lida/`, {
      method: "POST",
    })
  );
};

export const marcarTodasLidas = async () => {
  return handleResponse(
    await authFetch(`${API}/notificacoes/marcar-todas-lidas/`, {
      method: "POST",
    })
  );
};

// ─── QR Code ─────────────────────────────────────────────────────────────────

export const getQrCodeUrl = (slug) => `${API}/items/qr/${slug}/imagem/`;

export const qrScan = async (slug, observacao = "") => {
  return handleResponse(
    await authFetch(`${API}/items/qr/${slug}/scan/`, {
      method: "POST",
      body: JSON.stringify({ observacao }),
    })
  );
};

// ─── Bolsista ─────────────────────────────────────────────────────────────────

export const fetchBolsistaPendentes = async ({ page = 1, perPage = 20 } = {}) => {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  return handleResponse(
    await authFetch(`${API}/bolsista/pendentes/?${params.toString()}`)
  );
};

export const bolsistaConfirmar = async (itemId, observacao = "") => {
  return handleResponse(
    await authFetch(`${API}/bolsista/${itemId}/confirmar/`, {
      method: "POST",
      body: JSON.stringify({ observacao }),
    })
  );
};

export const bolsistaDevolver = async (itemId, nomeRecebedor, observacao = "") => {
  return handleResponse(
    await authFetch(`${API}/bolsista/${itemId}/devolver/`, {
      method: "POST",
      body: JSON.stringify({ nome_recebedor: nomeRecebedor, observacao }),
    })
  );
};

export const fetchBolsistaMeuLog = async () => {
  return handleResponse(await authFetch(`${API}/bolsista/meu-log/`));
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const fetchAdminBolsistas = async () => {
  return handleResponse(await authFetch(`${API}/admin/bolsistas/`));
};

export const adminAdicionarBolsista = async (email) => {
  return handleResponse(
    await authFetch(`${API}/admin/bolsistas/adicionar/`, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  );
};

export const adminRemoverBolsista = async (userId) => {
  return handleResponse(
    await authFetch(`${API}/admin/bolsistas/${userId}/remover/`, {
      method: "DELETE",
    })
  );
};

export const fetchAdminRelatorio = async () => {
  return handleResponse(await authFetch(`${API}/admin/relatorio/`));
};

export const fetchAdminLog = async () => {
  return handleResponse(await authFetch(`${API}/admin/log/`));
};
