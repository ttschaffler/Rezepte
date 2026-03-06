import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Rezept, MahlzeitTyp } from '../../types'
import { TAGE_DE } from '../../types'
import { useMealPlan } from '../../hooks/useMealPlan'
import { DayCard } from './DayCard'
import { RecipePicker } from './RecipePicker'
import { Modal } from '../ui/Modal'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface WeeklyPlannerProps {
  rezepte: Rezept[]
}

interface PickerZustand {
  datum: string
  typ: MahlzeitTyp
}

export function WeeklyPlanner({ rezepte }: WeeklyPlannerProps) {
  const {
    wochenplan,
    laden,
    fehler,
    aktuellesMontagDatum,
    vorherige_woche,
    naechste_woche,
    mahlzeit_zuordnen,
    kalorien_ziel_setzen,
  } = useMealPlan()

  const [picker, setPicker] = useState<PickerZustand | null>(null)

  const heuteDatum = format(new Date(), 'yyyy-MM-dd')

  const wocheTage = Array.from({ length: 7 }, (_, i) => {
    const datum = format(addDays(aktuellesMontagDatum, i), 'yyyy-MM-dd')
    return { datum, name: TAGE_DE[i] }
  })

  const wocheLabel = `${format(aktuellesMontagDatum, 'd. MMM', { locale: de })} – ${format(
    addDays(aktuellesMontagDatum, 6),
    'd. MMM yyyy',
    { locale: de }
  )}`

  if (laden) return <LoadingSpinner gross text="Wochenplan wird geladen..." />

  if (fehler) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Firebase nicht konfiguriert</h2>
        <p className="text-sm text-gray-500">{fehler}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Wochennavigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={vorherige_woche}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
        >
          ← Vorherige
        </button>
        <div className="text-center">
          <h2 className="font-semibold text-gray-800">{wocheLabel}</h2>
        </div>
        <button
          onClick={naechste_woche}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
        >
          Nächste →
        </button>
      </div>

      {/* 7-Tage-Raster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {wocheTage.map(({ datum, name }) => {
          const tag = wochenplan?.tage[datum] ?? {
            datum,
            mahlzeiten: {},
            kalorienZiel: 2000,
          }
          return (
            <DayCard
              key={datum}
              tag={tag}
              tagName={name}
              istHeute={datum === heuteDatum}
              rezepte={rezepte}
              onMahlzeitHinzufuegen={(d, typ) => setPicker({ datum: d, typ })}
              onMahlzeitEntfernen={(d, typ) =>
                mahlzeit_zuordnen(d, typ, null)
              }
              onKalorienZielAendern={(d, ziel) => kalorien_ziel_setzen(d, ziel)}
            />
          )
        })}
      </div>

      {/* Rezept-Picker Modal */}
      <Modal
        offen={picker !== null}
        onSchliessen={() => setPicker(null)}
        titel="Rezept auswählen"
        breite="xl"
      >
        {picker && (
          <RecipePicker
            rezepte={rezepte}
            mahlzeitTyp={picker.typ}
            onAuswaehlen={(rezeptId) => {
              mahlzeit_zuordnen(picker.datum, picker.typ, {
                rezeptId,
                mahlzeitTyp: picker.typ,
                portionen: 1,
              })
              setPicker(null)
            }}
            onAbbrechen={() => setPicker(null)}
          />
        )}
      </Modal>
    </div>
  )
}
