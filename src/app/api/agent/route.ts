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
    const { prompt, urls } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "A prompt describing what you want to find is required" },
        { status: 400 }
      );
    }

    const firecrawl = getFirecrawlClient();

    // Agent can work with just a prompt, URLs are optional
    const agentArgs: {
      prompt: string;
      urls?: string[];
    } = {
      prompt,
    };

    // Add URLs if provided (optional for agent)
    if (urls) {
      const urlList = Array.isArray(urls) ? urls : [urls];
      const filteredUrls = urlList.filter((u: string) => u.trim());
      if (filteredUrls.length > 0) {
        agentArgs.urls = filteredUrls;
      }
    }

    // Use the agent method
    const agentResult = await firecrawl.agent(agentArgs);

    return NextResponse.json({
      success: true,
      data: agentResult,
    });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Agent request failed",
      },
      { status: 500 }
    );
  }
}
