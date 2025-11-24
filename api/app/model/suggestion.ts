/**
 * Smart session suggestion algorithm
 * Implements non-trivial heuristics for suggesting optimal session times
 */
import * as R from "ramda";
import { SessionModel, AvailabilityWindowModel, SessionTypeModel } from "./types";
import { SessionSuggestion } from "./types";
import { differenceInHours, addHours, parseISO, format, isAfter, isBefore } from "date-fns";

/**
 * Configuration constants for suggestion algorithm
 */
const MIN_SPACING_HOURS = 2; // Minimum hours between sessions
const IDEAL_SPACING_HOURS = 24; // Ideal spacing for high-priority sessions
const MAX_SESSIONS_PER_DAY = 4; // Maximum sessions before applying penalty
const HIGH_PRIORITY_THRESHOLD = 4; // Priority >= 4 is considered high priority

/**
 * Calculate spacing score between a proposed session and existing sessions
 * Higher score = better spacing
 */
const calculateSpacingScore = (
  proposedStart: Date,
  proposedEnd: Date,
  existingSessions: SessionModel[]
): number => {
  if (existingSessions.length === 0) return 100;

  const spacings = existingSessions.map((session) => {
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);
    
    // Calculate minimum distance to any existing session
    const distanceBefore = differenceInHours(proposedStart, sessionEnd);
    const distanceAfter = differenceInHours(sessionStart, proposedEnd);
    
    return Math.min(
      distanceBefore > 0 ? distanceBefore : Infinity,
      distanceAfter > 0 ? distanceAfter : Infinity
    );
  });

  const minSpacing = Math.min(...spacings);

  // Penalize if too close to existing sessions
  if (minSpacing < MIN_SPACING_HOURS) return 0;

  // Reward spacing close to ideal
  const spacingScore = Math.min(100, (minSpacing / IDEAL_SPACING_HOURS) * 100);
  
  return spacingScore;
};

/**
 * Calculate priority-based score
 * Higher priority sessions get better scores
 */
const calculatePriorityScore = (priority: number): number => {
  return (priority / 5) * 100;
};

/**
 * Calculate day load score (penalize days with too many sessions)
 */
const calculateDayLoadScore = (
  proposedDate: Date,
  existingSessions: SessionModel[]
): number => {
  const dayStart = new Date(proposedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(proposedDate);
  dayEnd.setHours(23, 59, 59, 999);

  const sessionsOnDay = existingSessions.filter((session) => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= dayStart && sessionDate <= dayEnd;
  });

  if (sessionsOnDay.length >= MAX_SESSIONS_PER_DAY) {
    return 20; // Heavy penalty
  }

  return 100 - sessionsOnDay.length * 15;
};

/**
 * Calculate availability score (how well the time fits user's availability)
 * If no availability windows exist, give a neutral score (50) instead of 0
 */
const calculateAvailabilityScore = (
  proposedStart: Date,
  proposedEnd: Date,
  availabilityWindows: AvailabilityWindowModel[]
): number => {
  const dayOfWeek = proposedStart.getDay();
  const startTimeStr = format(proposedStart, "HH:mm");
  const endTimeStr = format(proposedEnd, "HH:mm");

  const matchingWindows = availabilityWindows.filter(
    (window) => window.dayOfWeek === dayOfWeek
  );

  // If no availability windows exist, give neutral score
  if (matchingWindows.length === 0) return 50;

  // Check if proposed time fits within any availability window
  const fitsInWindow = matchingWindows.some((window) => {
    return startTimeStr >= window.startTime && endTimeStr <= window.endTime;
  });

  if (fitsInWindow) return 100;

  // Partial fit gets partial score
  const partialFit = matchingWindows.some((window) => {
    return (
      (startTimeStr >= window.startTime && startTimeStr < window.endTime) ||
      (endTimeStr > window.startTime && endTimeStr <= window.endTime)
    );
  });

  return partialFit ? 50 : 0;
};

/**
 * Calculate fatigue score (penalize clustering high-priority sessions)
 */
const calculateFatigueScore = (
  proposedStart: Date,
  sessionTypePriority: number,
  existingSessions: SessionModel[]
): number => {
  if (sessionTypePriority < HIGH_PRIORITY_THRESHOLD) return 100;

  // Look at sessions within 48 hours
  const windowStart = addHours(proposedStart, -48);
  const windowEnd = addHours(proposedStart, 48);

  const nearbyHighPrioritySessions = existingSessions.filter((session) => {
    const sessionDate = new Date(session.startTime);
    return (
      sessionDate >= windowStart &&
      sessionDate <= windowEnd &&
      session.sessionType.priority >= HIGH_PRIORITY_THRESHOLD
    );
  });

  // Penalize if too many high-priority sessions nearby
  if (nearbyHighPrioritySessions.length >= 3) return 30;
  if (nearbyHighPrioritySessions.length >= 2) return 60;

  return 100;
};

/**
 * Generate time slots for a given date and duration
 * If no availability windows exist, generate slots for reasonable hours (6 AM - 10 PM)
 */
