/**
 * Tests for progress statistics calculation
 */
import { calculateProgressStats } from "./progress";
import { SessionModel } from "./types";

describe("calculateProgressStats", () => {
  const mockSessionType = {
    id: "type-1",
    name: "Deep Work",
    category: "Work",
    priority: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    sessions: [],
  };

  it("should calculate basic stats correctly", () => {
    const sessions: SessionModel[] = [
      {
        id: "session-1",
        sessionTypeId: "type-1",
        sessionType: mockSessionType,
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T11:00:00Z"),
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "session-2",
        sessionTypeId: "type-1",
        sessionType: mockSessionType,
        startTime: new Date("2024-01-16T10:00:00Z"),
        endTime: new Date("2024-01-16T11:00:00Z"),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const stats = calculateProgressStats(sessions);

    expect(stats.totalScheduled).toBe(2);
    expect(stats.totalCompleted).toBe(1);
    expect(stats.completionRate).toBe(50);
  });

  it("should handle empty sessions array", () => {
    const stats = calculateProgressStats([]);

    expect(stats.totalScheduled).toBe(0);
    expect(stats.totalCompleted).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.sessionsByType).toEqual([]);
    expect(stats.averageSpacing).toBe(0);
  });

  it("should calculate sessions by type", () => {
    const sessionType2 = {
      ...mockSessionType,
      id: "type-2",
      name: "Workout",
    };

    const sessions: SessionModel[] = [
      {
        id: "session-1",
        sessionTypeId: "type-1",
        sessionType: mockSessionType,
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T11:00:00Z"),
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "session-2",
        sessionTypeId: "type-1",
        sessionType: mockSessionType,
        startTime: new Date("2024-01-16T10:00:00Z"),
        endTime: new Date("2024-01-16T11:00:00Z"),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "session-3",
        sessionTypeId: "type-2",
        sessionType: sessionType2,
        startTime: new Date("2024-01-17T10:00:00Z"),
        endTime: new Date("2024-01-17T11:00:00Z"),
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const stats = calculateProgressStats(sessions);

    expect(stats.sessionsByType).toHaveLength(2);
    expect(stats.sessionsByType[0].count).toBe(2); // type-1 has 2 sessions
    expect(stats.sessionsByType[1].count).toBe(1); // type-2 has 1 session
  });
});

