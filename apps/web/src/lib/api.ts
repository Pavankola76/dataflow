const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    // Global 401 Unauthorized handler
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("dataflow_auth");
      window.location.href = "/login";
    }
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    let errorMessage = `API Error: ${res.status}`;
    
    if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
      if (errorData.error.details) {
        const details = Array.isArray(errorData.error.details) 
           ? errorData.error.details.join(", ") 
           : errorData.error.details;
        errorMessage += ` - ${details}`;
      }
    } else if (errorData?.detail) {
      errorMessage = errorData.detail;
    }
    
    throw new Error(errorMessage);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  // Generic
  get: (endpoint: string, options?: any) => apiFetch(endpoint, { method: "GET", ...options }),
  post: (endpoint: string, body?: any, options?: any) => apiFetch(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined, ...options }),

  // Auth
  register: (data: { email: string; password: string; name: string; org_name?: string }) =>
    apiFetch("/api/v1/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch("/api/v1/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: (token: string) => apiFetch("/api/v1/auth/me", { token }),

  // Connectors
  listConnectors: (token: string) => apiFetch("/api/v1/connectors", { token }),

  // Connections
  listConnections: (token: string) => apiFetch("/api/v1/connections", { token }),
  createConnection: (data: unknown, token: string) =>
    apiFetch("/api/v1/connections", { method: "POST", body: JSON.stringify(data), token }),
  testConnection: (id: string, token: string) =>
    apiFetch(`/api/v1/connections/${id}/test`, { method: "POST", token }),
  discoverSchema: (id: string, token: string) =>
    apiFetch(`/api/v1/connections/${id}/discover`, { method: "POST", token }),
  getSchema: (id: string, token: string) =>
    apiFetch(`/api/v1/connections/${id}/schema`, { token }),
  deleteConnection: (id: string, token: string) =>
    apiFetch(`/api/v1/connections/${id}`, { method: "DELETE", token }),

  // Pipelines
  listPipelines: (token: string) => apiFetch("/api/v1/pipelines", { token }),
  createPipeline: (data: unknown, token: string) =>
    apiFetch("/api/v1/pipelines", { method: "POST", body: JSON.stringify(data), token }),
  runPipeline: (id: string, token: string) =>
    apiFetch(`/api/v1/pipelines/${id}/run`, { method: "POST", token }),
  getPipelineRuns: (id: string, token: string) =>
    apiFetch(`/api/v1/pipelines/${id}/runs`, { token }),

  // Health
  health: () => apiFetch("/api/v1/health"),
};
