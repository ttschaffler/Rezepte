import { useState } from 'react'
import type { Rezept } from '../../types'
import { RecipeCard } from './RecipeCard'
import { RecipeDetail } from './RecipeDetail'
import { Modal } from '../ui/Modal'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface RecipeListProps {
  rezepte: Rezept[]
  laden: boolean
  fehler: string | null
  onLoeschen: (id: string) => void
  onRezeptImport: () => void
}

export function RecipeList({ rezepte, laden, fehler, onLoeschen, onRezeptImport }: RecipeListProps) {
  const [ausgewaehlt, setAusgewaehlt] = useState<Rezept | null>(null)
  const [suchbegriff, setSuchbegriff] = useState('')

  const gefiltert = rezepte.filter((r) =>
    r.name.toLowerCase().includes(suchbegriff.toLowerCase()) ||
    r.beschreibung?.toLowerCase().includes(suchbegriff.toLowerCase())
  )

  if (laden) return <LoadingSpinner gross text="Rezepte werden geladen..." />

  if (fehler) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-display font-semibold text-slate-300 mb-2">Firebase nicht konfiguriert</h2>
        <p className="text-sm text-slate-500 mb-4">{fehler}</p>
        <p className="text-xs text-slate-600">
          Erstelle eine{' '}
          <code className="px-1 rounded text-[#d4af37]" style={{ backgroundColor: '#232934' }}>.env</code>{' '}
          Datei basierend auf{' '}
          <code className="px-1 rounded text-[#d4af37]" style={{ backgroundColor: '#232934' }}>.env.example</code>
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Suchleiste */}
      <div className="mb-4">
        <input
          type="search"
          value={suchbegriff}
          onChange={(e) => setSuchbegriff(e.target.value)}
          placeholder="Rezepte suchen..."
          className="w-full p-3 rounded-xl text-sm focus:outline-none border text-slate-100 placeholder-slate-500 transition-colors"
          style={{ backgroundColor: '#232934', borderColor: '#334155', color: '#f8fafc' }}
          onFocus={(e) => (e.target.style.borderColor = '#d4af37')}
          onBlur={(e) => (e.target.style.borderColor = '#334155')}
        />
      </div>

      {rezepte.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-lg font-display font-semibold text-slate-300 mb-2">Noch keine Rezepte</h2>
          <p className="text-sm text-slate-500 mb-6">
            Importiere dein erstes Rezept aus Text, Bild oder URL
          </p>
          <button
            onClick={onRezeptImport}
            className="text-[#0f1419] px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-md"
            style={{ background: 'linear-gradient(135deg, #d4af37, #f0c840)' }}
          >
            + Erstes Rezept importieren
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500 mb-3">
            {gefiltert.length} von {rezepte.length} Rezept{rezepte.length !== 1 ? 'e' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {gefiltert.map((rezept) => (
              <RecipeCard
                key={rezept.id}
                rezept={rezept}
                onClick={() => setAusgewaehlt(rezept)}
              />
            ))}
          </div>
        </>
      )}

      {/* Rezept-Detail-Modal */}
      <Modal
        offen={ausgewaehlt !== null}
        onSchliessen={() => setAusgewaehlt(null)}
        titel={ausgewaehlt?.name ?? ''}
        breite="lg"
      >
        {ausgewaehlt && (
          <RecipeDetail
            rezept={ausgewaehlt}
            onSchliessen={() => setAusgewaehlt(null)}
            onLoeschen={
              ausgewaehlt.id
                ? () => {
                    onLoeschen(ausgewaehlt.id!)
                    setAusgewaehlt(null)
                  }
                : undefined
            }
          />
        )}
      </Modal>
    </div>
  )
}
