import clsx from 'clsx'

export default function StatCard({ title, value, icon: Icon, trend, trendUp, className, valueClassName }) {
  return (
    <div className={clsx('rounded-xl bg-white p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={clsx('mt-1 text-2xl font-bold', valueClassName || 'text-gray-900')}>
            {value}
          </p>
          {trend && (
            <p className={clsx(
              'mt-1 text-sm font-medium',
              trendUp ? 'text-green-600' : 'text-red-600'
            )}>
              {trendUp ? '+' : ''}{trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary-50 p-3">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        )}
      </div>
    </div>
  )
}
