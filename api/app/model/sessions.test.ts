/**
 * Tests for session model logic
 */
import { SessionModel } from "./types";

describe("Session model", () => {
  const mockSessionType = {
    id: "type-1",
    name: "Deep Work",
    category: "Work",
    priority: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    sessions: [],
  };

  it("should have valid time range", () => {
    const session: SessionModel = {
      id: "session-1",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: new Date("2024-01-15T10:00:00Z"),
      endTime: new Date("2024-01-15T11:00:00Z"),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(session.endTime.getTime()).toBeGreaterThan(session.startTime.getTime());
  });

  it("should detect overlapping sessions", () => {
    const session1: SessionModel = {
      id: "session-1",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: new Date("2024-01-15T10:00:00Z"),
      endTime: new Date("2024-01-15T11:00:00Z"),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session2: SessionModel = {
      id: "session-2",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: new Date("2024-01-15T10:30:00Z"),
      endTime: new Date("2024-01-15T11:30:00Z"),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if sessions overlap
    const overlaps =
      (session2.startTime >= session1.startTime && session2.startTime < session1.endTime) ||
      (session2.endTime > session1.startTime && session2.endTime <= session1.endTime) ||
      (session2.startTime <= session1.startTime && session2.endTime >= session1.endTime);

    expect(overlaps).toBe(true);
  });

  it("should detect non-overlapping sessions", () => {
    const session1: SessionModel = {
      id: "session-1",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: new Date("2024-01-15T10:00:00Z"),
      endTime: new Date("2024-01-15T11:00:00Z"),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session2: SessionModel = {
      id: "session-2",
      sessionTypeId: "type-1",
      sessionType: mockSessionType,
      startTime: new Date("2024-01-15T12:00:00Z"),
      endTime: new Date("2024-01-15T13:00:00Z"),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if sessions overlap
    const overlaps =
      (session2.startTime >= session1.startTime && session2.startTime < session1.endTime) ||
      (session2.endTime > session1.startTime && session2.endTime <= session1.endTime) ||
      (session2.startTime <= session1.startTime && session2.endTime >= session1.endTime);

    expect(overlaps).toBe(false);
  });
});

