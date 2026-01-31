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
    const { url, limit = 10 } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const firecrawl = getFirecrawlClient();

    // Start crawl job
    const crawlResult = await firecrawl.crawl(url, {
      limit,
      scrapeOptions: {
        formats: ["markdown"],
      },
    });

    return NextResponse.json({
      success: true,
      data: crawlResult,
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Crawl failed",
      },
      { status: 500 }
    );
  }
}
