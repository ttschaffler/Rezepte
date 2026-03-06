export interface Zutat {
  name: string
  menge: number | string
  einheit: string // g, kg, ml, l, TL, EL, Stück, Prise, etc.
}

export interface Rezept {
  id?: string
  name: string
  beschreibung?: string
  zutaten: Zutat[]
  zubereitungsschritte: string[]
  zubereitungsdauer: number // Minuten
  kalorien: number // pro Portion
  portionen: number
  bildUrl?: string
  bildPfad?: string // Firebase Storage Pfad
  quelle?: string // Quell-URL oder Beschreibung
  quelleTyp?: 'datei' | 'instagram' | 'facebook' | 'text' | 'url'
  erstellt?: Date
  aktualisiert?: Date
}

export type MahlzeitTyp = 'fruehstueck' | 'mittagessen' | 'abendessen'

export const MAHLZEIT_LABELS: Record<MahlzeitTyp, string> = {
  fruehstueck: 'Frühstück',
  mittagessen: 'Mittagessen',
  abendessen: 'Abendessen',
}

export interface Mahlzeit {
  rezeptId: string
  mahlzeitTyp: MahlzeitTyp
  portionen: number
}

export interface WochenplanTag {
  datum: string // YYYY-MM-DD
  mahlzeiten: Partial<Record<MahlzeitTyp, Mahlzeit>>
  kalorienZiel: number
}

export interface Wochenplan {
  id?: string
  wocheStart: string // YYYY-MM-DD (Montag der Woche)
  tage: Record<string, WochenplanTag> // key = YYYY-MM-DD
}

export const TAGE_DE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

export const STANDARD_KALORIEN_ZIEL = 2000
