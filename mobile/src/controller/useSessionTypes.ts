/**
 * Hook for managing session types
 */
import { useState, useEffect, useCallback } from "react";
import { SessionType, CreateSessionTypeRequest } from "../model/types";
import { sessionTypesAPI } from "./api";

/**
 * Hook return type
 */
export type UseSessionTypesReturn = {
  sessionTypes: SessionType[];
  loading: boolean;
  error: string | null;
  createSessionType: (data: CreateSessionTypeRequest) => Promise<void>;
  updateSessionType: (id: string, data: Partial<CreateSessionTypeRequest>) => Promise<void>;
  deleteSessionType: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
};

/**
 * Hook for fetching and managing session types
 */
export const useSessionTypes = (): UseSessionTypesReturn => {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sessionTypesAPI.getAll();
      setSessionTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch session types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessionTypes();
  }, [fetchSessionTypes]);

  const createSessionType = useCallback(async (data: CreateSessionTypeRequest) => {
    try {
      await sessionTypesAPI.create(data);
      // Refetch to ensure we have the latest data from the server
      await fetchSessionTypes();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to create session type");
    }
  }, [fetchSessionTypes]);

  const updateSessionType = useCallback(async (id: string, data: Partial<CreateSessionTypeRequest>) => {
    try {
      await sessionTypesAPI.update(id, data);
      // Refetch to ensure we have the latest data from the server
      await fetchSessionTypes();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to update session type");
    }
  }, [fetchSessionTypes]);

  const deleteSessionType = useCallback(async (id: string) => {
    try {
      await sessionTypesAPI.delete(id);
      // Refetch to ensure we have the latest data from the server
      await fetchSessionTypes();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to delete session type");
    }
  }, [fetchSessionTypes]);

  return {
    sessionTypes,
    loading,
    error,
    createSessionType,
    updateSessionType,
    deleteSessionType,
    refetch: fetchSessionTypes,
  };
};

