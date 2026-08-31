/**
 * Orderly Frontend API Utility
 * - Unified Axios instance with auth interceptor
 * - Automatic token injection & error normalization
 * - Comprehensive Orderly endpoints
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'orderly_token';
const USER_KEY = 'orderly_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function setUser(user: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

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

    if (response.ok) {
      return {
        data: body,
        status: response.status,
      };
    }

    return {
      error: body?.message || body?.error || 'Request failed',
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
 * Auth API
 */
export const authAPI = {
  register: async (name: string, employeeId: string, email: string, password: string, role: string) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, employeeId, email, password, role }),
      skipAuth: true,
    });

    if (!response.error && response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
    }

    return response;
  },

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

  me: async () => {
    return apiRequest('/auth/me', { method: 'GET' });
  },

  logout: () => {
    clearToken();
  },
};

/**
 * Purchase Request API
 */
export const purchaseRequestAPI = {
  getAll: async (params?: { search?: string; status?: string; priority?: string; department?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/purchase-requests?${query}`, { method: 'GET' });
  },

  getById: async (id: string) => {
    return apiRequest(`/purchase-requests/${id}`, { method: 'GET' });
  },

  create: async (data: {
    title: string;
    description: string;
    category: string;
    quantity: number;
    estimatedBudget: number;
    priority?: string;
    requiredByDate: string;
  }) => {
    return apiRequest('/purchase-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  approve: async (id: string, comment?: string) => {
    return apiRequest(`/purchase-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  reject: async (id: string, comment?: string) => {
    return apiRequest(`/purchase-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  compareSuppliers: async (id: string) => {
    return apiRequest(`/purchase-requests/${id}/compare-suppliers`, {
      method: 'POST',
    });
  },

  selectSupplier: async (id: string, supplierId: string, reason?: string) => {
    return apiRequest(`/purchase-requests/${id}/select-supplier`, {
      method: 'POST',
      body: JSON.stringify({ supplierId, reason }),
    });
  },
};

/**
 * Supplier API
 */
export const supplierAPI = {
  getAll: async (params?: { search?: string; category?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/suppliers?${query}`, { method: 'GET' });
  },

  getById: async (id: string) => {
    return apiRequest(`/suppliers/${id}`, { method: 'GET' });
  },

  create: async (data: any) => {
    return apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Purchase Order API
 */
export const purchaseOrderAPI = {
  getAll: async (params?: { search?: string; status?: string; supplierId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/purchase-orders?${query}`, { method: 'GET' });
  },

  getById: async (id: string) => {
    return apiRequest(`/purchase-orders/${id}`, { method: 'GET' });
  },

  create: async (data: {
    purchaseRequestId: string;
    supplierId: string;
    expectedDeliveryDate: string;
    paymentTerms?: string;
    shippingInformation?: string;
    notes?: string;
    items: { description: string; quantity: number; unitPrice: number }[];
  }) => {
    return apiRequest('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: string) => {
    return apiRequest(`/purchase-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

/**
 * Contract API
 */
export const contractAPI = {
  getAll: async () => {
    return apiRequest('/contracts', { method: 'GET' });
  },

  getById: async (id: string) => {
    return apiRequest(`/contracts/${id}`, { method: 'GET' });
  },

  create: async (formData: FormData) => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}/contracts`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const body = await response.json();
      if (!response.ok) {
        return { error: body?.message || 'Failed to create contract', status: response.status };
      }
      return { data: body, status: response.status };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Upload failed', status: 0 };
    }
  },

  delete: async (id: string) => {
    return apiRequest(`/contracts/${id}`, { method: 'DELETE' });
  },
};

/**
 * Dashboard & Analytics API
 */
export const dashboardAPI = {
  getMetrics: async () => {
    return apiRequest('/dashboard', { method: 'GET' });
  },
};

export const analyticsAPI = {
  getMetrics: async () => {
    return apiRequest('/analytics', { method: 'GET' });
  },
};

/**
 * Notifications & Audit Logs API
 */
export const notificationAPI = {
  getAll: async () => {
    return apiRequest('/notifications', { method: 'GET' });
  },
  markAsRead: async (id: string) => {
    return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
  },
  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', { method: 'POST' });
  },
};

export const auditLogAPI = {
  getAll: async () => {
    return apiRequest('/audit-logs', { method: 'GET' });
  },
};
