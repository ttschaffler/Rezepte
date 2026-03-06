import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../config/firebase'

export async function uploadRecipeImage(file: File, recipeId: string): Promise<{ url: string; pfad: string }> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const pfad = `rezepte-bilder/${recipeId}.${ext}`
  const storageRef = ref(storage, pfad)

  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  return { url, pfad }
}

export async function deleteRecipeImage(pfad: string): Promise<void> {
  try {
    const storageRef = ref(storage, pfad)
    await deleteObject(storageRef)
  } catch {
    // Datei existiert möglicherweise nicht mehr
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Entferne den Data-URL-Prefix (z.B. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file, 'utf-8')
  })
}

export function getImageMediaType(file: File): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  const type = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  const supported: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (supported.includes(type)) return type
  return 'image/jpeg'
}

// Erstelle einen Farbverlauf-Platzhalter als Data-URL basierend auf dem Rezeptnamen
export function generatePlaceholderImage(name: string): string {
  const colors = [
    ['#f97316', '#ef4444'],
    ['#22c55e', '#16a34a'],
    ['#3b82f6', '#6366f1'],
    ['#f59e0b', '#f97316'],
    ['#ec4899', '#f43f5e'],
    ['#14b8a6', '#06b6d4'],
  ]
  const index = name.charCodeAt(0) % colors.length
  const [c1, c2] = colors[index]

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c1}"/>
        <stop offset="100%" style="stop-color:${c2}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <text x="200" y="130" font-family="sans-serif" font-size="60" text-anchor="middle" fill="white" opacity="0.9">🍽️</text>
    <text x="200" y="200" font-family="sans-serif" font-size="18" text-anchor="middle" fill="white" opacity="0.85" font-weight="bold">${name.slice(0, 25)}</text>
  </svg>`

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}
