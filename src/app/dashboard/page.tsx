"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  data?: unknown;
  error?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [activeTab, setActiveTab] = useState<ToolType>("scrape");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Firecrawl</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">
              {session?.user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tools Panel */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Web Scraping Tools</CardTitle>
              <CardDescription>
                Select a tool and configure your request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ToolType)}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="scrape">Scrape</TabsTrigger>
                  <TabsTrigger value="crawl">Crawl</TabsTrigger>
                  <TabsTrigger value="map">Map</TabsTrigger>
                  <TabsTrigger value="extract">Extract</TabsTrigger>
                </TabsList>

                {/* Scrape Tab */}
                <TabsContent value="scrape" className="space-y-4">
                  <div>
                    <Label htmlFor="scrape-url">URL</Label>
                    <Input
                      id="scrape-url"
                      placeholder="https://example.com"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scrape-format">Output Format</Label>
                    <Select value={scrapeFormat} onValueChange={setScrapeFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="links">Links</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => handleSubmit("scrape")}
                    disabled={loading || !scrapeUrl}
                    className="w-full"
                  >
                    {loading && activeTab === "scrape" ? "Scraping..." : "Scrape URL"}
                  </Button>
                </TabsContent>

                {/* Crawl Tab */}
                <TabsContent value="crawl" className="space-y-4">
                  <div>
                    <Label htmlFor="crawl-url">Start URL</Label>
                    <Input
                      id="crawl-url"
                      placeholder="https://example.com"
                      value={crawlUrl}
                      onChange={(e) => setCrawlUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crawl-limit">Page Limit</Label>
                    <Input
                      id="crawl-limit"
                      type="number"
                      min="1"
                      max="100"
                      value={crawlLimit}
                      onChange={(e) => setCrawlLimit(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit("crawl")}
                    disabled={loading || !crawlUrl}
                    className="w-full"
                  >
                    {loading && activeTab === "crawl" ? "Crawling..." : "Start Crawl"}
                  </Button>
                </TabsContent>

                {/* Map Tab */}
                <TabsContent value="map" className="space-y-4">
                  <div>
                    <Label htmlFor="map-url">Domain URL</Label>
                    <Input
                      id="map-url"
                      placeholder="https://example.com"
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="map-search">Search Filter (optional)</Label>
                    <Input
                      id="map-search"
                      placeholder="blog, docs, api..."
                      value={mapSearch}
                      onChange={(e) => setMapSearch(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="map-limit">Limit</Label>
                    <Input
                      id="map-limit"
                      type="number"
                      min="1"
                      max="5000"
                      value={mapLimit}
                      onChange={(e) => setMapLimit(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit("map")}
                    disabled={loading || !mapUrl}
                    className="w-full"
                  >
                    {loading && activeTab === "map" ? "Mapping..." : "Map URLs"}
                  </Button>
                </TabsContent>

                {/* Extract Tab */}
                <TabsContent value="extract" className="space-y-4">
                  <div>
                    <Label htmlFor="extract-urls">URLs (one per line)</Label>
                    <Textarea
                      id="extract-urls"
                      placeholder="https://example.com/page1&#10;https://example.com/page2"
                      value={extractUrls}
                      onChange={(e) => setExtractUrls(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="extract-prompt">Extraction Prompt</Label>
                    <Textarea
                      id="extract-prompt"
                      placeholder="Extract all product names, prices, and descriptions..."
                      value={extractPrompt}
                      onChange={(e) => setExtractPrompt(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit("extract")}
                    disabled={loading || !extractUrls || !extractPrompt}
                    className="w-full"
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
                {result && (
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Error"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!result ? (
                <p className="text-slate-400 text-center py-8">
                  Run a tool to see results here
                </p>
              ) : (
                <div className="bg-slate-900 rounded-lg p-4 max-h-[600px] overflow-auto">
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words">
                    {JSON.stringify(result.data || result.error, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
