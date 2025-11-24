/**
 * Session model utilities
 */
import * as R from "ramda";
import { Session, SessionType } from "./types";
import { format, parseISO, isToday, isPast, isFuture, startOfWeek, endOfWeek, isWithinInterval, getDay, isAfter, isBefore } from "date-fns";

/**
 * Check if a session is upcoming (future and not completed)
 */
export const isUpcoming = (session: Session): boolean => {
  const startTime = parseISO(session.startTime);
  return isFuture(startTime) && !session.completed;
};

/**
 * Check if a session is today
 */
export const isTodaySession = (session: Session): boolean => {
  return isToday(parseISO(session.startTime));
};

/**
 * Get sessions for today
 */
export const getTodaySessions = (sessions: Session[]): Session[] => {
  return R.filter(isTodaySession, sessions);
};

/**
 * Get upcoming sessions (future, not completed)
 */
export const getUpcomingSessions = (sessions: Session[]): Session[] => {
  return R.filter(isUpcoming, sessions);
};

/**
 * Get sessions for the current week (Sunday to Saturday)
 */
export const getWeekSessions = (sessions: Session[]): Session[] => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 }); // Saturday

  return R.filter((session: Session) => {
    const sessionDate = parseISO(session.startTime);
    return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
  }, sessions);
};

/**
 * Group sessions by day of the week
 */
export const groupSessionsByDay = (sessions: Session[]): Record<string, Session[]> => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const grouped = R.groupBy((session: Session) => daysOfWeek[getDay(parseISO(session.startTime))], sessions);

  // Ensure all days are present, even if empty, and maintain order
  return R.reduce(
    (acc, day) => R.assoc(day, grouped[day] || [], acc),
    {} as Record<string, Session[]>,
    daysOfWeek
  );
};

/**
 * Format session time range
 */
export const formatSessionTime = (session: Session): string => {
  const start = format(parseISO(session.startTime), "h:mm a");
  const end = format(parseISO(session.endTime), "h:mm a");
  return `${start} - ${end}`;
};

/**
 * Get color for session type
 */
export const getSessionTypeColor = (sessionType: SessionType): string => {
  const name = sessionType.name.toLowerCase();
  if (name.includes("meditation")) return "#A7F3D0";
  if (name.includes("deep work") || name.includes("deepwork")) return "#DDD6FE";
  if (name.includes("meeting")) return "#E5E7EB";
  if (name.includes("workout")) return "#A7F3D0";
  if (name.includes("language")) return "#BFDBFE";
  return "#E5E7EB";
};

/**
 * Check if two sessions overlap
 */
export const sessionsOverlap = (session1: Session, session2: Session): boolean => {
  const start1 = parseISO(session1.startTime);
  const end1 = parseISO(session1.endTime);
  const start2 = parseISO(session2.startTime);
  const end2 = parseISO(session2.endTime);

  return (
    (isAfter(start2, start1) && isBefore(start2, end1)) ||
    (isAfter(end2, start1) && isBefore(end2, end1)) ||
    (isBefore(start2, start1) && isAfter(end2, end1))
  );
};

/**
 * Find sessions that conflict with a given session
 */
export const findConflictingSessions = (session: Session, allSessions: Session[]): Session[] => {
  return R.filter((other: Session) => {
    if (other.id === session.id) return false;
    return sessionsOverlap(session, other);
  }, allSessions);
};
