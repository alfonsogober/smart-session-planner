/**
 * Type definitions for the mobile application
 * Types are inferred from API responses where possible
 */

export type SessionType = {
  id: string;
  name: string;
  category: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

export type AvailabilityWindow = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  sessionTypeId: string;
  sessionType: SessionType;
  startTime: string;
  endTime: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SessionSuggestion = {
  sessionTypeId: string;
  startTime: string;
  endTime: string;
  reason: string;
  score: number;
};

export type ProgressStats = {
  totalScheduled: number;
  totalCompleted: number;
  completionRate: number;
  sessionsByType: Array<{
    sessionTypeId: string;
    sessionTypeName: string;
    count: number;
  }>;
  averageSpacing: number;
};

export type CreateSessionTypeRequest = {
  name: string;
  category: string;
  priority: number;
};

export type CreateAvailabilityWindowRequest = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type CreateSessionRequest = {
  sessionTypeId: string;
  startTime: string;
  endTime: string;
};

