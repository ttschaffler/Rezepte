import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Rezept } from '../types'

const COLLECTION = 'rezepte'

export async function getAlleRezepte(): Promise<Rezept[]> {
  const q = query(collection(db, COLLECTION), orderBy('erstellt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    erstellt: doc.data().erstellt?.toDate(),
    aktualisiert: doc.data().aktualisiert?.toDate(),
  })) as Rezept[]
}

export async function getRezept(id: string): Promise<Rezept | null> {
  const docRef = doc(db, COLLECTION, id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return {
    id: snapshot.id,
    ...snapshot.data(),
    erstellt: snapshot.data().erstellt?.toDate(),
    aktualisiert: snapshot.data().aktualisiert?.toDate(),
  } as Rezept
}

export async function rezeptSpeichern(rezept: Omit<Rezept, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...rezept,
    erstellt: serverTimestamp(),
    aktualisiert: serverTimestamp(),
  })
  return docRef.id
}

export async function rezeptAktualisieren(id: string, rezept: Partial<Rezept>): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    ...rezept,
    aktualisiert: serverTimestamp(),
  })
}

export async function rezeptLoeschen(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await deleteDoc(docRef)
}
