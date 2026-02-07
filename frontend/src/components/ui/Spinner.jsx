import clsx from 'clsx'

export default function Spinner({ className, size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={clsx('animate-spin rounded-full border-2 border-gray-200 border-t-primary-600', sizes[size], className)} />
  )
}

export function LoadingState({ message = 'Yukleniyor...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-500">{message}</p>
    </div>
  )
}

export function ErrorState({ message = 'Bir hata olustu', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-red-100 p-3">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <p className="mt-4 text-gray-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Tekrar Dene
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'Veri bulunamadi', icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {Icon && <Icon className="h-12 w-12 text-gray-300" />}
      <p className="mt-4 text-gray-500">{message}</p>
    </div>
  )
}
