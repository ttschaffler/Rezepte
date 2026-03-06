import type { Rezept } from '../../types'
import { generatePlaceholderImage } from '../../services/imageService'

interface RecipeCardProps {
  rezept: Rezept
  onClick?: () => void
  onLoeschen?: () => void
  klein?: boolean
}

export function RecipeCard({ rezept, onClick, onLoeschen, klein = false }: RecipeCardProps) {
  const bildUrl = rezept.bildUrl || generatePlaceholderImage(rezept.name)

  if (klein) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-2 rounded-lg overflow-hidden bg-white border border-gray-100 shadow-sm ${onClick ? 'cursor-pointer hover:border-brand-300 hover:shadow-md' : ''} transition-all`}
      >
        <img
          src={bildUrl}
          alt={rezept.name}
          className="w-12 h-12 object-cover flex-shrink-0"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = generatePlaceholderImage(rezept.name)
          }}
        />
        <div className="min-w-0 flex-1 pr-2 py-1">
          <p className="text-xs font-semibold text-gray-800 truncate">{rezept.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">⏱ {rezept.zubereitungsdauer} Min</span>
            <span className="text-xs text-gray-400">🔥 {rezept.kalorien} kcal</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-brand-200' : ''
      } transition-all`}
    >
      <div className="relative">
        <img
          src={bildUrl}
          alt={rezept.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = generatePlaceholderImage(rezept.name)
          }}
        />
        {onLoeschen && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLoeschen()
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="Rezept löschen"
          >
            ✕
          </button>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{rezept.name}</h3>
        {rezept.beschreibung && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rezept.beschreibung}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span>⏱</span>
            <span>{rezept.zubereitungsdauer} Min</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
            <span>🔥</span>
            <span>{rezept.kalorien} kcal</span>
          </span>
          <span className="text-xs text-gray-400 ml-auto">{rezept.portionen} Port.</span>
        </div>
      </div>
    </div>
  )
}
