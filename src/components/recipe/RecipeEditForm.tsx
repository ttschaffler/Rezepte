import { useState } from 'react'
import type { Rezept, Zutat } from '../../types'
import { useDropzone } from 'react-dropzone'
import { generatePlaceholderImage } from '../../services/imageService'

interface RecipeEditFormProps {
  rezept: Partial<Rezept>
  initialBildDatei?: File
  onSpeichern: (rezept: Omit<Rezept, 'id'>, bildDatei?: File) => void
  onAbbrechen: () => void
  laden?: boolean
}

export function RecipeEditForm({ rezept, initialBildDatei, onSpeichern, onAbbrechen, laden = false }: RecipeEditFormProps) {
  const [name, setName] = useState(rezept.name ?? '')
  const [beschreibung, setBeschreibung] = useState(rezept.beschreibung ?? '')
  const [zutaten, setZutaten] = useState<Zutat[]>(rezept.zutaten ?? [])
  const [schritte, setSchritte] = useState<string[]>(rezept.zubereitungsschritte ?? [''])
  const [dauer, setDauer] = useState(String(rezept.zubereitungsdauer ?? 30))
  const [kalorien, setKalorien] = useState(String(rezept.kalorien ?? 400))
  const [portionen, setPortionen] = useState(String(rezept.portionen ?? 4))
  const [bildDatei, setBildDatei] = useState<File | null>(initialBildDatei ?? null)
  const [bildVorschau, setBildVorschau] = useState<string>(
    rezept.bildUrl ?? (initialBildDatei ? URL.createObjectURL(initialBildDatei) : '')
  )

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: (files) => {
      if (files[0]) {
        setBildDatei(files[0])
        setBildVorschau(URL.createObjectURL(files[0]))
      }
    },
  })

  const zutat_hinzufuegen = () => {
    setZutaten([...zutaten, { name: '', menge: '', einheit: 'g' }])
  }

  const zutat_aendern = (i: number, feld: keyof Zutat, wert: string) => {
    const neu = [...zutaten]
    neu[i] = { ...neu[i], [feld]: feld === 'menge' ? (isNaN(Number(wert)) ? wert : Number(wert)) : wert }
    setZutaten(neu)
  }

  const zutat_entfernen = (i: number) => {
    setZutaten(zutaten.filter((_, idx) => idx !== i))
  }

  const schritt_aendern = (i: number, wert: string) => {
    const neu = [...schritte]
    neu[i] = wert
    setSchritte(neu)
  }

  const schritt_hinzufuegen = () => setSchritte([...schritte, ''])
  const schritt_entfernen = (i: number) => setSchritte(schritte.filter((_, idx) => idx !== i))

  const speichern = () => {
    const finalBildUrl = bildVorschau || generatePlaceholderImage(name)
    onSpeichern(
      {
        name,
        beschreibung,
        zutaten,
        zubereitungsschritte: schritte.filter((s) => s.trim()),
        zubereitungsdauer: Number(dauer) || 30,
        kalorien: Number(kalorien) || 400,
        portionen: Number(portionen) || 4,
        bildUrl: bildDatei ? undefined : finalBildUrl,
        quelle: rezept.quelle,
        quelleTyp: rezept.quelleTyp,
      },
      bildDatei ?? undefined
    )
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Bild */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Bild</label>
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-brand-300 transition-colors"
        >
          <input {...getInputProps()} />
          {bildVorschau ? (
            <div className="relative">
              <img src={bildVorschau} alt="Vorschau" className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs">Bild ändern</span>
              </div>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-400">
              <span>📷 Bild hochladen</span>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          placeholder="Rezeptname"
        />
      </div>

      {/* Beschreibung */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Beschreibung</label>
        <textarea
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          rows={2}
          className="w-full p-2.5 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
          placeholder="Kurze Beschreibung"
        />
      </div>

      {/* Metadaten */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Zeit (Min)</label>
          <input
            type="number"
            value={dauer}
            onChange={(e) => setDauer(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">kcal/Portion</label>
          <input
            type="number"
            value={kalorien}
            onChange={(e) => setKalorien(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Portionen</label>
          <input
            type="number"
            value={portionen}
            onChange={(e) => setPortionen(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
      </div>

      {/* Zutaten */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Zutaten</label>
        <div className="space-y-1.5">
          {zutaten.map((z, i) => (
            <div key={i} className="flex gap-1.5">
              <input
                value={String(z.menge)}
                onChange={(e) => zutat_aendern(i, 'menge', e.target.value)}
                className="w-16 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
                placeholder="250"
              />
              <select
                value={z.einheit}
                onChange={(e) => zutat_aendern(i, 'einheit', e.target.value)}
                className="w-20 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {['g', 'kg', 'ml', 'l', 'TL', 'EL', 'Stück', 'Prise', 'Bund', 'Zehe'].map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
              <input
                value={z.name}
                onChange={(e) => zutat_aendern(i, 'name', e.target.value)}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
                placeholder="Zutat"
              />
              <button
                onClick={() => zutat_entfernen(i)}
                className="w-8 h-9 text-red-400 hover:text-red-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={zutat_hinzufuegen}
            className="text-brand-500 hover:text-brand-600 text-xs font-medium"
          >
            + Zutat hinzufügen
          </button>
        </div>
      </div>

      {/* Schritte */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Zubereitung</label>
        <div className="space-y-1.5">
          {schritte.map((s, i) => (
            <div key={i} className="flex gap-1.5">
              <span className="flex-shrink-0 w-6 h-9 flex items-center justify-center text-xs font-bold text-brand-500">
                {i + 1}.
              </span>
              <input
                value={s}
                onChange={(e) => schritt_aendern(i, e.target.value)}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
                placeholder={`Schritt ${i + 1}`}
              />
              <button
                onClick={() => schritt_entfernen(i)}
                className="w-8 text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={schritt_hinzufuegen}
            className="text-brand-500 hover:text-brand-600 text-xs font-medium"
          >
            + Schritt hinzufügen
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2 border-t">
        <button
          onClick={onAbbrechen}
          disabled={laden}
          className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={speichern}
          disabled={laden || !name.trim()}
          className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white rounded-xl font-medium transition-colors"
        >
          {laden ? 'Speichere...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}
