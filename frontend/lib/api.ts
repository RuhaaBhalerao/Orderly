/**
 * Frontend API Utility
 * Centralized fetch wrapper with:
 * - Authorization headers
 * - Token management (localStorage)
 * - Error handling
 * - Request/response typing
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Token key for localStorage
const TOKEN_KEY = 'procure_ai_token';
const USER_KEY = 'procure_ai_user';

/**
 * Get stored JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store JWT token in localStorage
 */
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Clear stored token (logout)
 */
export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Store user info
 */
export function setUser(user: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Get stored user info
 */
export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * API request interface
 */
interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean; // Don't add Authorization header
}

/**
 * API response interface
 */
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

/**
 * Generic API request function
 * Handles authentication, error parsing, and response typing
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options;

  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  } as Record<string, string>;

  // Add authorization header unless explicitly skipped
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let body: any = null;

    if (contentType?.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    // Success response
    if (response.ok) {
      return {
        data: body,
        status: response.status,
      };
    }

    // Error response
    return {
      error: body?.error || body?.message || 'Unknown error',
      message: body?.message,
      status: response.status,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Network error';
    return {
      error: errorMessage,
      status: 0,
    };
  }
}

/**
 * Authentication API calls
 */
export const authAPI = {
  /**
   * Register new user
   */
  register: async (name: string, email: string, password: string) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      skipAuth: true,
    });

    if (!response.error && response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
    }

    return response;
  },

  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    if (!response.error && response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
    }

    return response;
  },

  /**
   * Get current user
   */
  me: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Logout
   */
  logout: () => {
    clearToken();
  },
};

/**
 * Contract API calls
 */
export const contractAPI = {
  /**
   * Get all contracts for user
   */
  getAll: async () => {
    return apiRequest('/contracts', {
      method: 'GET',
    });
  },

  /**
   * Get single contract by ID
   */
  getById: async (contractId: string) => {
    return apiRequest(`/contracts/${contractId}`, {
      method: 'GET',
    });
  },

  /**
   * Create new contract
   */
  create: async (data: {
    title: string;
    vendor: string;
    contractType: string;
    status: string;
    riskLevel: string;
    effectiveDate: string;
    expiryDate: string;
  }) => {
    return apiRequest('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update contract
   */
  update: async (contractId: string, data: any) => {
    return apiRequest(`/contracts/${contractId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload PDF for contract
   */
  uploadPdf: async (contractId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}/contracts/${contractId}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          error: error?.message || 'Upload failed',
          status: response.status,
        };
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Upload failed',
        status: 0,
      };
    }
  },

  /**
   * Analyze contract (runs AI extraction)
   */
  analyze: async (contractId: string) => {
    return apiRequest(`/contracts/${contractId}/analyze`, {
      method: 'POST',
    });
  },
};

/**
 * Chat API calls
 */
export const chatAPI = {
  /**
   * Get chat history for a contract
   */
  getHistory: async (contractId: string) => {
    return apiRequest(`/contracts/${contractId}/chat`, {
      method: 'GET',
    });
  },

  /**
   * Send message and get AI response
   */
  sendMessage: async (contractId: string, userMessage: string) => {
    return apiRequest(`/contracts/${contractId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ userMessage }),
    });
  },
};

/**
 * Gmail API calls (Phase 6)
 */
export const gmailAPI = {
  /**
   * Get Gmail OAuth authorization URL
   */
  getAuthUrl: async () => {
    return apiRequest('/gmail/auth', {
      method: 'GET',
    });
  },

  /**
   * Get Gmail connection status
   */
  getStatus: async () => {
    return apiRequest('/gmail/status', {
      method: 'GET',
    });
  },

  /**
   * Trigger inbox sync
   */
  syncInbox: async () => {
    return apiRequest('/gmail/sync', {
      method: 'POST',
    });
  },

  /**
   * Disconnect Gmail
   */
  disconnect: async () => {
    return apiRequest('/gmail/disconnect', {
      method: 'POST',
    });
  },
};
