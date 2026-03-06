import { useState } from 'react'
import type { Rezept } from '../../types'
import { generatePlaceholderImage } from '../../services/imageService'

interface RecipeDetailProps {
  rezept: Rezept
  onSchliessen: () => void
  onLoeschen?: () => void
}

export function RecipeDetail({ rezept, onSchliessen, onLoeschen }: RecipeDetailProps) {
  const [loeschenBestaetigt, setLoeschenBestaetigt] = useState(false)
  const bildUrl = rezept.bildUrl || generatePlaceholderImage(rezept.name)

  return (
    <div className="space-y-4">
      {/* Bild */}
      <img
        src={bildUrl}
        alt={rezept.name}
        className="w-full h-48 object-cover rounded-xl"
        onError={(e) => {
          ;(e.target as HTMLImageElement).src = generatePlaceholderImage(rezept.name)
        }}
      />

      {/* Metadaten */}
      <div className="flex gap-4 bg-brand-50 rounded-xl p-3">
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-brand-600">{rezept.zubereitungsdauer}</div>
          <div className="text-xs text-gray-500">Minuten</div>
        </div>
        <div className="w-px bg-brand-100" />
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-orange-500">{rezept.kalorien}</div>
          <div className="text-xs text-gray-500">kcal/Portion</div>
        </div>
        <div className="w-px bg-brand-100" />
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-green-600">{rezept.portionen}</div>
          <div className="text-xs text-gray-500">Portionen</div>
        </div>
      </div>

      {rezept.beschreibung && (
        <p className="text-sm text-gray-600 italic">{rezept.beschreibung}</p>
      )}

      {/* Zutaten */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">🧂 Zutaten</h3>
        <ul className="space-y-1">
          {rezept.zutaten.map((z, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
              <span className="font-medium text-gray-700">
                {z.menge} {z.einheit}
              </span>
              <span className="text-gray-600">{z.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Zubereitung */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">👨‍🍳 Zubereitung</h3>
        <ol className="space-y-2">
          {rezept.zubereitungsschritte.map((schritt, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <span className="text-gray-600 pt-0.5">{schritt}</span>
            </li>
          ))}
        </ol>
      </div>

      {rezept.quelle && (
        <p className="text-xs text-gray-400 border-t pt-3">
          Quelle: {rezept.quelle}
        </p>
      )}

      {/* Aktionen */}
      <div className="flex gap-3 border-t pt-3">
        <button
          onClick={onSchliessen}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Schließen
        </button>
        {onLoeschen && (
          <button
            onClick={() => {
              if (loeschenBestaetigt) {
                onLoeschen()
              } else {
                setLoeschenBestaetigt(true)
                setTimeout(() => setLoeschenBestaetigt(false), 3000)
              }
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              loeschenBestaetigt
                ? 'bg-red-500 text-white'
                : 'border border-red-200 text-red-500 hover:bg-red-50'
            }`}
          >
            {loeschenBestaetigt ? 'Wirklich löschen?' : 'Löschen'}
          </button>
        )}
      </div>
    </div>
  )
}
