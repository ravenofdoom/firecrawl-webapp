import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFirecrawlClient } from "@/lib/firecrawl";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, search, limit = 100 } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const firecrawl = getFirecrawlClient();

    const mapResult = await firecrawl.map(url, {
      search,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: mapResult,
    });
  } catch (error) {
    console.error("Map error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Map failed",
      },
      { status: 500 }
    );
  }
}
