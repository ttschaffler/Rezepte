import { useState } from 'react'
import type { Rezept, MahlzeitTyp } from '../../types'
import { MAHLZEIT_LABELS } from '../../types'
import { RecipeCard } from '../recipe/RecipeCard'

interface RecipePickerProps {
  rezepte: Rezept[]
  mahlzeitTyp: MahlzeitTyp
  onAuswaehlen: (rezeptId: string) => void
  onAbbrechen: () => void
}

export function RecipePicker({ rezepte, mahlzeitTyp, onAuswaehlen, onAbbrechen }: RecipePickerProps) {
  const [suche, setSuche] = useState('')

  const gefiltert = rezepte.filter(
    (r) =>
      r.name.toLowerCase().includes(suche.toLowerCase()) ||
      r.beschreibung?.toLowerCase().includes(suche.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Wähle ein Rezept für <span className="font-medium text-brand-600">{MAHLZEIT_LABELS[mahlzeitTyp]}</span>
      </p>

      <input
        type="search"
        value={suche}
        onChange={(e) => setSuche(e.target.value)}
        placeholder="Rezept suchen..."
        autoFocus
        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
      />

      {rezepte.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📖</div>
          <p className="text-sm">Noch keine Rezepte vorhanden.</p>
          <p className="text-xs mt-1">Importiere zuerst Rezepte.</p>
        </div>
      ) : gefiltert.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          Kein Rezept gefunden für "{suche}"
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
          {gefiltert.map((rezept) => (
            <RecipeCard
              key={rezept.id}
              rezept={rezept}
              onClick={() => rezept.id && onAuswaehlen(rezept.id)}
            />
          ))}
        </div>
      )}

      <button
        onClick={onAbbrechen}
        className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
      >
        Abbrechen
      </button>
    </div>
  )
}
