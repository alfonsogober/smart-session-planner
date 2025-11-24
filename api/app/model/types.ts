/**
 * Type definitions for the application domain models
 * Types are inferred from Prisma models where possible
 */
import { SessionType, Session, AvailabilityWindow } from "@prisma/client";

export type SessionTypeModel = SessionType;
export type SessionModel = Session & {
  sessionType: SessionTypeModel;
};
export type AvailabilityWindowModel = AvailabilityWindow;

/**
 * Request/Response types for API endpoints
 */
export type CreateSessionTypeRequest = {
  name: string;
  category: string;
  priority: number;
};

export type UpdateSessionTypeRequest = Partial<CreateSessionTypeRequest>;

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

export type UpdateSessionRequest = {
  completed?: boolean;
  startTime?: string;
  endTime?: string;
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

