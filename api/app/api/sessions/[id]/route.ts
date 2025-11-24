/**
 * API route for individual session operations
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateSessionRequest } from "@/app/model/types";
import { parseISO, isAfter } from "date-fns";

/**
 * GET /api/sessions/[id]
 * Fetch a single session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        sessionType: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/sessions/[id]
 * Update a session
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateSessionRequest = await request.json();

    const updateData: any = {};

    if (body.completed !== undefined) {
      updateData.completed = body.completed;
    }

    if (body.startTime && body.endTime) {
      const startTime = parseISO(body.startTime);
      const endTime = parseISO(body.endTime);

      if (!isAfter(endTime, startTime)) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 }
        );
      }

      // Check for conflicts (excluding current session)
      const conflictingSessions = await prisma.session.findMany({
        where: {
          id: { not: id },
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
          { error: "Updated time conflicts with existing sessions" },
          { status: 409 }
        );
      }

      updateData.startTime = startTime;
      updateData.endTime = endTime;
    }

    const session = await prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        sessionType: true,
      },
    });

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("Error updating session:", error);
    // Return more detailed error information
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update session", details: error },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions/[id]
 * Delete a session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.session.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}

