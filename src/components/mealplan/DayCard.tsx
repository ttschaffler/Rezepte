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
      className="rounded-2xl border flex flex-col transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: '#232934',
        borderColor: istHeute ? '#d4af37' : '#334155',
        boxShadow: istHeute
          ? '0 0 0 1px rgba(212, 175, 55, 0.2), 0 4px 16px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      {/* Tag-Header */}
      <div
        className="px-3 py-2 rounded-t-2xl"
        style={
          istHeute
            ? { background: 'linear-gradient(135deg, #d4af37, #f0c840)' }
            : { backgroundColor: '#1a1f28' }
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-bold ${istHeute ? 'text-[#0f1419]' : 'text-slate-200'}`}>
              {tagName}
            </p>
            <p className={`text-xs ${istHeute ? 'text-[#5e4a04]' : 'text-slate-500'}`}>
              {new Date(tag.datum + 'T00:00:00').toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
              })}
            </p>
          </div>
          {istHeute && (
            <span className="text-xs bg-black/20 text-[#0f1419] font-semibold px-1.5 py-0.5 rounded-lg">
              Heute
            </span>
          )}
        </div>
      </div>

      {/* Kalorien-Anzeige */}
      <div className="px-3 pt-2 pb-1">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs font-semibold"
            style={{ color: istUeberschritten ? '#f87171' : '#94a3b8' }}
          >
            🔥 {gesamtKalorien} /{' '}
            {kalorienEdit ? (
              <input
                type="number"
                value={kalorienInput}
                onChange={(e) => setKalorienInput(e.target.value)}
                onBlur={kalorienSpeichern}
                onKeyDown={(e) => e.key === 'Enter' && kalorienSpeichern()}
                autoFocus
                className="w-16 text-xs rounded px-1 focus:outline-none border border-[#d4af37] bg-[#1a1f28] text-slate-100"
              />
            ) : (
              <button
                onClick={() => {
                  setKalorienEdit(true)
                  setKalorienInput(String(tag.kalorienZiel))
                }}
                className="underline decoration-dotted hover:text-[#d4af37] transition-colors"
                title="Kalorienziel ändern"
              >
                {tag.kalorienZiel}
              </button>
            )}{' '}
            kcal
          </span>
        </div>
        {/* Fortschrittsbalken */}
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#334155' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${fortschritt}%`,
              backgroundColor: istUeberschritten ? '#f87171' : '#2dd4bf',
            }}
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
