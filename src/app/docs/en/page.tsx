"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DocsEN() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Documentation</h1>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-white hover:bg-slate-700"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-8 space-y-8">

        {/* Intro */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Welcome to Firecrawl</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-slate-300">
              Firecrawl is a powerful web scraping tool that transforms websites into structured,
              LLM-ready data. This application provides four main features:
            </p>
          </CardContent>
        </Card>

        {/* Agent */}
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-blue-300 text-xl">🤖 Agent (Recommended)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              The <strong className="text-white">Agent</strong> is the most intelligent feature.
              It autonomously searches the web for information - you just need to describe what you want to know.
            </p>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">How it works:</h4>
              <ol className="list-decimal list-inside text-slate-300 space-y-1">
                <li>Describe in natural language what you want to find out</li>
                <li>Optional: Provide URLs for the agent to focus on</li>
                <li>The agent searches the web and delivers structured results</li>
              </ol>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Example prompts:</h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>&quot;What PIM software does this e-commerce store use?&quot;</li>
                <li>&quot;Find all contact details of tech startups in Berlin with funding over 1M&quot;</li>
                <li>&quot;What are the prices and features of Shopify Plus?&quot;</li>
                <li>&quot;Collect all blog articles about AI from this website&quot;</li>
              </ul>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">
                <strong>Tip:</strong> The more precise your prompt, the better the results.
                Describe exactly what information you need.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scrape */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">📄 Scrape</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              <strong className="text-white">Scrape</strong> extracts the content of a single webpage
              and converts it into a clean format (Markdown, HTML, or Links).
            </p>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">When to use:</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>You need the content of a specific page</li>
                <li>You want to capture JavaScript-rendered content</li>
                <li>You need the text of a page for further processing</li>
              </ul>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Output formats:</h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li><strong className="text-white">Markdown:</strong> Clean, structured text</li>
                <li><strong className="text-white">HTML:</strong> Complete HTML code</li>
                <li><strong className="text-white">Links:</strong> All links on the page</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Crawl */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">🕷️ Crawl</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              <strong className="text-white">Crawl</strong> explores an entire website,
              follows links, and extracts content from multiple pages.
            </p>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">When to use:</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>You need content from an entire website</li>
                <li>You want to build a knowledge base</li>
                <li>You&apos;re creating a &quot;chat with website&quot; system</li>
              </ul>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Parameters:</h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li><strong className="text-white">Start URL:</strong> The starting page</li>
                <li><strong className="text-white">Page Limit:</strong> Maximum number of pages to crawl</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">🗺️ Map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              <strong className="text-white">Map</strong> creates a quick overview of all URLs on a website,
              without extracting the content.
            </p>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">When to use:</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>You want to understand a website&apos;s structure</li>
                <li>You&apos;re looking for specific pages (e.g., all blog articles)</li>
                <li>You&apos;re planning which pages to scrape</li>
              </ul>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Parameters:</h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li><strong className="text-white">Domain URL:</strong> The website to map</li>
                <li><strong className="text-white">Search Filter:</strong> Filters URLs by keywords (e.g., &quot;blog&quot;)</li>
                <li><strong className="text-white">Limit:</strong> Maximum number of URLs</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">💡 Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>
                <strong className="text-white">PDF Export:</strong> Click &quot;Export PDF&quot; to save the results
              </li>
              <li>
                <strong className="text-white">Raw JSON:</strong> Switch to JSON view for technical details
              </li>
              <li>
                <strong className="text-white">Agent for research:</strong> Use the Agent for complex questions -
                it autonomously searches for answers
              </li>
              <li>
                <strong className="text-white">Scrape for single pages:</strong> When you know exactly
                which page you need
              </li>
            </ul>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
