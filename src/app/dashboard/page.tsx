"use client";

import { useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ToolType = "scrape" | "crawl" | "map" | "extract";

interface ApiResult {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    links?: string[];
    data?: Array<{ markdown?: string }>;
    [key: string]: unknown;
  };
  error?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resultRef = useRef<HTMLDivElement>(null);

  // Form states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [activeTab, setActiveTab] = useState<ToolType>("scrape");
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");

  // Scrape form
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeFormat, setScrapeFormat] = useState("markdown");

  // Crawl form
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlLimit, setCrawlLimit] = useState("10");

  // Map form
  const [mapUrl, setMapUrl] = useState("");
  const [mapSearch, setMapSearch] = useState("");
  const [mapLimit, setMapLimit] = useState("100");

  // Extract form
  const [extractUrls, setExtractUrls] = useState("");
  const [extractPrompt, setExtractPrompt] = useState("");

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (tool: ToolType) => {
    setLoading(true);
    setResult(null);

    try {
      let body: Record<string, unknown> = {};

      switch (tool) {
        case "scrape":
          body = { url: scrapeUrl, formats: [scrapeFormat] };
          break;
        case "crawl":
          body = { url: crawlUrl, limit: parseInt(crawlLimit) };
          break;
        case "map":
          body = { url: mapUrl, search: mapSearch || undefined, limit: parseInt(mapLimit) };
          break;
        case "extract":
          body = {
            urls: extractUrls.split("\n").filter((u) => u.trim()),
            prompt: extractPrompt,
          };
          break;
      }

      const response = await fetch(`/api/${tool}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Request failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPdf = async () => {
    if (!resultRef.current) return;

    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");

    const canvas = await html2canvas(resultRef.current, {
      backgroundColor: "#1e293b",
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`firecrawl-result-${Date.now()}.pdf`);
  };

  // Extract markdown content from result
  const getMarkdownContent = (): string => {
    if (!result?.data) return "";

    // Direct markdown
    if (result.data.markdown) {
      return result.data.markdown;
    }

    // Crawl results with array of pages
    if (Array.isArray(result.data.data)) {
      return result.data.data
        .map((page, i) => `## Page ${i + 1}\n\n${page.markdown || "No content"}`)
        .join("\n\n---\n\n");
    }

    // Links from map
    if (Array.isArray(result.data.links)) {
      return result.data.links.map((link) => `- ${link}`).join("\n");
    }

    // Extract results or other structured data
    if (typeof result.data === "object") {
      return "```json\n" + JSON.stringify(result.data, null, 2) + "\n```";
    }

    return String(result.data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Firecrawl</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
              onClick={() => router.push("/settings")}
            >
              Settings
            </Button>
            <span className="text-slate-400 text-sm">
              {session?.user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-white hover:bg-slate-700"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tools Panel */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Web Scraping Tools</CardTitle>
              <CardDescription className="text-slate-400">
                Select a tool and configure your request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ToolType)}>
                <TabsList className="grid grid-cols-4 mb-6 bg-slate-700">
                  <TabsTrigger value="scrape" className="data-[state=active]:bg-slate-600">Scrape</TabsTrigger>
                  <TabsTrigger value="crawl" className="data-[state=active]:bg-slate-600">Crawl</TabsTrigger>
                  <TabsTrigger value="map" className="data-[state=active]:bg-slate-600">Map</TabsTrigger>
                  <TabsTrigger value="extract" className="data-[state=active]:bg-slate-600">Extract</TabsTrigger>
                </TabsList>

                {/* Scrape Tab */}
                <TabsContent value="scrape" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="scrape-url" className="text-white">URL</Label>
                    <Input
                      id="scrape-url"
                      placeholder="https://example.com"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scrape-format" className="text-white">Output Format</Label>
                    <Select value={scrapeFormat} onValueChange={setScrapeFormat}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="links">Links</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => handleSubmit("scrape")}
                    disabled={loading || !scrapeUrl}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && activeTab === "scrape" ? "Scraping..." : "Scrape URL"}
                  </Button>
                </TabsContent>

                {/* Crawl Tab */}
                <TabsContent value="crawl" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crawl-url" className="text-white">Start URL</Label>
                    <Input
                      id="crawl-url"
                      placeholder="https://example.com"
                      value={crawlUrl}
                      onChange={(e) => setCrawlUrl(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crawl-limit" className="text-white">Page Limit</Label>
                    <Input
                      id="crawl-limit"
                      type="number"
                      min="1"
                      max="100"
                      value={crawlLimit}
                      onChange={(e) => setCrawlLimit(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit("crawl")}
                    disabled={loading || !crawlUrl}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && activeTab === "crawl" ? "Crawling..." : "Start Crawl"}
                  </Button>
                </TabsContent>

                {/* Map Tab */}
                <TabsContent value="map" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="map-url" className="text-white">Domain URL</Label>
                    <Input
                      id="map-url"
                      placeholder="https://example.com"
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="map-search" className="text-white">Search Filter (optional)</Label>
                    <Input
                      id="map-search"
                      placeholder="blog, docs, api..."
                      value={mapSearch}
                      onChange={(e) => setMapSearch(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="map-limit" className="text-white">Limit</Label>
                    <Input
                      id="map-limit"
                      type="number"
                      min="1"
                      max="5000"
                      value={mapLimit}
                      onChange={(e) => setMapLimit(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit("map")}
                    disabled={loading || !mapUrl}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && activeTab === "map" ? "Mapping..." : "Map URLs"}
                  </Button>
                </TabsContent>

                {/* Extract Tab */}
                <TabsContent value="extract" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="extract-urls" className="text-white">URLs (one per line)</Label>
                    <Textarea
                      id="extract-urls"
                      placeholder="https://example.com/page1&#10;https://example.com/page2"
                      value={extractUrls}
                      onChange={(e) => setExtractUrls(e.target.value)}
                      rows={3}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extract-prompt" className="text-white">
                      What do you want to find out?
                    </Label>
                    <Textarea
                      id="extract-prompt"
                      placeholder="e.g., Welche PIM nutzt dieser Online Shop? or Extract all product names and prices..."
                      value={extractPrompt}
                      onChange={(e) => setExtractPrompt(e.target.value)}
                      rows={3}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit("extract")}
                    disabled={loading || !extractUrls || !extractPrompt}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && activeTab === "extract" ? "Extracting..." : "Extract Data"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Results</CardTitle>
                <div className="flex items-center gap-2">
                  {result?.success && (
                    <>
                      <Select value={viewMode} onValueChange={(v) => setViewMode(v as "formatted" | "raw")}>
                        <SelectTrigger className="w-32 h-8 bg-slate-700 border-slate-600 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="formatted">Formatted</SelectItem>
                          <SelectItem value="raw">Raw JSON</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToPdf}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        Export PDF
                      </Button>
                    </>
                  )}
                  {result && (
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Error"}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!result ? (
                <p className="text-slate-400 text-center py-8">
                  Run a tool to see results here
                </p>
              ) : result.error ? (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <p className="text-red-300">{result.error}</p>
                </div>
              ) : (
                <div
                  ref={resultRef}
                  className="bg-slate-900 rounded-lg p-6 max-h-[600px] overflow-auto"
                >
                  {viewMode === "formatted" ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-blue-400 prose-strong:text-white prose-code:text-green-400 prose-pre:bg-slate-800">
                      <ReactMarkdown>{getMarkdownContent()}</ReactMarkdown>
                    </div>
                  ) : (
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words font-mono">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
