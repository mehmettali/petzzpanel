import clsx from 'clsx'

export function Card({ children, className }) {
  return (
    <div className={clsx('rounded-xl bg-white p-6 shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={clsx('mt-1 text-sm text-gray-500', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
