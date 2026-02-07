import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Increase max duration for agent requests (Vercel)
export const maxDuration = 300; // 5 minutes

const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v2/agent";
const POLL_INTERVAL = 3000; // 3 seconds
const MAX_POLL_TIME = 270000; // 4.5 minutes (leave buffer for response)

interface AgentResponse {
  success: boolean;
  id?: string;
  status?: string;
  data?: unknown;
  creditsUsed?: number;
  error?: string;
}

async function startAgentJob(apiKey: string, prompt: string, urls?: string[]): Promise<AgentResponse> {
  const body: Record<string, unknown> = { prompt };
  if (urls && urls.length > 0) {
    body.urls = urls;
  }

  const response = await fetch(FIRECRAWL_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data;
}

async function pollAgentStatus(apiKey: string, jobId: string): Promise<AgentResponse> {
  const response = await fetch(`${FIRECRAWL_API_URL}/${jobId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  const data = await response.json();
  return data;
}

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

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "FIRECRAWL_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Parse URLs
    let urlList: string[] | undefined;
    if (urls) {
      const parsed = Array.isArray(urls) ? urls : [urls];
      urlList = parsed.filter((u: string) => u.trim());
      if (urlList.length === 0) urlList = undefined;
    }

    console.log("[Agent] Starting job with prompt:", prompt.substring(0, 100) + "...");
    if (urlList) console.log("[Agent] URLs:", urlList);

    // Start the agent job
    const startResult = await startAgentJob(apiKey, prompt, urlList);
    console.log("[Agent] Start result:", JSON.stringify(startResult, null, 2));

    // Check if job started successfully
    if (!startResult.success) {
      return NextResponse.json({
        success: false,
        error: startResult.error || "Failed to start agent job",
      }, { status: 500 });
    }

    // If the result is already complete (status === 'completed'), return it
    if (startResult.status === 'completed' || startResult.data) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[Agent] Completed immediately in ${duration}s`);
      return NextResponse.json({
        success: true,
        data: {
          output: startResult.data,
          creditsUsed: startResult.creditsUsed,
          duration: `${duration}s`,
        },
      });
    }

    // Poll for completion if we have a job ID
    const jobId = startResult.id;
    if (!jobId) {
      // No job ID and no data - return what we have
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      return NextResponse.json({
        success: true,
        data: {
          output: startResult,
          duration: `${duration}s`,
        },
      });
    }

    console.log(`[Agent] Job started with ID: ${jobId}, polling for completion...`);

    // Poll until complete or timeout
    const pollStartTime = Date.now();
    let lastStatus = startResult.status;

    while (Date.now() - pollStartTime < MAX_POLL_TIME) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

      const statusResult = await pollAgentStatus(apiKey, jobId);
      console.log(`[Agent] Poll result (${((Date.now() - startTime) / 1000).toFixed(1)}s):`,
        JSON.stringify({ status: statusResult.status, hasData: !!statusResult.data }, null, 2));

      if (statusResult.status !== lastStatus) {
        console.log(`[Agent] Status changed: ${lastStatus} -> ${statusResult.status}`);
        lastStatus = statusResult.status;
      }

      if (statusResult.status === 'completed') {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Agent] Completed in ${duration}s`);
        return NextResponse.json({
          success: true,
          data: {
            output: statusResult.data,
            creditsUsed: statusResult.creditsUsed,
            duration: `${duration}s`,
          },
        });
      }

      if (statusResult.status === 'failed') {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Agent] Failed after ${duration}s:`, statusResult.error);
        return NextResponse.json({
          success: false,
          error: statusResult.error || "Agent job failed",
          duration: `${duration}s`,
        }, { status: 500 });
      }
    }

    // Timeout
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Agent] Timeout after ${duration}s`);
    return NextResponse.json({
      success: false,
      error: `Agent job timed out after ${duration}s. The job may still be running - try again with a simpler query.`,
      jobId: jobId,
      duration: `${duration}s`,
    }, { status: 504 });

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[Agent] Error after ${duration}s:`, error);

    let errorMessage = "Agent request failed";
    if (error instanceof Error) {
      errorMessage = error.message;
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
