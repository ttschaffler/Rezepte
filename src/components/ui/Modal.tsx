import { useEffect } from 'react'

interface ModalProps {
  offen: boolean
  onSchliessen: () => void
  titel: string
  children: React.ReactNode
  breite?: 'sm' | 'md' | 'lg' | 'xl'
}

const BREITE_KLASSEN = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({ offen, onSchliessen, titel, children, breite = 'md' }: ModalProps) {
  useEffect(() => {
    if (offen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [offen])

  if (!offen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Hintergrund */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onSchliessen}
      />
      {/* Modal-Inhalt */}
      <div
        className={`relative rounded-2xl shadow-2xl w-full ${BREITE_KLASSEN[breite]} max-h-[90vh] flex flex-col border border-[#334155]`}
        style={{ backgroundColor: '#1a1f28', backdropFilter: 'blur(8px)' }}
      >
        {/* Header mit Gold-Akzent-Balken */}
        <div className="flex items-center justify-between p-5 border-b border-[#334155]">
          <h2 className="text-lg font-display font-semibold text-slate-100 flex items-center gap-2 section-bar">
            {titel}
          </h2>
          <button
            onClick={onSchliessen}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-200 transition-colors"
            style={{ backgroundColor: '#232934' }}
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  )
}
