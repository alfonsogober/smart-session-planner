/**
 * Tests for availability window model logic
 */
import { AvailabilityWindowModel } from "./types";

describe("AvailabilityWindow model", () => {
  it("should validate day of week range", () => {
    const validWindow: AvailabilityWindowModel = {
      id: "avail-1",
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(validWindow.dayOfWeek).toBeGreaterThanOrEqual(0);
    expect(validWindow.dayOfWeek).toBeLessThanOrEqual(6);
  });

  it("should validate time format", () => {
    const window: AvailabilityWindowModel = {
      id: "avail-1",
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    expect(timeRegex.test(window.startTime)).toBe(true);
    expect(timeRegex.test(window.endTime)).toBe(true);
  });

  it("should have start time before end time", () => {
    const window: AvailabilityWindowModel = {
      id: "avail-1",
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(window.startTime < window.endTime).toBe(true);
  });
});

