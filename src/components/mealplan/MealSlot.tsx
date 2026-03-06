import type { Rezept, MahlzeitTyp, Mahlzeit } from '../../types'
import { MAHLZEIT_LABELS } from '../../types'
import { generatePlaceholderImage } from '../../services/imageService'

interface MealSlotProps {
  typ: MahlzeitTyp
  mahlzeit?: Mahlzeit
  rezept?: Rezept
  onHinzufuegen: () => void
  onEntfernen: () => void
}

const SLOT_ICONS: Record<MahlzeitTyp, string> = {
  fruehstueck: '☀️',
  mittagessen: '🌤️',
  abendessen: '🌙',
}

export function MealSlot({ typ, mahlzeit, rezept, onHinzufuegen, onEntfernen }: MealSlotProps) {
  const bildUrl = rezept ? (rezept.bildUrl || generatePlaceholderImage(rezept.name)) : null

  return (
    <div className="group">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs">{SLOT_ICONS[typ]}</span>
        <span className="text-xs font-medium text-gray-500">{MAHLZEIT_LABELS[typ]}</span>
      </div>

      {mahlzeit && rezept ? (
        <div className="relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          <img
            src={bildUrl!}
            alt={rezept.name}
            className="w-full h-20 object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = generatePlaceholderImage(rezept.name)
            }}
          />
          <button
            onClick={onEntfernen}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="Entfernen"
          >
            ✕
          </button>
          <div className="p-1.5">
            <p className="text-xs font-semibold text-gray-700 leading-tight line-clamp-1">{rezept.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-gray-400">⏱{rezept.zubereitungsdauer}m</span>
              <span className="text-xs text-orange-500 font-medium">🔥{rezept.kalorien}</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={onHinzufuegen}
          className="w-full h-[108px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-brand-300 hover:bg-brand-50 transition-colors group"
        >
          <span className="text-lg text-gray-300 group-hover:text-brand-400 transition-colors">+</span>
          <span className="text-xs text-gray-300 group-hover:text-brand-400 transition-colors">
            Hinzufügen
          </span>
        </button>
      )}
    </div>
  )
}
