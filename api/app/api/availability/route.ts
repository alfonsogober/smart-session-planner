/**
 * API route for availability windows CRUD operations
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateAvailabilityWindowRequest } from "@/app/model/types";

/**
 * GET /api/availability
 * Fetch all availability windows
 */
export async function GET() {
  try {
    const windows = await prisma.availabilityWindow.findMany({
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json(windows);
  } catch (error) {
    console.error("Error fetching availability windows:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability windows" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability
 * Create a new availability window
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateAvailabilityWindowRequest = await request.json();

    // Validate day of week
    if (body.dayOfWeek < 0 || body.dayOfWeek > 6) {
      return NextResponse.json(
        { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(body.startTime) || !timeRegex.test(body.endTime)) {
      return NextResponse.json(
        { error: "Time must be in HH:mm format" },
        { status: 400 }
      );
    }

    // Validate start < end
    if (body.startTime >= body.endTime) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    const window = await prisma.availabilityWindow.create({
      data: {
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
      },
    });

    return NextResponse.json(window, { status: 201 });
  } catch (error) {
    console.error("Error creating availability window:", error);
    return NextResponse.json(
      { error: "Failed to create availability window" },
      { status: 500 }
    );
  }
}

