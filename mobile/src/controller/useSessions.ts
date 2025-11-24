/**
 * Hook for managing sessions using centralized store
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { Session, CreateSessionRequest } from "../model/types";
import { sessionsStore } from "./sessionsStore";
import { getTodaySessions, getUpcomingSessions, getWeekSessions } from "../model/session";

/**
 * Hook return type
 */
export type UseSessionsReturn = {
  sessions: Session[];
  todaySessions: Session[];
  weekSessions: Session[];
  upcomingSessions: Session[];
  loading: boolean;
  error: string | null;
  createSession: (data: CreateSessionRequest) => Promise<void>;
  updateSession: (id: string, data: { completed?: boolean; startTime?: string; endTime?: string }) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
};

/**
 * Hook for fetching and managing sessions
 * Uses centralized store that syncs with AsyncStorage cache
 */
export const useSessions = (): UseSessionsReturn => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize store and subscribe to changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize store (loads from cache immediately)
        await sessionsStore.initialize();
        
        // Get initial sessions from store
        const initialSessions = sessionsStore.getCurrentSessions();
        setSessions(initialSessions);
        
        // Subscribe to store changes
        unsubscribe = sessionsStore.subscribe((updatedSessions) => {
          setSessions(updatedSessions);
        });
        
        // Sync with server in background
        sessionsStore.syncWithServer().catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to sync sessions");
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize sessions");
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Memoize computed values to ensure they update when sessions change
  const todaySessions = useMemo(() => getTodaySessions(sessions), [sessions]);
  const weekSessions = useMemo(() => getWeekSessions(sessions), [sessions]);
  const upcomingSessions = useMemo(() => getUpcomingSessions(sessions), [sessions]);

  const createSession = useCallback(async (data: CreateSessionRequest) => {
    try {
      setError(null);
      await sessionsStore.createSession(data);
      // Store will notify listeners automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create session";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateSession = useCallback(async (id: string, data: { completed?: boolean; startTime?: string; endTime?: string }) => {
    try {
      setError(null);
      await sessionsStore.updateSession(id, data);
      // Store will notify listeners automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update session";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    try {
      setError(null);
      await sessionsStore.deleteSession(id);
      // Store will notify listeners automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete session";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      await sessionsStore.refresh();
      // Store will notify listeners automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refetch sessions");
    }
  }, []);

  return {
    sessions,
    todaySessions,
    weekSessions,
    upcomingSessions,
    loading,
    error,
    createSession,
    updateSession,
    deleteSession,
    refetch,
  };
};

