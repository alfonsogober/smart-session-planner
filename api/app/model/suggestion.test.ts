/**
 * Tests for suggestion algorithm
 */
import { generateSuggestions } from "./suggestion";
import { SessionTypeModel, SessionModel, AvailabilityWindowModel } from "./types";

describe("generateSuggestions", () => {
  const mockSessionType: SessionTypeModel = {
    id: "type-1",
    name: "Deep Work",
    category: "Work",
    priority: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    sessions: [],
  };

  const mockAvailabilityWindows: AvailabilityWindowModel[] = [
    {
      id: "avail-1",
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("should generate suggestions when no existing sessions", () => {
    const suggestions = generateSuggestions(
      mockSessionType,
      [],
      mockAvailabilityWindows,
      60,
      7
    );

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].sessionTypeId).toBe(mockSessionType.id);
  });

  it("should avoid conflicts with existing sessions", () => {
    const existingSession: SessionModel = {
      id: "session-1",
      sessionTypeId: "type-2",
      sessionType: {
        id: "type-2",
        name: "Meeting",
        category: "Work",
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        sessions: [],
      },
      startTime: new Date("2024-01-15T10:00:00Z"),
      endTime: new Date("2024-01-15T11:00:00Z"),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const suggestions = generateSuggestions(
      mockSessionType,
      [existingSession],
      mockAvailabilityWindows,
      60,
      7
    );

    // Verify no suggestions overlap with existing session
    suggestions.forEach((suggestion) => {
      const suggestionStart = new Date(suggestion.startTime);
      const suggestionEnd = new Date(suggestion.endTime);
      
      const overlaps =
        (suggestionStart >= existingSession.startTime &&
          suggestionStart < existingSession.endTime) ||
        (suggestionEnd > existingSession.startTime &&
          suggestionEnd <= existingSession.endTime);

      expect(overlaps).toBe(false);
    });
  });

  it("should prioritize better spaced sessions", () => {
    const existingSession: SessionModel = {
      id: "session-1",
      sessionTypeId: "type-2",
      sessionType: {
        id: "type-2",
        name: "Meeting",
        category: "Work",
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        sessions: [],
      },
      startTime: new Date("2024-01-15T10:00:00Z"),
      endTime: new Date("2024-01-15T11:00:00Z"),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const suggestions = generateSuggestions(
      mockSessionType,
      [existingSession],
      mockAvailabilityWindows,
      60,
      7
    );

    // Top suggestion should have better spacing
    if (suggestions.length > 1) {
      expect(suggestions[0].score).toBeGreaterThanOrEqual(suggestions[1].score);
    }
  });

  it("should respect availability windows", () => {
    const suggestions = generateSuggestions(
      mockSessionType,
      [],
      mockAvailabilityWindows,
      60,
      7
    );

    suggestions.forEach((suggestion) => {
      const startTime = new Date(suggestion.startTime);
      const hour = startTime.getHours();
      const dayOfWeek = startTime.getDay();

      // Should be within availability window
      if (dayOfWeek === 1) {
        expect(hour).toBeGreaterThanOrEqual(9);
        expect(hour).toBeLessThan(17);
      }
    });
  });
});

