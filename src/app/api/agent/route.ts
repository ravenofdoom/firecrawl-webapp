import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFirecrawlClient } from "@/lib/firecrawl";

// Increase max duration for agent requests (Vercel)
export const maxDuration = 300; // 5 minutes

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

    // Agent configuration with longer timeout
    const agentArgs: {
      prompt: string;
      urls?: string[];
      timeout?: number;
      pollInterval?: number;
    } = {
      prompt,
      timeout: 300, // 5 minutes timeout
      pollInterval: 2000, // Poll every 2 seconds
    };

    // Add URLs if provided (optional for agent)
    if (urls) {
      const urlList = Array.isArray(urls) ? urls : [urls];
      const filteredUrls = urlList.filter((u: string) => u.trim());
      if (filteredUrls.length > 0) {
        agentArgs.urls = filteredUrls;
      }
    }

    console.log("Starting agent with args:", JSON.stringify(agentArgs, null, 2));

    // Use the agent method - it polls until complete
    const agentResult = await firecrawl.agent(agentArgs);

    console.log("Agent result:", JSON.stringify(agentResult, null, 2));

    return NextResponse.json({
      success: true,
      data: agentResult,
    });
  } catch (error) {
    console.error("Agent error:", error);

    // Provide more detailed error information
    const errorMessage = error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : "Agent request failed";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
