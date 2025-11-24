/**
 * API route for session types CRUD operations
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateSessionTypeRequest, UpdateSessionTypeRequest } from "@/app/model/types";

/**
 * GET /api/session-types
 * Fetch all session types
 */
export async function GET() {
  try {
    const sessionTypes = await prisma.sessionType.findMany({
      include: {
        sessions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sessionTypes);
  } catch (error) {
    console.error("Error fetching session types:", error);
    return NextResponse.json(
      { error: "Failed to fetch session types" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/session-types
 * Create a new session type
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionTypeRequest = await request.json();

    // Validate priority range
    if (body.priority < 1 || body.priority > 5) {
      return NextResponse.json(
        { error: "Priority must be between 1 and 5" },
        { status: 400 }
      );
    }

    const sessionType = await prisma.sessionType.create({
      data: {
        name: body.name,
        category: body.category,
        priority: body.priority,
      },
    });

    return NextResponse.json(sessionType, { status: 201 });
  } catch (error) {
    console.error("Error creating session type:", error);
    return NextResponse.json(
      { error: "Failed to create session type" },
      { status: 500 }
    );
  }
}

