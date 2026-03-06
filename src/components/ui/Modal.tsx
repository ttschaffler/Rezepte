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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onSchliessen}
      />
      {/* Modal-Inhalt */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${BREITE_KLASSEN[breite]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{titel}</h2>
          <button
            onClick={onSchliessen}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  )
}
