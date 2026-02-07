import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Check, AlertCircle, Loader2, Activity, Database } from 'lucide-react'
import { getSyncStatus, startSync } from '../../services/api'
import { formatRelativeTime } from '../../utils/formatters'
import clsx from 'clsx'

// Mini progress bar component
function MiniProgressBar({ percent }) {
  return (
    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default function Header() {
  const queryClient = useQueryClient()

  const { data: syncStatus } = useQuery({
    queryKey: ['syncStatus'],
    queryFn: getSyncStatus,
    refetchInterval: (data) => data?.isRunning ? 1000 : false,
  })

  const syncMutation = useMutation({
    mutationFn: startSync,
    onSuccess: () => {
      queryClient.invalidateQueries(['syncStatus'])
    },
  })

  const isRunning = syncStatus?.isRunning || syncMutation.isPending

  // Faz etiketi
  const getPhaseLabel = (phase) => {
    switch (phase) {
      case 'fetching': return 'API\'den çekiliyor'
      case 'processing': return 'İşleniyor'
      case 'saving': return 'Kaydediliyor'
      default: return 'Başlatılıyor'
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        {/* Breadcrumb or page title can go here */}
      </div>

      <div className="flex items-center gap-4">
        {/* Sync Status */}
        <div className="flex items-center gap-2 text-sm">
          {syncStatus?.status === 'completed' && !isRunning && (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">
                Son sync: {formatRelativeTime(syncStatus.lastSync)}
              </span>
              {syncStatus?.stats && (
                <span className="text-gray-400 text-xs">
                  ({syncStatus.stats.totalProducts?.toLocaleString('tr-TR')} ürün)
                </span>
              )}
            </>
          )}

          {syncStatus?.status === 'failed' && !isRunning && (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-600">Senkronizasyon hatası</span>
            </>
          )}

          {isRunning && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 animate-pulse text-primary-500" />
                <span className="text-primary-600 font-medium">
                  {getPhaseLabel(syncStatus?.phase)}
                </span>
              </div>
              <MiniProgressBar percent={syncStatus?.percentComplete || 0} />
              <span className="text-primary-700 font-semibold min-w-[50px]">
                %{syncStatus?.percentComplete?.toFixed(1) || 0}
              </span>
              {syncStatus?.itemsPerSecond > 0 && (
                <span className="text-gray-500 text-xs">
                  ({syncStatus.itemsPerSecond}/sn)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sync Button */}
        <button
          onClick={() => syncMutation.mutate()}
          disabled={isRunning}
          className={clsx(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            isRunning
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-sm hover:shadow'
          )}
        >
          <RefreshCw className={clsx('h-4 w-4', isRunning && 'animate-spin')} />
          {isRunning ? 'Senkronize Ediliyor...' : 'Verileri Güncelle'}
        </button>
      </div>
    </header>
  )
}
