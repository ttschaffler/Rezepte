import { useState } from 'react'
import type { Rezept } from './types'
import { useRecipes } from './hooks/useRecipes'
import { Header } from './components/layout/Header'
import { RecipeList } from './components/recipe/RecipeList'
import { RecipeImport } from './components/recipe/RecipeImport'
import { RecipeEditForm } from './components/recipe/RecipeEditForm'
import { WeeklyPlanner } from './components/mealplan/WeeklyPlanner'
import { Modal } from './components/ui/Modal'

type ImportSchritt = 'quelle' | 'bearbeiten'

export function App() {
  const { rezepte, laden, fehler, hinzufuegen, loeschen } = useRecipes()
  const [aktiveTab, setAktiveTab] = useState<'wochenplan' | 'rezepte'>('wochenplan')
  const [importOffen, setImportOffen] = useState(false)
  const [importSchritt, setImportSchritt] = useState<ImportSchritt>('quelle')
  const [extrahiertesRezept, setExtrahiertesRezept] = useState<Partial<Rezept> | null>(null)
  const [initialBildDatei, setInitialBildDatei] = useState<File | undefined>(undefined)
  const [speichernLaden, setSpeichernLaden] = useState(false)

  const importOeffnen = () => {
    setImportSchritt('quelle')
    setExtrahiertesRezept(null)
    setInitialBildDatei(undefined)
    setImportOffen(true)
  }

  const importSchliessen = () => {
    setImportOffen(false)
    setExtrahiertesRezept(null)
    setInitialBildDatei(undefined)
  }

  const rezeptExtrahiert = (rezept: Partial<Rezept>, bildDatei?: File) => {
    setExtrahiertesRezept(rezept)
    setInitialBildDatei(bildDatei)
    setImportSchritt('bearbeiten')
  }

  const rezeptSpeichern = async (rezept: Omit<Rezept, 'id'>, bildDatei?: File) => {
    setSpeichernLaden(true)
    try {
      await hinzufuegen(rezept, bildDatei)
      importSchliessen()
      setAktiveTab('rezepte')
    } finally {
      setSpeichernLaden(false)
    }
  }

  const modalTitel =
    importSchritt === 'quelle' ? 'Rezept importieren' : 'Rezept überprüfen & speichern'

  return (
    <div className="min-h-screen">
      <Header
        aktiveTab={aktiveTab}
        onTabWechsel={setAktiveTab}
        onRezeptImport={importOeffnen}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {aktiveTab === 'wochenplan' && (
          <WeeklyPlanner rezepte={rezepte} />
        )}

        {aktiveTab === 'rezepte' && (
          <RecipeList
            rezepte={rezepte}
            laden={laden}
            fehler={fehler}
            onLoeschen={loeschen}
            onRezeptImport={importOeffnen}
          />
        )}
      </main>

      {/* Import-Modal */}
      <Modal
        offen={importOffen}
        onSchliessen={importSchliessen}
        titel={modalTitel}
        breite="xl"
      >
        {importSchritt === 'quelle' ? (
          <RecipeImport
            onRezeptExtrahiert={rezeptExtrahiert}
            onAbbrechen={importSchliessen}
          />
        ) : extrahiertesRezept ? (
          <RecipeEditForm
            rezept={extrahiertesRezept}
            initialBildDatei={initialBildDatei}
            onSpeichern={rezeptSpeichern}
            onAbbrechen={() => setImportSchritt('quelle')}
            laden={speichernLaden}
          />
        ) : null}
      </Modal>
    </div>
  )
}
