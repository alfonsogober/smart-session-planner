/**
 * API client for backend communication
 */
import {
  SessionType,
  AvailabilityWindow,
  Session,
  SessionSuggestion,
  ProgressStats,
  CreateSessionTypeRequest,
  CreateAvailabilityWindowRequest,
  CreateSessionRequest,
} from "../model/types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Generic fetch wrapper with error handling
 */
const fetchAPI = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API Request: ${options?.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    console.error(`API Error: ${response.status}`, error);
    const errorObj = new Error(error.error || `HTTP error! status: ${response.status}`);
    (errorObj as any).response = { status: response.status };
    (errorObj as any).data = error;
    throw errorObj;
  }

  const data = await response.json();
  console.log(`API Response from ${url}:`, data);
  return data;
};

/**
 * Session Types API
 */
export const sessionTypesAPI = {
  getAll: (): Promise<SessionType[]> => fetchAPI("/api/session-types"),
  getById: (id: string): Promise<SessionType> => fetchAPI(`/api/session-types/${id}`),
  create: (data: CreateSessionTypeRequest): Promise<SessionType> =>
    fetchAPI("/api/session-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CreateSessionTypeRequest>): Promise<SessionType> =>
    fetchAPI(`/api/session-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    fetchAPI(`/api/session-types/${id}`, {
      method: "DELETE",
    }),
};

/**
 * Availability Windows API
 */
export const availabilityAPI = {
  getAll: (): Promise<AvailabilityWindow[]> => fetchAPI("/api/availability"),
  create: (data: CreateAvailabilityWindowRequest): Promise<AvailabilityWindow> =>
    fetchAPI("/api/availability", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    fetchAPI(`/api/availability/${id}`, {
      method: "DELETE",
    }),
};

/**
 * Sessions API
 */
export const sessionsAPI = {
  getAll: (params?: { completed?: boolean; startDate?: string; endDate?: string }): Promise<Session[]> => {
    const queryParams = new URLSearchParams();
    if (params?.completed !== undefined) queryParams.append("completed", String(params.completed));
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    
    const query = queryParams.toString();
    return fetchAPI(`/api/sessions${query ? `?${query}` : ""}`);
  },
  getById: (id: string): Promise<Session> => fetchAPI(`/api/sessions/${id}`),
  create: (data: CreateSessionRequest): Promise<Session> =>
    fetchAPI("/api/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { completed?: boolean; startTime?: string; endTime?: string }): Promise<Session> =>
    fetchAPI(`/api/sessions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    fetchAPI(`/api/sessions/${id}`, {
      method: "DELETE",
    }),
};

/**
 * Suggestions API
 */
export const suggestionsAPI = {
  getSuggestions: (sessionTypeId: string, durationMinutes?: number, lookAheadDays?: number): Promise<SessionSuggestion[]> => {
    const params = new URLSearchParams({ sessionTypeId });
    if (durationMinutes) params.append("durationMinutes", String(durationMinutes));
    if (lookAheadDays) params.append("lookAheadDays", String(lookAheadDays));
    
    return fetchAPI(`/api/suggestions?${params.toString()}`);
  },
};

/**
 * Progress API
 */
export const progressAPI = {
  getStats: (): Promise<ProgressStats> => fetchAPI("/api/progress"),
};

