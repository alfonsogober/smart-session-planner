/**
 * Tests for session types model logic
 */
import { SessionTypeModel } from "./types";

describe("SessionType model", () => {
  it("should validate priority range", () => {
    const validType: SessionTypeModel = {
      id: "type-1",
      name: "Deep Work",
      category: "Work",
      priority: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      sessions: [],
    };

    expect(validType.priority).toBeGreaterThanOrEqual(1);
    expect(validType.priority).toBeLessThanOrEqual(5);
  });

  it("should have required fields", () => {
    const type: SessionTypeModel = {
      id: "type-1",
      name: "Test",
      category: "Test",
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      sessions: [],
    };

    expect(type.id).toBeDefined();
    expect(type.name).toBeDefined();
    expect(type.category).toBeDefined();
    expect(type.priority).toBeDefined();
  });
});

