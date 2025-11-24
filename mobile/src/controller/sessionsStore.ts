/**
 * Centralized sessions state store using AsyncStorage as cache
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, CreateSessionRequest } from "../model/types";
import { sessionsAPI } from "./api";

const SESSIONS_STORAGE_KEY = "@sessions_cache";
const SESSIONS_TIMESTAMP_KEY = "@sessions_cache_timestamp";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

type SessionsStoreListener = (sessions: Session[]) => void;

class SessionsStore {
  private sessions: Session[] = [];
  private listeners: Set<SessionsStoreListener> = new Set();
  private isInitialized = false;
  private syncPromise: Promise<void> | null = null;

  /**
   * Initialize the store by loading from cache and syncing with server
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Load from cache first for instant display
    await this.loadFromCache();
    
    // Sync with server in background
    this.syncWithServer();
    
    this.isInitialized = true;
  }

  /**
   * Load sessions from AsyncStorage cache
   */
  private async loadFromCache(): Promise<void> {
    try {
      const cachedData = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
      if (cachedData) {
        this.sessions = JSON.parse(cachedData);
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to load sessions from cache:", error);
    }
  }

  /**
   * Save sessions to AsyncStorage cache
   */
  private async saveToCache(sessions: Session[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      await AsyncStorage.setItem(SESSIONS_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error("Failed to save sessions to cache:", error);
    }
  }

  /**
   * Sync sessions with server
   */
  async syncWithServer(): Promise<void> {
    // Prevent concurrent syncs
    if (this.syncPromise) {
      return this.syncPromise;
    }

    this.syncPromise = (async () => {
      try {
        const serverSessions = await sessionsAPI.getAll();
        this.sessions = serverSessions;
        await this.saveToCache(serverSessions);
        this.notifyListeners();
      } catch (error) {
        console.error("Failed to sync sessions with server:", error);
        throw error;
      } finally {
        this.syncPromise = null;
      }
    })();

    return this.syncPromise;
  }

  /**
   * Check if cache is stale and needs refresh
   */
  private async isCacheStale(): Promise<boolean> {
    try {
      const timestampStr = await AsyncStorage.getItem(SESSIONS_TIMESTAMP_KEY);
      if (!timestampStr) return true;
      
      const timestamp = parseInt(timestampStr, 10);
      return Date.now() - timestamp > CACHE_DURATION;
    } catch {
      return true;
    }
  }

  /**
   * Get all sessions (from cache, sync if stale)
   */
  async getSessions(): Promise<Session[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Sync if cache is stale
    const stale = await this.isCacheStale();
    if (stale) {
      // Sync in background, return cached data immediately
      this.syncWithServer().catch(console.error);
    }

    return [...this.sessions];
  }

  /**
   * Create a new session
   */
  async createSession(data: CreateSessionRequest): Promise<Session> {
    const newSession = await sessionsAPI.create(data);
    
    // Update local state immediately
    this.sessions = [...this.sessions, newSession];
    await this.saveToCache(this.sessions);
    this.notifyListeners();
    
    return newSession;
  }

  /**
   * Update an existing session
   */
  async updateSession(id: string, data: { completed?: boolean; startTime?: string; endTime?: string }): Promise<Session> {
    const updatedSession = await sessionsAPI.update(id, data);
    
    // Update local state immediately
    this.sessions = this.sessions.map(s => s.id === id ? updatedSession : s);
    await this.saveToCache(this.sessions);
    this.notifyListeners();
    
    return updatedSession;
  }

  /**
   * Delete a session
   */
  async deleteSession(id: string): Promise<void> {
    await sessionsAPI.delete(id);
    
    // Update local state immediately
    this.sessions = this.sessions.filter(s => s.id !== id);
    await this.saveToCache(this.sessions);
    this.notifyListeners();
  }

  /**
   * Subscribe to sessions changes
   */
  subscribe(listener: SessionsStoreListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    const sessionsCopy = [...this.sessions];
    this.listeners.forEach(listener => {
      try {
        listener(sessionsCopy);
      } catch (error) {
        console.error("Error in sessions store listener:", error);
      }
    });
  }

  /**
   * Get current sessions synchronously (from memory)
   */
  getCurrentSessions(): Session[] {
    return [...this.sessions];
  }

  /**
   * Force a refresh from server
   */
  async refresh(): Promise<void> {
    await this.syncWithServer();
  }
}

// Export singleton instance
export const sessionsStore = new SessionsStore();

