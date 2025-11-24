/**
 * Progress statistics calculation
 * Computes derived metrics from session data
 */
import * as R from "ramda";
import { SessionModel } from "./types";
import { ProgressStats } from "./types";
import { differenceInHours } from "date-fns";

/**
 * Calculate average spacing between all scheduled sessions
 */
const calculateAverageSpacing = (sessions: SessionModel[]): number => {
  // Calculate spacing between all sessions, not just completed ones
  if (sessions.length < 2) return 0;

  const sortedSessions = R.sortBy(
    (session: SessionModel) => new Date(session.startTime).getTime(),
    sessions
  );

  const spacings = R.pipe(
    R.aperture(2),
    R.map(([prev, curr]: SessionModel[]) => {
      const prevEnd = new Date(prev.endTime);
      const currStart = new Date(curr.startTime);
      return differenceInHours(currStart, prevEnd);
    })
  )(sortedSessions);

  if (spacings.length === 0) return 0;

  const totalSpacing = R.sum(spacings);
  return totalSpacing / spacings.length / 24; // Convert to days
};

/**
 * Calculate sessions breakdown by type
 */
const calculateSessionsByType = (
  sessions: SessionModel[]
): Array<{ sessionTypeId: string; sessionTypeName: string; count: number }> => {
  const grouped = R.groupBy(
    (session: SessionModel) => session.sessionTypeId,
    sessions
  );

  return R.pipe(
    R.toPairs,
    R.map(([sessionTypeId, sessionList]) => {
      const firstSession = sessionList[0];
      return {
        sessionTypeId,
        sessionTypeName: firstSession.sessionType.name,
        count: sessionList.length,
      };
    }),
    R.sortBy((item) => -item.count)
  )(grouped);
};

/**
 * Calculate overall progress statistics
 * 
 * @param sessions - All sessions to analyze
 * @returns Progress statistics object
 */
export const calculateProgressStats = (sessions: SessionModel[]): ProgressStats => {
  const totalScheduled = sessions.length;
  const totalCompleted = R.filter(
    (session: SessionModel) => session.completed,
    sessions
  ).length;

  const completionRate =
    totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  const sessionsByType = calculateSessionsByType(sessions);
  const averageSpacing = calculateAverageSpacing(sessions);

  return {
    totalScheduled,
    totalCompleted,
    completionRate,
    sessionsByType,
    averageSpacing: Math.round(averageSpacing * 10) / 10, // Round to 1 decimal
  };
};

