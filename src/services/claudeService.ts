import type { Rezept } from '../types'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

const SYSTEM_PROMPT = `Du bist ein Rezept-Extraktions-Assistent. Analysiere den Inhalt und extrahiere ein vollständiges Rezept.
Gib die Antwort AUSSCHLIESSLICH als gültiges JSON zurück, ohne Markdown-Code-Blöcke oder zusätzlichen Text.

Verwende exakt dieses JSON-Schema:
{
  "name": "Name des Rezepts",
  "beschreibung": "Kurze appetitliche Beschreibung (1-2 Sätze)",
  "zutaten": [
    {"name": "Zutatname", "menge": 250, "einheit": "g"}
  ],
  "zubereitungsschritte": [
    "Schritt 1: ...",
    "Schritt 2: ..."
  ],
  "zubereitungsdauer": 30,
  "kalorien": 450,
  "portionen": 4
}

Regeln:
- Alle Texte auf Deutsch
- Europäische Maßeinheiten: g, kg, ml, l, TL (Teelöffel), EL (Esslöffel), Stück, Prise, Bund, Zehe
- "menge" als Zahl (z.B. 250, nicht "250g")
- "zubereitungsdauer" in Minuten als Zahl
- "kalorien" pro Portion als Zahl (schätze realistisch wenn unbekannt)
- "portionen" als Zahl (verwende 4 wenn unbekannt)
- Wenn Wert unbekannt, schätze realistisch`

async function callClaude(messages: { role: string; content: unknown }[]): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Claude API-Key nicht konfiguriert. Bitte VITE_ANTHROPIC_API_KEY in .env setzen.')
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`Claude API Fehler: ${error?.error?.message ?? response.statusText}`)
  }

  const data = await response.json()
  return data.content[0].text
}

function parseRecipeJson(text: string): Partial<Rezept> {
  // Claude könnte trotz Anweisung Markdown-Blöcke nutzen – bereinigen
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)
  return parsed as Partial<Rezept>
}

export async function extractRecipeFromText(text: string): Promise<Partial<Rezept>> {
  const result = await callClaude([
    { role: 'user', content: `Extrahiere das Rezept aus folgendem Text:\n\n${text}` },
  ])
  return parseRecipeJson(result)
}

export async function extractRecipeFromImage(
  base64Data: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
): Promise<Partial<Rezept>> {
  const result = await callClaude([
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data,
          },
        },
        {
          type: 'text',
          text: 'Extrahiere das Rezept aus diesem Bild. Falls kein Rezept erkennbar ist, beschreibe was du siehst und schätze ein passendes Rezept dazu.',
        },
      ],
    },
  ])
  return parseRecipeJson(result)
}

export async function extractRecipeFromUrl(url: string): Promise<{ rezept: Partial<Rezept>; fetchedText?: string }> {
  // Versuche den Inhalt über einen CORS-Proxy zu laden
  const corsProxies = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  ]

  let pageText: string | null = null

  for (const proxyUrl of corsProxies) {
    try {
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) })
      if (!response.ok) continue

      const data = await response.json().catch(() => null)
      if (data && 'contents' in data) {
        // allorigins format
        pageText = data.contents
      } else {
        pageText = await response.text()
      }

      if (pageText && pageText.length > 100) break
    } catch {
      continue
    }
  }

  if (!pageText) {
    throw new Error(
      'URL konnte nicht geladen werden. Instagram und Facebook blockieren direkten Zugriff. ' +
        'Bitte kopiere den Text des Posts manuell und füge ihn ein.'
    )
  }

  // HTML-Tags entfernen und auf relevanten Text reduzieren
  const strippedText = pageText
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000) // Token-Limit beachten

  const rezept = await extractRecipeFromText(`URL: ${url}\n\nSeiteninhalt:\n${strippedText}`)
  return { rezept, fetchedText: strippedText }
}
