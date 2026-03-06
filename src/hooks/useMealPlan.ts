import { useState, useEffect, useCallback } from 'react'
import type { Wochenplan, MahlzeitTyp, Mahlzeit } from '../types'
import {
  getWochenplan,
  mahlzeitZuordnen,
  kalorienZielSetzen,
  wocheStartDatum,
} from '../services/mealPlanService'
import { startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { de } from 'date-fns/locale'

export function useMealPlan() {
  const [aktuellesMontagDatum, setAktuellesMontagDatum] = useState<Date>(() =>
    startOfWeek(new Date(), { locale: de, weekStartsOn: 1 })
  )
  const [wochenplan, setWochenplan] = useState<Wochenplan | null>(null)
  const [laden, setLaden] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden_ = useCallback(async (datum: Date) => {
    try {
      setLaden(true)
      setFehler(null)
      const plan = await getWochenplan(datum)
      setWochenplan(plan)
    } catch (e) {
      setFehler('Wochenplan konnte nicht geladen werden.')
      console.error(e)
    } finally {
      setLaden(false)
    }
  }, [])

  useEffect(() => {
    laden_(aktuellesMontagDatum)
  }, [laden_, aktuellesMontagDatum])

  const vorherige_woche = useCallback(() => {
    setAktuellesMontagDatum((prev) => subWeeks(prev, 1))
  }, [])

  const naechste_woche = useCallback(() => {
    setAktuellesMontagDatum((prev) => addWeeks(prev, 1))
  }, [])

  const mahlzeit_zuordnen = useCallback(
    async (datum: string, typ: MahlzeitTyp, mahlzeit: Mahlzeit | null) => {
      const wStart = wocheStartDatum(aktuellesMontagDatum)
      await mahlzeitZuordnen(wStart, datum, typ, mahlzeit)
      await laden_(aktuellesMontagDatum)
    },
    [aktuellesMontagDatum, laden_]
  )

  const kalorien_ziel_setzen = useCallback(
    async (datum: string, ziel: number) => {
      const wStart = wocheStartDatum(aktuellesMontagDatum)
      await kalorienZielSetzen(wStart, datum, ziel)
      await laden_(aktuellesMontagDatum)
    },
    [aktuellesMontagDatum, laden_]
  )

  return {
    wochenplan,
    laden,
    fehler,
    aktuellesMontagDatum,
    vorherige_woche,
    naechste_woche,
    mahlzeit_zuordnen,
    kalorien_ziel_setzen,
    neu_laden: () => laden_(aktuellesMontagDatum),
  }
}
