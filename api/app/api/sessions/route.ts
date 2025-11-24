/**
 * API route for sessions CRUD operations
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateSessionRequest } from "@/app/model/types";
import { parseISO, isAfter } from "date-fns";

/**
 * GET /api/sessions
 * Fetch all sessions with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const completed = searchParams.get("completed");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (completed !== null) {
      where.completed = completed === "true";
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        sessionType: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions
 * Create a new session
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json();

    // Validate session type exists
    const sessionType = await prisma.sessionType.findUnique({
      where: { id: body.sessionTypeId },
    });

    if (!sessionType) {
      return NextResponse.json(
        { error: "Session type not found" },
        { status: 404 }
      );
    }

    // Validate dates
    const startTime = parseISO(body.startTime);
    const endTime = parseISO(body.endTime);

    if (!isAfter(endTime, startTime)) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check for conflicts
    const conflictingSessions = await prisma.session.findMany({
      where: {
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
      },
    });

    if (conflictingSessions.length > 0) {
      return NextResponse.json(
        { error: "Session conflicts with existing sessions", conflicts: conflictingSessions },
        { status: 409 }
      );
    }

    const session = await prisma.session.create({
      data: {
        sessionTypeId: body.sessionTypeId,
        startTime,
        endTime,
      },
      include: {
        sessionType: true,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