const generateTimeSlots = (
  date: Date,
  durationMinutes: number,
  availabilityWindows: AvailabilityWindowModel[]
): Date[] => {
  const dayOfWeek = date.getDay();
  const windows = availabilityWindows.filter((w) => w.dayOfWeek === dayOfWeek);

  const slots: Date[] = [];

  if (windows.length === 0) {
    // No availability windows - generate slots for reasonable hours (6 AM - 10 PM)
    const defaultStart = new Date(date);
    defaultStart.setHours(6, 0, 0, 0);
    const defaultEnd = new Date(date);
    defaultEnd.setHours(22, 0, 0, 0);

    let currentTime = new Date(defaultStart);
    while (addHours(currentTime, durationMinutes / 60) <= defaultEnd) {
      slots.push(new Date(currentTime));
      currentTime = addHours(currentTime, 0.5);
    }
    return slots;
  }

  windows.forEach((window) => {
    const [startHour, startMinute] = window.startTime.split(":").map(Number);
    const [endHour, endMinute] = window.endTime.split(":").map(Number);

    const windowStart = new Date(date);
    windowStart.setHours(startHour, startMinute, 0, 0);

    const windowEnd = new Date(date);
    windowEnd.setHours(endHour, endMinute, 0, 0);

    // Generate slots every 30 minutes
    let currentTime = new Date(windowStart);
    while (addHours(currentTime, durationMinutes / 60) <= windowEnd) {
      slots.push(new Date(currentTime));
      currentTime = addHours(currentTime, 0.5);
    }
  });

  return slots;
};

/**
 * Score a potential session time slot
 */
const scoreTimeSlot = (
  startTime: Date,
  endTime: Date,
  sessionType: SessionTypeModel,
  existingSessions: SessionModel[],
  availabilityWindows: AvailabilityWindowModel[]
): number => {
  const spacingScore = calculateSpacingScore(startTime, endTime, existingSessions);
  const priorityScore = calculatePriorityScore(sessionType.priority);
  const dayLoadScore = calculateDayLoadScore(startTime, existingSessions);
  const availabilityScore = calculateAvailabilityScore(
    startTime,
    endTime,
    availabilityWindows
  );
  const fatigueScore = calculateFatigueScore(
    startTime,
    sessionType.priority,
    existingSessions
  );

  // Weighted combination of scores
  return (
    spacingScore * 0.3 +
    priorityScore * 0.15 +
    dayLoadScore * 0.2 +
    availabilityScore * 0.25 +
    fatigueScore * 0.1
  );
};

/**
 * Generate smart suggestions for a session type
 * 
 * @param sessionType - The type of session to suggest
 * @param existingSessions - All existing sessions
 * @param availabilityWindows - User's availability windows
 * @param durationMinutes - Duration of the session in minutes
 * @param lookAheadDays - How many days ahead to look (default 7)
 * @returns Array of session suggestions sorted by score
 */
export const generateSuggestions = (
  sessionType: SessionTypeModel,
  existingSessions: SessionModel[],
  availabilityWindows: AvailabilityWindowModel[],
  durationMinutes: number = 60,
  lookAheadDays: number = 7
): SessionSuggestion[] => {
  const suggestions: SessionSuggestion[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate suggestions for the next N days
  for (let dayOffset = 0; dayOffset < lookAheadDays; dayOffset++) {
    const date = addHours(today, dayOffset * 24);
    const timeSlots = generateTimeSlots(date, durationMinutes, availabilityWindows);

    timeSlots.forEach((startTime) => {
      const endTime = addHours(startTime, durationMinutes / 60);

      // Skip if this would conflict with existing sessions
      const conflicts = existingSessions.some((session) => {
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);
        return (
          (startTime >= sessionStart && startTime < sessionEnd) ||
          (endTime > sessionStart && endTime <= sessionEnd) ||
          (startTime <= sessionStart && endTime >= sessionEnd)
        );
      });

      if (conflicts) return;

      const score = scoreTimeSlot(
        startTime,
        endTime,
        sessionType,
        existingSessions,
        availabilityWindows
      );

      // Only include suggestions with reasonable scores
      if (score >= 30) {
        const reason = generateReason(
          startTime,
          score,
          sessionType.priority,
          existingSessions,
          sessionType.id
        );

        suggestions.push({
          sessionTypeId: sessionType.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          reason,
          score: Math.round(score),
        });
      }
    });
  }

  // Sort by score descending and return top suggestions
  return R.pipe(
    R.sortBy((s: SessionSuggestion) => -s.score),
    R.take(10)
  )(suggestions);
};

/**
 * Generate human-readable reason for a suggestion
 */
const generateReason = (
  startTime: Date,
  score: number,
  priority: number,
  existingSessions: SessionModel[],
  sessionTypeId: string
): string => {
  const reasons: string[] = [];

  // Check spacing from last session of the SAME TYPE (as per challenge requirement)
  const sameTypeSessions = existingSessions.filter(
    (session) => session.sessionTypeId === sessionTypeId
  );
  
  if (sameTypeSessions.length > 0) {
    const spacings = sameTypeSessions.map((session) => {
      const sessionEnd = new Date(session.endTime);
      return differenceInHours(startTime, sessionEnd);
    }).filter((h) => h > 0);

    if (spacings.length > 0) {
      const minSpacing = Math.min(...spacings);
      if (minSpacing >= 24) {
        const days = Math.round((minSpacing / 24) * 10) / 10; // Round to 1 decimal
        reasons.push(`Good spacing (${days} days since last ${sameTypeSessions[0].sessionType.name})`);
      } else {
        reasons.push(`Good spacing (${Math.round(minSpacing)} hours since last ${sameTypeSessions[0].sessionType.name})`);
      }
    }
  } else {
    // No previous sessions of this type
    reasons.push("First session of this type");
  }

  // Check if time fits within availability windows
  const hour = startTime.getHours();
  if (hour >= 6 && hour < 12) {
    reasons.push("Uses your morning focus window");
  } else if (hour >= 18 && hour < 22) {
    reasons.push("Uses your evening focus window");
  }

  // Check priority
  if (priority >= HIGH_PRIORITY_THRESHOLD) {
    reasons.push("High priority session");
  }

  return reasons.length > 0 ? reasons.join(". ") : "Good time slot available";
};

