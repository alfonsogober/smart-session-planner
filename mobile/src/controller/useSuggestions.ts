/**
 * Hook for fetching session suggestions
 */
import { useState, useCallback } from "react";
import { SessionSuggestion } from "../model/types";
import { suggestionsAPI } from "./api";

/**
 * Hook return type
 */
export type UseSuggestionsReturn = {
  suggestions: SessionSuggestion[];
  loading: boolean;
  error: string | null;
  fetchSuggestions: (sessionTypeId: string, durationMinutes?: number, lookAheadDays?: number) => Promise<void>;
  fetchAllSuggestions: (sessionTypeIds: string[], durationMinutes?: number, lookAheadDays?: number) => Promise<void>;
};

/**
 * Hook for fetching smart session suggestions
 */
export const useSuggestions = (): UseSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<SessionSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (
    sessionTypeId: string,
    durationMinutes: number = 60,
    lookAheadDays: number = 7
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await suggestionsAPI.getSuggestions(sessionTypeId, durationMinutes, lookAheadDays);
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllSuggestions = useCallback(async (
    sessionTypeIds: string[],
    durationMinutes: number = 60,
    lookAheadDays: number = 7
  ) => {
    if (sessionTypeIds.length === 0) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch suggestions for all session types in parallel
      const allPromises = sessionTypeIds.map(id => 
        suggestionsAPI.getSuggestions(id, durationMinutes, lookAheadDays).catch(() => [])
      );
      
      const allResults = await Promise.all(allPromises);
      
      // Combine and sort by score, take top suggestions
      const combined = allResults.flat();
      const sorted = combined
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Top 5 suggestions
      
      setSuggestions(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions,
    fetchAllSuggestions,
  };
};

