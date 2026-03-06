import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import type { Rezept } from '../../types'
import {
  extractRecipeFromText,
  extractRecipeFromImage,
  extractRecipeFromUrl,
} from '../../services/claudeService'
import { fileToBase64, fileToText, getImageMediaType, generatePlaceholderImage } from '../../services/imageService'
import { LoadingSpinner } from '../ui/LoadingSpinner'

type ImportQuelle = 'text' | 'datei' | 'url'

interface RecipeImportProps {
  onRezeptExtrahiert: (rezept: Partial<Rezept>, bildDatei?: File) => void
  onAbbrechen: () => void
}

export function RecipeImport({ onRezeptExtrahiert, onAbbrechen }: RecipeImportProps) {
  const [quelle, setQuelle] = useState<ImportQuelle>('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [urlText, setUrlText] = useState('')
  const [urlFehler, setUrlFehler] = useState(false)
  const [datei, setDatei] = useState<File | null>(null)
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  const onDrop = useCallback((akzeptiert: File[]) => {
    if (akzeptiert.length > 0) {
      setDatei(akzeptiert[0])
      setFehler(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      'text/*': ['.txt', '.md'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const extrahieren = async () => {
    setFehler(null)
    setLaden(true)

    try {
      let rezept: Partial<Rezept> | null = null
      let bildDatei: File | undefined

      if (quelle === 'text') {
        if (!text.trim()) throw new Error('Bitte Text eingeben.')
        rezept = await extractRecipeFromText(text)

      } else if (quelle === 'datei') {
        if (!datei) throw new Error('Bitte eine Datei auswählen.')

        if (datei.type.startsWith('image/')) {
          const base64 = await fileToBase64(datei)
          const mediaType = getImageMediaType(datei)
          rezept = await extractRecipeFromImage(base64, mediaType)
          bildDatei = datei
        } else {
          const inhalt = await fileToText(datei)
          rezept = await extractRecipeFromText(inhalt)
        }

      } else if (quelle === 'url') {
        if (!url.trim()) throw new Error('Bitte URL eingeben.')
        try {
          const { rezept: r } = await extractRecipeFromUrl(url)
          rezept = r
          rezept.quelle = url
        } catch (urlErr) {
          // URL-Fetch fehlgeschlagen → Fallback auf manuellen Text
          setUrlFehler(true)
          if (!urlText.trim()) {
            throw new Error(
              'URL konnte nicht automatisch geladen werden (Instagram/Facebook blockieren Zugriff). ' +
                'Bitte kopiere den Text des Posts in das Textfeld unten.'
            )
          }
          const r = await extractRecipeFromText(urlText)
          rezept = r
          rezept.quelle = url
          rezept.quelleTyp = url.includes('instagram') ? 'instagram' : url.includes('facebook') ? 'facebook' : 'url'
        }
      }

      if (rezept) {
        if (!rezept.bildUrl && !bildDatei) {
          rezept.bildUrl = generatePlaceholderImage(rezept.name ?? 'Rezept')
        }
        onRezeptExtrahiert(rezept, bildDatei)
      }
    } catch (e) {
      setFehler(e instanceof Error ? e.message : 'Unbekannter Fehler beim Extrahieren.')
    } finally {
      setLaden(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quellenauswahl */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        {(['text', 'datei', 'url'] as ImportQuelle[]).map((q) => (
          <button
            key={q}
            onClick={() => { setQuelle(q); setFehler(null); setUrlFehler(false) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              quelle === q ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {q === 'text' && '📝 Text'}
            {q === 'datei' && '📁 Datei/Bild'}
            {q === 'url' && '🔗 URL/Link'}
          </button>
        ))}
      </div>

      {/* Text-Eingabe */}
      {quelle === 'text' && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Rezepttext hier einfügen... (z.B. aus einem Blog, Instagram-Post oder Facebook-Video)"
          className="w-full h-48 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      )}

      {/* Datei-Upload */}
      {quelle === 'datei' && (
        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-brand-400 bg-brand-50'
                : datei
                ? 'border-green-400 bg-green-50'
                : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50'
            }`}
          >
            <input {...getInputProps()} />
            {datei ? (
              <div>
                <div className="text-3xl mb-2">
                  {datei.type.startsWith('image/') ? '🖼️' : '📄'}
                </div>
                <p className="font-medium text-gray-700">{datei.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(datei.size / 1024).toFixed(0)} KB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setDatei(null) }}
                  className="mt-2 text-xs text-red-500 hover:underline"
                >
                  Entfernen
                </button>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-2">📂</div>
                <p className="text-sm text-gray-600">
                  {isDragActive ? 'Datei loslassen...' : 'Datei hier ablegen oder klicken zum Auswählen'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Bilder (JPG, PNG, WebP) oder Textdateien (TXT, MD)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL-Eingabe */}
      {quelle === 'url' && (
        <div className="space-y-3">
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlFehler(false) }}
              placeholder="https://www.instagram.com/p/... oder https://www.facebook.com/..."
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <p className="text-xs text-gray-400 mt-1">
              Hinweis: Instagram und Facebook blockieren oft automatischen Zugriff.
              Falls das Laden fehlschlägt, kopiere den Text des Posts manuell unten.
            </p>
          </div>

          {urlFehler && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-sm text-amber-700 font-medium">Automatisches Laden nicht möglich</p>
              <p className="text-xs text-amber-600 mt-1">
                Kopiere den Rezepttext aus dem Post und füge ihn hier ein:
              </p>
            </div>
          )}

          <textarea
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            placeholder="(Optional) Rezepttext aus dem Post hier einfügen..."
            className="w-full h-32 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
      )}

      {/* Fehler */}
      {fehler && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-700">{fehler}</p>
        </div>
      )}

      {/* Lade-Indikator */}
      {laden && (
        <LoadingSpinner text="Claude AI extrahiert das Rezept..." />
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onAbbrechen}
          className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          disabled={laden}
        >
          Abbrechen
        </button>
        <button
          onClick={extrahieren}
          disabled={laden}
          className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {laden ? 'Extrahiere...' : 'Rezept extrahieren'}
        </button>
      </div>
    </div>
  )
}
