import clsx from 'clsx'

const variants = {
  default: 'bg-gray-100 text-gray-700',
  secondary: 'bg-gray-50 text-gray-600 border border-gray-200',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  primary: 'bg-primary-100 text-primary-700',
}

const sizes = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

export default function Badge({ children, variant = 'default', size = 'md', className }) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full font-medium',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}
