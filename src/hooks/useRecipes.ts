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

    if (bildDatei) {
      const { url, pfad } = await uploadRecipeImage(bildDatei, id)
      await rezeptAktualisieren(id, { bildUrl: url, bildPfad: pfad })
    }

    await laden_()
    return id
  }, [laden_])

  const aktualisieren = useCallback(async (id: string, rezept: Partial<Rezept>, bildDatei?: File): Promise<void> => {
    let update = { ...rezept }

    if (bildDatei) {
      // Altes Bild löschen wenn vorhanden
      const altes = rezepte.find((r) => r.id === id)
      if (altes?.bildPfad) {
        await deleteRecipeImage(altes.bildPfad)
      }
      const { url, pfad } = await uploadRecipeImage(bildDatei, id)
      update = { ...update, bildUrl: url, bildPfad: pfad }
    }

    await rezeptAktualisieren(id, update)
    await laden_()
  }, [laden_, rezepte])

  const loeschen = useCallback(async (id: string): Promise<void> => {
    const rezept = rezepte.find((r) => r.id === id)
    if (rezept?.bildPfad) {
      await deleteRecipeImage(rezept.bildPfad)
    }
    await rezeptLoeschen(id)
    await laden_()
  }, [laden_, rezepte])

  return { rezepte, laden, fehler, hinzufuegen, aktualisieren, loeschen, neu_laden: laden_ }
}
