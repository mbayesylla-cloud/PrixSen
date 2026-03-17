// Service API — PRIXSEN Frontend
// Toutes les requêtes vers le backend Node.js (http://localhost:3001)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ====== HELPERS ======
function getToken(): string | null {
  return localStorage.getItem('prixsen_access_token');
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Tente de rafraîchir l'access token.
// Retourne le nouveau token ou null si le refresh token est lui-même expiré/invalide.
let _isRefreshing = false;
let _refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  // Dédupliquer: si un refresh est déjà en cours, attendre le même résultat
  if (_isRefreshing && _refreshPromise) return _refreshPromise;

  const refreshToken = localStorage.getItem('prixsen_refresh_token');
  if (!refreshToken) return null;

  _isRefreshing = true;
  _refreshPromise = (async () => {
    try {
      // Appel direct sans passer par apiFetch pour éviter la récursion
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        localStorage.removeItem('prixsen_access_token');
        localStorage.removeItem('prixsen_refresh_token');
        return null;
      }

      const data = await res.json();
      localStorage.setItem('prixsen_access_token', data.data.accessToken);
      localStorage.setItem('prixsen_refresh_token', data.data.refreshToken);
      return data.data.accessToken as string;
    } catch {
      return null;
    } finally {
      _isRefreshing = false;
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// Liste des endpoints qui ne doivent jamais déclencher un retry (évite la récursion)
const NO_RETRY_ENDPOINTS = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/google'];

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  // Token expiré → refresh automatique (une seule fois, jamais pour les endpoints auth)
  if (res.status === 401 && !NO_RETRY_ENDPOINTS.some(e => endpoint.startsWith(e))) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryRes = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...(options.headers || {}),
        },
      });
      return retryRes.json();
    }
    // Refresh échoué → session expirée, notifier l'app via custom event
    localStorage.removeItem('prixsen_access_token');
    localStorage.removeItem('prixsen_refresh_token');
    window.dispatchEvent(new CustomEvent('prixsen:session_expired'));
    return { success: false, message: 'Session expirée', code: 'SESSION_EXPIRED' };
  }

  return res.json();
}

// ====== AUTH ======
export const authAPI = {
  login: async (email: string, password: string) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.success) {
      localStorage.setItem('prixsen_access_token', data.data.accessToken);
      localStorage.setItem('prixsen_refresh_token', data.data.refreshToken);
    }
    return data;
  },

  register: async (payload: { nom: string; email: string; password: string; zone: string }) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.success) {
      localStorage.setItem('prixsen_access_token', data.data.accessToken);
      localStorage.setItem('prixsen_refresh_token', data.data.refreshToken);
    }
    return data;
  },

  loginGoogle: async (credential: string) => {
    const data = await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    if (data.success) {
      localStorage.setItem('prixsen_access_token', data.data.accessToken);
      localStorage.setItem('prixsen_refresh_token', data.data.refreshToken);
    }
    return data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('prixsen_refresh_token');
    // On tente le logout serveur mais on nettoie dans tous les cas
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {}
    localStorage.removeItem('prixsen_access_token');
    localStorage.removeItem('prixsen_refresh_token');
  },
};

// ====== ZONES ======
export const zonesAPI = {
  getAll: () => apiFetch('/zones'),
};

// ====== ALIMENTATION ======
export const alimentationAPI = {
  getProduits: (zone?: string, categorie?: string) => {
    const params = new URLSearchParams();
    if (zone) params.set('zone', zone);
    if (categorie) params.set('categorie', categorie);
    return apiFetch(`/alimentation?${params}`);
  },
  getProduit: (id: string) => apiFetch(`/alimentation/${id}`),
};

// ====== TRANSPORT ======
export const transportAPI = {
  getPrix: (zone?: string) => {
    const params = zone ? `?zone=${zone}` : '';
    return apiFetch(`/transport${params}`);
  },
};

// ====== CARBURANT ======
export const carburantAPI = {
  getPrix: () => apiFetch('/carburant'),
};

// ====== LOGEMENT ======
export const logementAPI = {
  getPrix: (zone?: string) => {
    const params = zone ? `?zone=${zone}` : '';
    return apiFetch(`/logement${params}`);
  },
};

// ====== SIGNALEMENTS ======
export const signalementsAPI = {
  getAll: (params?: { zone?: string; verifie?: boolean; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.zone) q.set('zone', params.zone);
    if (params?.verifie !== undefined) q.set('verifie', String(params.verifie));
    if (params?.page) q.set('page', String(params.page));
    return apiFetch(`/signalements?${q}`);
  },

  create: async (data: {
    produit: string;
    prix: number;
    zone: string;
    categorie?: string;
    photo?: File;
  }) => {
    const formData = new FormData();
    formData.append('produit', data.produit);
    formData.append('prix', String(data.prix));
    formData.append('zone', data.zone);
    if (data.categorie) formData.append('categorie', data.categorie);
    if (data.photo) formData.append('photo', data.photo);

    const token = getToken();
    const res = await fetch(`${API_URL}/signalements`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return res.json();
  },

  verify: (id: string) =>
    apiFetch(`/signalements/${id}/verify`, { method: 'PUT' }),

  delete: (id: string) =>
    apiFetch(`/signalements/${id}`, { method: 'DELETE' }),
};

// ====== ALERTES ======
export const alertesAPI = {
  getAll: () => apiFetch('/alertes'),
  markRead: (id: string) => apiFetch(`/alertes/${id}/read`, { method: 'POST' }),
  markAllRead: () => apiFetch('/alertes/read-all', { method: 'POST' }),
  create: (data: { type: string; produit: string; zone: string; message: string }) =>
    apiFetch('/alertes', { method: 'POST', body: JSON.stringify(data) }),
};

// ====== PROFIL ======
export const profilAPI = {
  get: () => apiFetch('/profil'),
  update: (data: { nom?: string; zone?: string; avatar?: string }) =>
    apiFetch('/profil', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (oldPassword: string, newPassword: string) =>
    apiFetch('/profil/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
};

// ====== DASHBOARD ======
export const dashboardAPI = {
  get: () => apiFetch('/dashboard'),
};

// ====== ANALYSE ======
export const analyseAPI = {
  get: () => apiFetch('/analyse'),
};

// ====== ADMIN ======
export const adminAPI = {
  getUsers: () => apiFetch('/admin/users'),
  toggleBan: (email: string) =>
    apiFetch(`/admin/users/${encodeURIComponent(email)}/ban`, { method: 'PUT' }),
  changeRole: (email: string, role: 'user' | 'moderator' | 'admin') =>
    apiFetch(`/admin/users/${encodeURIComponent(email)}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
};
