/**
 * API route for generating smart session suggestions
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSuggestions } from "@/app/model/suggestion";

/**
 * GET /api/suggestions
 * Generate suggestions for a session type
 * Query params: sessionTypeId, durationMinutes (optional, default 60), lookAheadDays (optional, default 7)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionTypeId = searchParams.get("sessionTypeId");
    const durationMinutes = parseInt(searchParams.get("durationMinutes") || "60", 10);
    const lookAheadDays = parseInt(searchParams.get("lookAheadDays") || "7", 10);

    if (!sessionTypeId) {
      return NextResponse.json(
        { error: "sessionTypeId query parameter is required" },
        { status: 400 }
      );
    }

    // Fetch session type
    const sessionType = await prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
    });

    if (!sessionType) {
      return NextResponse.json(
        { error: "Session type not found" },
        { status: 404 }
      );
    }

    // Fetch existing sessions
    const existingSessions = await prisma.session.findMany({
      include: {
        sessionType: true,
      },
    });

    // Fetch availability windows
    const availabilityWindows = await prisma.availabilityWindow.findMany();

    // Generate suggestions
    const suggestions = generateSuggestions(
      sessionType,
      existingSessions,
      availabilityWindows,
      durationMinutes,
      lookAheadDays
    );

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

