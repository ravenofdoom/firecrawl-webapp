import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFirecrawlClient } from "@/lib/firecrawl";

// Increase max duration for agent requests (Vercel)
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  const startTime = Date.now();

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

    if (prompt.length < 10) {
      return NextResponse.json(
        { error: "Prompt must be at least 10 characters" },
        { status: 400 }
      );
    }

    const firecrawl = getFirecrawlClient();

    // Agent configuration
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

    console.log("[Agent] Starting with args:", JSON.stringify(agentArgs, null, 2));

    // Use the agent method
    const agentResult = await firecrawl.agent(agentArgs);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Agent] Completed in ${duration}s. Result:`, JSON.stringify(agentResult, null, 2));

    // Handle different response structures - cast through unknown first
    const result = agentResult as unknown as Record<string, unknown>;

    // Extract the output/data from various possible locations
    let output = result.output || result.data || result.result || result.markdown || result.content;

    // If the result itself is the output (string), use it directly
    if (!output && typeof result === 'object') {
      // Check if there's meaningful data in the result
      if (result.success !== undefined) {
        output = result;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        output: output,
        raw: result,
        duration: `${duration}s`,
        creditsUsed: result.creditsUsed,
      },
    });
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[Agent] Error after ${duration}s:`, error);

    // Provide more detailed error information
    let errorMessage = "Agent request failed";

    if (error instanceof Error) {
      errorMessage = error.message;
      // Log stack trace for debugging
      console.error("[Agent] Stack:", error.stack);
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration: `${duration}s`,
      },
      { status: 500 }
    );
  }
}
