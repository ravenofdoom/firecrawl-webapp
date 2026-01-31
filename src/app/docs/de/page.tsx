"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DocsDE() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Dokumentation</h1>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-white hover:bg-slate-700"
            onClick={() => router.push("/dashboard")}
          >
            Zurück zum Dashboard
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-8 space-y-8">

        {/* Intro */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Willkommen bei Firecrawl</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-slate-300">
              Firecrawl ist ein leistungsstarkes Web-Scraping-Tool, das Webseiten in strukturierte,
              LLM-freundliche Daten umwandelt. Diese Anwendung bietet vier Hauptfunktionen:
            </p>
          </CardContent>
        </Card>

        {/* Agent */}
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-blue-300 text-xl">🤖 Agent (Empfohlen)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              Der <strong className="text-white">Agent</strong> ist die intelligenteste Funktion.
              Er sucht autonom im Web nach Informationen - du musst nur beschreiben, was du wissen möchtest.
            </p>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">So funktioniert es:</h4>
              <ol className="list-decimal list-inside text-slate-300 space-y-1">
                <li>Beschreibe in natürlicher Sprache, was du herausfinden möchtest</li>
                <li>Optional: Gib URLs an, auf die sich der Agent fokussieren soll</li>
                <li>Der Agent durchsucht das Web und liefert strukturierte Ergebnisse</li>
              </ol>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Beispiel-Prompts:</h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>&quot;Welche PIM-Software nutzt der Böttcher Online Shop?&quot;</li>
                <li>&quot;Finde alle Kontaktdaten von Tech-Startups in Berlin mit Funding über 1M&quot;</li>
                <li>&quot;Was sind die Preise und Features von Shopify Plus?&quot;</li>
                <li>&quot;Sammle alle Blog-Artikel über KI von dieser Website&quot;</li>
              </ul>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">
                <strong>Tipp:</strong> Je präziser dein Prompt, desto bessere Ergebnisse.
                Beschreibe genau, welche Informationen du benötigst.
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
              <strong className="text-white">Scrape</strong> extrahiert den Inhalt einer einzelnen Webseite
              und konvertiert ihn in ein sauberes Format (Markdown, HTML oder Links).
            </p>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Wann verwenden:</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Du brauchst den Inhalt einer bestimmten Seite</li>
                <li>Du möchtest JavaScript-gerenderte Inhalte erfassen</li>
                <li>Du brauchst den Text einer Seite für weitere Verarbeitung</li>
              </ul>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Output-Formate:</h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li><strong className="text-white">Markdown:</strong> Sauberer, strukturierter Text</li>
                <li><strong className="text-white">HTML:</strong> Vollständiger HTML-Code</li>
                <li><strong className="text-white">Links:</strong> Alle Links auf der Seite</li>
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
              <strong className="text-white">Crawl</strong> durchsucht eine gesamte Website,
              folgt Links und extrahiert Inhalte von mehreren Seiten.
            </p>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Wann verwenden:</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Du brauchst Inhalte von einer ganzen Website</li>
                <li>Du möchtest eine Knowledge Base aufbauen</li>
                <li>Du erstellst ein &quot;Chat mit Website&quot;-System</li>
              </ul>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Parameter:</h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li><strong className="text-white">Start URL:</strong> Die Ausgangsseite</li>
                <li><strong className="text-white">Page Limit:</strong> Maximale Anzahl zu crawlender Seiten</li>
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
              <strong className="text-white">Map</strong> erstellt eine schnelle Übersicht aller URLs einer Website,
              ohne die Inhalte zu extrahieren.
            </p>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Wann verwenden:</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Du möchtest die Struktur einer Website verstehen</li>
                <li>Du suchst bestimmte Seiten (z.B. alle Blog-Artikel)</li>
                <li>Du planst, welche Seiten du scrapen möchtest</li>
              </ul>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Parameter:</h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li><strong className="text-white">Domain URL:</strong> Die zu mappende Website</li>
                <li><strong className="text-white">Search Filter:</strong> Filtert URLs nach Stichwörtern (z.B. &quot;blog&quot;)</li>
                <li><strong className="text-white">Limit:</strong> Maximale Anzahl der URLs</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">💡 Tipps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>
                <strong className="text-white">PDF Export:</strong> Klicke auf &quot;Export PDF&quot; um die Ergebnisse zu speichern
              </li>
              <li>
                <strong className="text-white">Raw JSON:</strong> Wechsle zur JSON-Ansicht für technische Details
              </li>
              <li>
                <strong className="text-white">Agent für Recherche:</strong> Nutze den Agent für komplexe Fragen -
                er sucht selbstständig nach Antworten
              </li>
              <li>
                <strong className="text-white">Scrape für einzelne Seiten:</strong> Wenn du genau weißt,
                welche Seite du brauchst
              </li>
            </ul>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
