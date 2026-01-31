"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

type ToolType = "scrape" | "crawl" | "map" | "agent";

interface ApiResult {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    links?: string[];
    data?: Array<{ markdown?: string }>;
    output?: string;
    result?: unknown;
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
  const [activeTab, setActiveTab] = useState<ToolType>("agent");
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

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

  // Agent form
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentUrls, setAgentUrls] = useState("");

  // Progress animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [loading]);

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

  const getLoadingMessages = (tool: ToolType): string[] => {
    switch (tool) {
      case "agent":
        return [
          "Agent startet...",
          "Durchsuche das Web...",
          "Analysiere Inhalte...",
          "Extrahiere Informationen...",
          "Verarbeite Ergebnisse...",
        ];
      case "scrape":
        return ["Lade Seite...", "Extrahiere Inhalte...", "Formatiere Daten..."];
      case "crawl":
        return ["Starte Crawl...", "Folge Links...", "Sammle Seiten...", "Verarbeite Inhalte..."];
      case "map":
        return ["Analysiere Domain...", "Sammle URLs...", "Erstelle Sitemap..."];
      default:
        return ["Verarbeite..."];
    }
  };

  const handleSubmit = async (tool: ToolType) => {
    setLoading(true);
    setResult(null);

    const messages = getLoadingMessages(tool);
    let messageIndex = 0;
    setLoadingMessage(messages[0]);

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2000);

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
        case "agent":
          body = {
            prompt: agentPrompt,
            urls: agentUrls ? agentUrls.split("\n").filter((u) => u.trim()) : undefined,
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
      clearInterval(messageInterval);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const exportToPdf = async () => {
    if (!resultRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = resultRef.current;

      const canvas = await html2canvas(element, {
        backgroundColor: "#0f172a",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`firecrawl-result-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("PDF Export fehlgeschlagen. Bitte versuche es erneut.");
    }
  };

  // Extract content from result for display
  const getDisplayContent = (): string => {
    if (!result?.data) return "";

    // Agent output
    if (result.data.output) {
      return result.data.output;
    }

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

    // Links from map (as array of strings)
    if (Array.isArray(result.data.links)) {
      return "## Gefundene URLs\n\n" + result.data.links.map((link) => `- ${link}`).join("\n");
    }

    // Map result with links array containing objects
    if (result.data.links && Array.isArray(result.data.links)) {
      return "## Gefundene URLs\n\n" + result.data.links
        .map((link: string | { url?: string }) =>
          typeof link === 'string' ? `- ${link}` : `- ${link.url || JSON.stringify(link)}`
        )
        .join("\n");
    }

    // Agent/Extract results or other structured data
    if (typeof result.data === "object") {
      // Try to format nicely
      const formatted = JSON.stringify(result.data, null, 2);
      return "```json\n" + formatted + "\n```";
    }

    return String(result.data);
  };

  const toolDescriptions = {
    agent: {
      color: "blue",
      icon: "🤖",
      title: "Agent",
      description: "Der Agent sucht autonom im Web nach Informationen. Beschreibe einfach, was du wissen möchtest - URLs sind optional.",
    },
    scrape: {
      color: "green",
      icon: "📄",
      title: "Scrape",
      description: "Extrahiert den kompletten Inhalt einer einzelnen Webseite als Markdown, HTML oder Liste aller Links.",
    },
    crawl: {
      color: "orange",
      icon: "🕷️",
      title: "Crawl",
      description: "Durchsucht eine Website rekursiv und sammelt Inhalte von mehreren Unterseiten bis zum angegebenen Limit.",
    },
    map: {
      color: "purple",
      icon: "🗺️",
      title: "Map",
      description: "Erstellt schnell eine Übersicht aller URLs einer Website ohne die Inhalte zu extrahieren. Ideal zur Planung.",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Firecrawl</h1>
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white text-xs md:text-sm"
              onClick={() => router.push("/docs/de")}
            >
              Hilfe (DE)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white text-xs md:text-sm"
              onClick={() => router.push("/docs/en")}
            >
              Help (EN)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white text-xs md:text-sm"
              onClick={() => router.push("/settings")}
            >
              Settings
            </Button>
            <span className="text-slate-400 text-sm hidden md:inline">
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

      {/* Progress Bar */}
      {loading && (
        <div className="fixed top-[65px] left-0 right-0 z-20">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tools Panel */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Web Scraping Tools</CardTitle>
              <CardDescription className="text-slate-400">
                Wähle ein Tool und konfiguriere deine Anfrage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ToolType)}>
                <TabsList className="grid grid-cols-4 mb-6 bg-slate-700">
                  <TabsTrigger value="agent" className="data-[state=active]:bg-blue-600">Agent</TabsTrigger>
                  <TabsTrigger value="scrape" className="data-[state=active]:bg-green-600">Scrape</TabsTrigger>
                  <TabsTrigger value="crawl" className="data-[state=active]:bg-orange-600">Crawl</TabsTrigger>
                  <TabsTrigger value="map" className="data-[state=active]:bg-purple-600">Map</TabsTrigger>
                </TabsList>

                {/* Agent Tab */}
                <TabsContent value="agent" className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                    <p className="text-blue-300 text-sm">
                      {toolDescriptions.agent.icon} {toolDescriptions.agent.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-prompt" className="text-white">
                      Was möchtest du herausfinden?
                    </Label>
                    <Textarea
                      id="agent-prompt"
                      placeholder="z.B. Welche PIM-Software nutzt der Böttcher Online Shop? Oder: Finde alle Kontaktdaten von Tech-Startups in Berlin..."
                      value={agentPrompt}
                      onChange={(e) => setAgentPrompt(e.target.value)}
                      rows={4}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-urls" className="text-white">
                      URLs (optional - eine pro Zeile)
                    </Label>
                    <Textarea
                      id="agent-urls"
                      placeholder="https://example.com&#10;Leer lassen, wenn der Agent selbst suchen soll"
                      value={agentUrls}
                      onChange={(e) => setAgentUrls(e.target.value)}
                      rows={2}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit("agent")}
                    disabled={loading || !agentPrompt}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && activeTab === "agent" ? loadingMessage || "Agent arbeitet..." : "Agent starten"}
                  </Button>
                </TabsContent>

                {/* Scrape Tab */}
                <TabsContent value="scrape" className="space-y-4">
                  <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                    <p className="text-green-300 text-sm">
                      {toolDescriptions.scrape.icon} {toolDescriptions.scrape.description}
                    </p>
                  </div>
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
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading && activeTab === "scrape" ? loadingMessage || "Scraping..." : "Scrape URL"}
                  </Button>
                </TabsContent>

                {/* Crawl Tab */}
                <TabsContent value="crawl" className="space-y-4">
                  <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-3">
                    <p className="text-orange-300 text-sm">
                      {toolDescriptions.crawl.icon} {toolDescriptions.crawl.description}
                    </p>
                  </div>
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
                    <Label htmlFor="crawl-limit" className="text-white">Seiten-Limit</Label>
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
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {loading && activeTab === "crawl" ? loadingMessage || "Crawling..." : "Start Crawl"}
                  </Button>
                </TabsContent>

                {/* Map Tab */}
                <TabsContent value="map" className="space-y-4">
                  <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">
                    <p className="text-purple-300 text-sm">
                      {toolDescriptions.map.icon} {toolDescriptions.map.description}
                    </p>
                  </div>
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
                    <Label htmlFor="map-search" className="text-white">Suchfilter (optional)</Label>
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
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading && activeTab === "map" ? loadingMessage || "Mapping..." : "Map URLs"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <CardTitle className="text-white">Ergebnisse</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {result?.success && (
                    <>
                      <Select value={viewMode} onValueChange={(v) => setViewMode(v as "formatted" | "raw")}>
                        <SelectTrigger className="w-32 h-8 bg-slate-700 border-slate-600 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="formatted">Formatiert</SelectItem>
                          <SelectItem value="raw">Raw JSON</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToPdf}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        PDF Export
                      </Button>
                    </>
                  )}
                  {result && (
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Erfolg" : "Fehler"}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="text-slate-400 text-center">{loadingMessage}</p>
                  <p className="text-slate-500 text-sm">Dies kann einige Sekunden dauern...</p>
                </div>
              ) : !result ? (
                <p className="text-slate-400 text-center py-8">
                  Wähle ein Tool und starte eine Anfrage um Ergebnisse zu sehen
                </p>
              ) : result.error ? (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <p className="text-red-300 font-medium mb-2">Fehler</p>
                  <p className="text-red-200 text-sm">{result.error}</p>
                </div>
              ) : (
                <div
                  ref={resultRef}
                  className="bg-slate-900 rounded-lg p-6 max-h-[600px] overflow-auto"
                >
                  {viewMode === "formatted" ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-a:text-blue-400 prose-strong:text-white prose-code:text-green-400 prose-pre:bg-slate-800 prose-pre:text-slate-300">
                      <ReactMarkdown>{getDisplayContent()}</ReactMarkdown>
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
