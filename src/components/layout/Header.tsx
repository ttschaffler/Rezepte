interface HeaderProps {
  aktiveTab: 'wochenplan' | 'rezepte'
  onTabWechsel: (tab: 'wochenplan' | 'rezepte') => void
  onRezeptImport: () => void
}

export function Header({ aktiveTab, onTabWechsel, onRezeptImport }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#334155]" style={{ backgroundColor: '#1a1f28' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-display font-bold text-[#d4af37]">Kochplan</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor: '#0f1419' }}>
            <button
              onClick={() => onTabWechsel('wochenplan')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                aktiveTab === 'wochenplan'
                  ? 'text-[#0f1419] font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={aktiveTab === 'wochenplan' ? { background: 'linear-gradient(135deg, #d4af37, #f0c840)' } : {}}
            >
              📅 Wochenplan
            </button>
            <button
              onClick={() => onTabWechsel('rezepte')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                aktiveTab === 'rezepte'
                  ? 'text-[#0f1419] font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={aktiveTab === 'rezepte' ? { background: 'linear-gradient(135deg, #d4af37, #f0c840)' } : {}}
            >
              📖 Rezepte
            </button>
          </nav>

          {/* Rezept importieren */}
          <button
            onClick={onRezeptImport}
            className="flex items-center gap-2 text-[#0f1419] px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #d4af37, #f0c840)' }}
          >
            <span>+</span>
            <span className="hidden sm:inline">Rezept importieren</span>
          </button>
        </div>
      </div>
    </header>
  )
}
