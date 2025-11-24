/**
 * API route for individual availability window operations
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/availability/[id]
 * Delete an availability window
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.availabilityWindow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting availability window:", error);
    return NextResponse.json(
      { error: "Failed to delete availability window" },
      { status: 500 }
    );
  }
}

