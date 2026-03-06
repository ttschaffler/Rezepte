import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Wochenplan, WochenplanTag, MahlzeitTyp, Mahlzeit } from '../types'
import { STANDARD_KALORIEN_ZIEL } from '../types'
import { format, startOfWeek, addDays } from 'date-fns'
import { de } from 'date-fns/locale'

const COLLECTION = 'wochenplaene'

function wocheStartDatum(datum: Date): string {
  const montag = startOfWeek(datum, { locale: de, weekStartsOn: 1 })
  return format(montag, 'yyyy-MM-dd')
}

function erstelleLeereWoche(wocheStart: string): Wochenplan {
  const tage: Record<string, WochenplanTag> = {}
  const start = new Date(wocheStart + 'T00:00:00')
  for (let i = 0; i < 7; i++) {
    const datum = format(addDays(start, i), 'yyyy-MM-dd')
    tage[datum] = {
      datum,
      mahlzeiten: {},
      kalorienZiel: STANDARD_KALORIEN_ZIEL,
    }
  }
  return { wocheStart, tage }
}

export async function getWochenplan(datum: Date = new Date()): Promise<Wochenplan> {
  const wocheStart = wocheStartDatum(datum)
  const docRef = doc(db, COLLECTION, wocheStart)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    return erstelleLeereWoche(wocheStart)
  }

  return { id: snapshot.id, ...snapshot.data() } as Wochenplan
}

export async function wochenplanSpeichern(plan: Wochenplan): Promise<void> {
  const docRef = doc(db, COLLECTION, plan.wocheStart)
  await setDoc(docRef, { ...plan, aktualisiert: serverTimestamp() }, { merge: true })
}

export async function mahlzeitZuordnen(
  wocheStart: string,
  datum: string,
  typ: MahlzeitTyp,
  mahlzeit: Mahlzeit | null
): Promise<void> {
  const docRef = doc(db, COLLECTION, wocheStart)
  const snapshot = await getDoc(docRef)

  let plan: Wochenplan
  if (!snapshot.exists()) {
    plan = erstelleLeereWoche(wocheStart)
  } else {
    plan = { id: snapshot.id, ...snapshot.data() } as Wochenplan
  }

  if (!plan.tage[datum]) {
    plan.tage[datum] = { datum, mahlzeiten: {}, kalorienZiel: STANDARD_KALORIEN_ZIEL }
  }

  if (mahlzeit === null) {
    delete plan.tage[datum].mahlzeiten[typ]
  } else {
    plan.tage[datum].mahlzeiten[typ] = mahlzeit
  }

  await setDoc(docRef, { ...plan, aktualisiert: serverTimestamp() }, { merge: false })
}

export async function kalorienZielSetzen(
  wocheStart: string,
  datum: string,
  ziel: number
): Promise<void> {
  const docRef = doc(db, COLLECTION, wocheStart)
  await updateDoc(docRef, {
    [`tage.${datum}.kalorienZiel`]: ziel,
    aktualisiert: serverTimestamp(),
  })
}

export { wocheStartDatum, erstelleLeereWoche }
