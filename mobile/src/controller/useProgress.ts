/**
 * Hook for fetching progress statistics
 */
import { useState, useEffect, useCallback } from "react";
import { ProgressStats } from "../model/types";
import { progressAPI } from "./api";
import { sessionsStore } from "./sessionsStore";

/**
 * Hook return type
 */
export type UseProgressReturn = {
  stats: ProgressStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Hook for fetching progress statistics
 * Automatically refetches when sessions change
 */
export const useProgress = (): UseProgressReturn => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await progressAPI.getStats();
      console.log("Progress stats fetched:", data);
      setStats(data);
    } catch (err) {
      console.error("Error fetching progress stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch progress");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Subscribe to sessions store changes to auto-refetch progress
  useEffect(() => {
    const unsubscribe = sessionsStore.subscribe(() => {
      // When sessions change, refetch progress stats
      fetchStats();
    });

    return unsubscribe;
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

