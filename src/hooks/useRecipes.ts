import { useState, useEffect, useCallback } from 'react'
import type { Rezept } from '../types'
import { getAlleRezepte, rezeptSpeichern, rezeptAktualisieren, rezeptLoeschen } from '../services/recipeService'
import { uploadRecipeImage, deleteRecipeImage } from '../services/imageService'

export function useRecipes() {
  const [rezepte, setRezepte] = useState<Rezept[]>([])
  const [laden, setLaden] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden_ = useCallback(async () => {
    try {
      setLaden(true)
      setFehler(null)
      const daten = await getAlleRezepte()
      setRezepte(daten)
    } catch (e) {
      setFehler('Rezepte konnten nicht geladen werden. Bitte Firebase konfigurieren.')
      console.error(e)
    } finally {
      setLaden(false)
    }
  }, [])

  useEffect(() => {
    laden_()
  }, [laden_])

  const hinzufuegen = useCallback(async (rezept: Omit<Rezept, 'id'>, bildDatei?: File): Promise<string> => {
    const id = await rezeptSpeichern(rezept)

    let bildUrl: string | undefined
    let bildPfad: string | undefined
    if (bildDatei) {
      const result = await uploadRecipeImage(bildDatei, id)
      bildUrl = result.url
      bildPfad = result.pfad
      await rezeptAktualisieren(id, { bildUrl, bildPfad })
    }

    const neuesRezept: Rezept = {
      ...rezept,
      id,
      bildUrl,
      bildPfad,
      erstellt: new Date(),
      aktualisiert: new Date(),
    }
    setRezepte((prev) => [neuesRezept, ...prev])
    return id
  }, [])

  const aktualisieren = useCallback(async (id: string, rezept: Partial<Rezept>, bildDatei?: File): Promise<void> => {
    let update = { ...rezept }

    if (bildDatei) {
      const altes = rezepte.find((r) => r.id === id)
      if (altes?.bildPfad) {
        await deleteRecipeImage(altes.bildPfad)
      }
      const { url, pfad } = await uploadRecipeImage(bildDatei, id)
      update = { ...update, bildUrl: url, bildPfad: pfad }
    }

    await rezeptAktualisieren(id, update)
    setRezepte((prev) => prev.map((r) => r.id === id ? { ...r, ...update, aktualisiert: new Date() } : r))
  }, [rezepte])

  const loeschen = useCallback(async (id: string): Promise<void> => {
    const rezept = rezepte.find((r) => r.id === id)
    if (rezept?.bildPfad) {
      await deleteRecipeImage(rezept.bildPfad)
    }
    await rezeptLoeschen(id)
    setRezepte((prev) => prev.filter((r) => r.id !== id))
  }, [rezepte])

  return { rezepte, laden, fehler, hinzufuegen, aktualisieren, loeschen, neu_laden: laden_ }
}
