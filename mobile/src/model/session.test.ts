/**
 * Tests for session model utilities
 */
import { isUpcoming, isTodaySession, getTodaySessions, getUpcomingSessions, getWeekSessions, groupSessionsByDay, formatSessionTime, getSessionTypeColor } from "./session";
import { Session } from "./types";
import { addDays, addHours, subDays } from "date-fns";

describe("session model utilities", () => {
  const mockSessionType = {
    id: "type-1",
    name: "Deep Work",
    category: "Work",
    priority: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("should identify upcoming sessions", () => {
    const futureSession: Session = {
      id: "session-1",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: addDays(new Date(), 1).toISOString(),
      endTime: addDays(new Date(), 1.5).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(isUpcoming(futureSession)).toBe(true);
  });

  it("should not identify completed sessions as upcoming", () => {
    const completedSession: Session = {
      id: "session-1",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: addDays(new Date(), 1).toISOString(),
      endTime: addDays(new Date(), 1.5).toISOString(),
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(isUpcoming(completedSession)).toBe(false);
  });

  it("should not identify past sessions as upcoming", () => {
    const pastSession: Session = {
      id: "session-1",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: subDays(new Date(), 1).toISOString(),
      endTime: subDays(new Date(), 0.5).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(isUpcoming(pastSession)).toBe(false);
  });

  it("should filter today's sessions", () => {
    const todaySession: Session = {
      id: "session-1",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: new Date().toISOString(),
      endTime: addHours(new Date(), 1).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tomorrowSession: Session = {
      id: "session-2",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: addDays(new Date(), 1).toISOString(),
      endTime: addDays(new Date(), 1.5).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sessions = [todaySession, tomorrowSession];
    const todaySessions = getTodaySessions(sessions);

    expect(todaySessions).toHaveLength(1);
    expect(todaySessions[0].id).toBe("session-1");
  });

  it("should get week sessions", () => {
    const todaySession: Session = {
      id: "session-1",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: new Date().toISOString(),
      endTime: addHours(new Date(), 1).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextWeekSession: Session = {
      id: "session-2",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: addDays(new Date(), 8).toISOString(),
      endTime: addDays(new Date(), 8.5).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sessions = [todaySession, nextWeekSession];
    const weekSessions = getWeekSessions(sessions);

    expect(weekSessions).toHaveLength(1);
    expect(weekSessions[0].id).toBe("session-1");
  });

  it("should group sessions by day", () => {
    const mondaySession: Session = {
      id: "session-1",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: new Date("2024-01-15T10:00:00Z").toISOString(), // Monday
      endTime: new Date("2024-01-15T11:00:00Z").toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tuesdaySession: Session = {
      id: "session-2",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: new Date("2024-01-16T10:00:00Z").toISOString(), // Tuesday
      endTime: new Date("2024-01-16T11:00:00Z").toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sessions = [mondaySession, tuesdaySession];
    const grouped = groupSessionsByDay(sessions);

    expect(Object.keys(grouped)).toContain("Monday");
    expect(Object.keys(grouped)).toContain("Tuesday");
    expect(grouped["Monday"]).toHaveLength(1);
    expect(grouped["Tuesday"]).toHaveLength(1);
  });

  it("should format session time correctly", () => {
    const session: Session = {
      id: "session-1",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: new Date("2024-01-15T09:00:00Z").toISOString(),
      endTime: new Date("2024-01-15T10:30:00Z").toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const formatted = formatSessionTime(session);
    expect(formatted).toMatch(/\d{1,2}:\d{2} (AM|PM)-\d{1,2}:\d{2} (AM|PM)/);
  });

  it("should get session type color", () => {
    const meditationType = { ...mockSessionType, name: "Morning Meditation" };
    expect(getSessionTypeColor(meditationType)).toBe("#A7F3D0");

    const deepWorkType = { ...mockSessionType, name: "Deep Work" };
    expect(getSessionTypeColor(deepWorkType)).toBe("#DDD6FE");

    const meetingType = { ...mockSessionType, name: "Client Meeting" };
    expect(getSessionTypeColor(meetingType)).toBe("#E5E7EB");

    const workoutType = { ...mockSessionType, name: "Workout" };
    expect(getSessionTypeColor(workoutType)).toBe("#A7F3D0");

    const languageType = { ...mockSessionType, name: "Language Learning" };
    expect(getSessionTypeColor(languageType)).toBe("#BFDBFE");
  });

  it("should get default color for unknown session types", () => {
    const unknownType = { ...mockSessionType, name: "Unknown", category: "Other" };
    expect(getSessionTypeColor(unknownType)).toBe("#E5E7EB");
  });
});
