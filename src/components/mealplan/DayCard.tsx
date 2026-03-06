import { useState } from 'react'
import type { WochenplanTag, MahlzeitTyp, Rezept } from '../../types'
import { MealSlot } from './MealSlot'

const MAHLZEIT_TYPEN: MahlzeitTyp[] = ['fruehstueck', 'mittagessen', 'abendessen']

interface DayCardProps {
  tag: WochenplanTag
  tagName: string
  istHeute: boolean
  rezepte: Rezept[]
  onMahlzeitHinzufuegen: (datum: string, typ: MahlzeitTyp) => void
  onMahlzeitEntfernen: (datum: string, typ: MahlzeitTyp) => void
  onKalorienZielAendern: (datum: string, ziel: number) => void
}

export function DayCard({
  tag,
  tagName,
  istHeute,
  rezepte,
  onMahlzeitHinzufuegen,
  onMahlzeitEntfernen,
  onKalorienZielAendern,
}: DayCardProps) {
  const [kalorienEdit, setKalorienEdit] = useState(false)
  const [kalorienInput, setKalorienInput] = useState(String(tag.kalorienZiel))

  const gesamtKalorien = MAHLZEIT_TYPEN.reduce((sum, typ) => {
    const mahlzeit = tag.mahlzeiten[typ]
    if (!mahlzeit) return sum
    const rezept = rezepte.find((r) => r.id === mahlzeit.rezeptId)
    return sum + (rezept ? rezept.kalorien * (mahlzeit.portionen || 1) : 0)
  }, 0)

  const fortschritt = Math.min((gesamtKalorien / tag.kalorienZiel) * 100, 100)
  const istUeberschritten = gesamtKalorien > tag.kalorienZiel

  const kalorienSpeichern = () => {
    const ziel = Number(kalorienInput)
    if (ziel > 0) {
      onKalorienZielAendern(tag.datum, ziel)
    }
    setKalorienEdit(false)
  }

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm flex flex-col ${
        istHeute ? 'border-brand-300 ring-2 ring-brand-100' : 'border-gray-100'
      }`}
    >
      {/* Tag-Header */}
      <div
        className={`px-3 py-2 rounded-t-2xl ${
          istHeute ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold">{tagName}</p>
            <p className={`text-xs ${istHeute ? 'text-brand-100' : 'text-gray-400'}`}>
              {new Date(tag.datum + 'T00:00:00').toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
              })}
            </p>
          </div>
          {istHeute && (
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-lg">Heute</span>
          )}
        </div>
      </div>

      {/* Kalorien-Anzeige */}
      <div className="px-3 pt-2 pb-1">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-semibold ${istUeberschritten ? 'text-red-500' : 'text-gray-600'}`}>
            🔥 {gesamtKalorien} /{' '}
            {kalorienEdit ? (
              <input
                type="number"
                value={kalorienInput}
                onChange={(e) => setKalorienInput(e.target.value)}
                onBlur={kalorienSpeichern}
                onKeyDown={(e) => e.key === 'Enter' && kalorienSpeichern()}
                autoFocus
                className="w-16 text-xs border border-brand-300 rounded px-1 focus:outline-none"
              />
            ) : (
              <button
                onClick={() => {
                  setKalorienEdit(true)
                  setKalorienInput(String(tag.kalorienZiel))
                }}
                className="underline decoration-dotted hover:text-brand-600 transition-colors"
                title="Kalorienziel ändern"
              >
                {tag.kalorienZiel}
              </button>
            )}{' '}
            kcal
          </span>
        </div>
        {/* Fortschrittsbalken */}
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              istUeberschritten ? 'bg-red-400' : 'bg-brand-400'
            }`}
            style={{ width: `${fortschritt}%` }}
          />
        </div>
      </div>

      {/* Mahlzeiten-Slots */}
      <div className="p-3 space-y-3 flex-1">
        {MAHLZEIT_TYPEN.map((typ) => {
          const mahlzeit = tag.mahlzeiten[typ]
          const rezept = mahlzeit ? rezepte.find((r) => r.id === mahlzeit.rezeptId) : undefined
          return (
            <MealSlot
              key={typ}
              typ={typ}
              mahlzeit={mahlzeit}
              rezept={rezept}
              onHinzufuegen={() => onMahlzeitHinzufuegen(tag.datum, typ)}
              onEntfernen={() => onMahlzeitEntfernen(tag.datum, typ)}
            />
          )
        })}
      </div>
    </div>
  )
}
