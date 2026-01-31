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
    const { urls, prompt, schema } = body;

    if (!urls || (Array.isArray(urls) && urls.length === 0)) {
      return NextResponse.json(
        { error: "At least one URL is required" },
        { status: 400 }
      );
    }

    if (!prompt && !schema) {
      return NextResponse.json(
        { error: "Either prompt or schema is required" },
        { status: 400 }
      );
    }

    const firecrawl = getFirecrawlClient();

    const extractArgs: {
      urls: string[];
      prompt?: string;
      schema?: Record<string, unknown>;
    } = {
      urls: Array.isArray(urls) ? urls : [urls],
    };

    if (prompt) extractArgs.prompt = prompt;
    if (schema) {
      try {
        extractArgs.schema = typeof schema === "string" ? JSON.parse(schema) : schema;
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON schema" },
          { status: 400 }
        );
      }
    }

    const extractResult = await firecrawl.extract(extractArgs);

    return NextResponse.json({
      success: true,
      data: extractResult,
    });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Extract failed",
      },
      { status: 500 }
    );
  }
}
