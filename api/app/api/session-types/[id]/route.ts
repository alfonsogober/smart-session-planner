/**
 * API route for individual session type operations
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateSessionTypeRequest } from "@/app/model/types";

/**
 * GET /api/session-types/[id]
 * Fetch a single session type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionType = await prisma.sessionType.findUnique({
      where: { id },
      include: {
        sessions: true,
      },
    });

    if (!sessionType) {
      return NextResponse.json(
        { error: "Session type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(sessionType);
  } catch (error) {
    console.error("Error fetching session type:", error);
    return NextResponse.json(
      { error: "Failed to fetch session type" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/session-types/[id]
 * Update a session type
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateSessionTypeRequest = await request.json();

    if (body.priority !== undefined && (body.priority < 1 || body.priority > 5)) {
      return NextResponse.json(
        { error: "Priority must be between 1 and 5" },
        { status: 400 }
      );
    }

    const sessionType = await prisma.sessionType.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.category && { category: body.category }),
        ...(body.priority !== undefined && { priority: body.priority }),
      },
    });

    return NextResponse.json(sessionType);
  } catch (error) {
    console.error("Error updating session type:", error);
    return NextResponse.json(
      { error: "Failed to update session type" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/session-types/[id]
 * Delete a session type
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.sessionType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session type:", error);
    return NextResponse.json(
      { error: "Failed to delete session type" },
      { status: 500 }
    );
  }
}

