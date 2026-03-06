interface LoadingSpinnerProps {
  text?: string
  gross?: boolean
}

export function LoadingSpinner({ text, gross = false }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin ${
          gross ? 'w-12 h-12' : 'w-8 h-8'
        }`}
      />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  )
}
