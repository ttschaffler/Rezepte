interface HeaderProps {
  aktiveTab: 'wochenplan' | 'rezepte'
  onTabWechsel: (tab: 'wochenplan' | 'rezepte') => void
  onRezeptImport: () => void
}

export function Header({ aktiveTab, onTabWechsel, onRezeptImport }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-bold text-gray-800">Kochplan</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => onTabWechsel('wochenplan')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                aktiveTab === 'wochenplan'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📅 Wochenplan
            </button>
            <button
              onClick={() => onTabWechsel('rezepte')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                aktiveTab === 'rezepte'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📖 Rezepte
            </button>
          </nav>

          {/* Rezept importieren */}
          <button
            onClick={onRezeptImport}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <span>+</span>
            <span className="hidden sm:inline">Rezept importieren</span>
          </button>
        </div>
      </div>
    </header>
  )
}
