/**
 * Hook for managing availability windows
 */
import { useState, useEffect, useCallback } from "react";
import { AvailabilityWindow, CreateAvailabilityWindowRequest } from "../model/types";
import { availabilityAPI } from "./api";

/**
 * Hook return type
 */
export type UseAvailabilityReturn = {
  windows: AvailabilityWindow[];
  loading: boolean;
  error: string | null;
  createWindow: (data: CreateAvailabilityWindowRequest) => Promise<void>;
  deleteWindow: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
};

/**
 * Hook for fetching and managing availability windows
 */
export const useAvailability = (): UseAvailabilityReturn => {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWindows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await availabilityAPI.getAll();
      setWindows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch availability windows");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWindows();
  }, [fetchWindows]);

  const createWindow = useCallback(async (data: CreateAvailabilityWindowRequest) => {
    try {
      await availabilityAPI.create(data);
      // Refetch to ensure we have the latest data from the server
      await fetchWindows();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to create availability window");
    }
  }, [fetchWindows]);

  const deleteWindow = useCallback(async (id: string) => {
    try {
      await availabilityAPI.delete(id);
      // Refetch to ensure we have the latest data from the server
      await fetchWindows();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to delete availability window");
    }
  }, [fetchWindows]);

  return {
    windows,
    loading,
    error,
    createWindow,
    deleteWindow,
    refetch: fetchWindows,
  };
};

