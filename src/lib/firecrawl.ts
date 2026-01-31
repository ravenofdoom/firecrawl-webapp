import FirecrawlApp from "@mendable/firecrawl-js";

// Initialize Firecrawl client
export function getFirecrawlClient() {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not configured");
  }

  return new FirecrawlApp({ apiKey });
}

// Types for API responses
export interface ScrapeResult {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    metadata?: Record<string, unknown>;
    links?: string[];
  };
  error?: string;
}

export interface CrawlResult {
  success: boolean;
  id?: string;
  status?: string;
  data?: Array<{
    markdown?: string;
    html?: string;
    metadata?: Record<string, unknown>;
  }>;
  error?: string;
}

export interface MapResult {
  success: boolean;
  links?: Array<{
    url: string;
    title?: string;
    description?: string;
  }>;
  error?: string;
}

export interface ExtractResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}
