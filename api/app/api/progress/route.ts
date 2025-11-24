/**
 * API route for progress statistics
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateProgressStats } from "@/app/model/progress";

/**
 * GET /api/progress
 * Calculate and return progress statistics
 */
export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        sessionType: true,
      },
    });

    const stats = calculateProgressStats(sessions);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error calculating progress:", error);
    return NextResponse.json(
      { error: "Failed to calculate progress" },
      { status: 500 }
    );
  }
}

