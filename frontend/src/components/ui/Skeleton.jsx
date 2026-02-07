// ============================================
// PETZZ PANEL - MERKEZİ SKELETON COMPONENTLERI
// Yükleme animasyonları için kullanılır
// ============================================

import { memo } from 'react'

// Base Skeleton Component
export const Skeleton = memo(({ className = '', variant = 'rectangular' }) => {
  const baseClass = 'animate-pulse bg-gray-200'
  const variantClass = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-lg'

  return <div className={`${baseClass} ${variantClass} ${className}`} />
})

Skeleton.displayName = 'Skeleton'

// Product Card Skeleton
export const ProductCardSkeleton = memo(({ variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Skeleton className="aspect-square" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between items-center mt-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-3 w-3" variant="circular" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
})

ProductCardSkeleton.displayName = 'ProductCardSkeleton'

// Product Grid Skeleton
export const ProductGridSkeleton = memo(({ count = 4, columns = { sm: 2, md: 4 } }) => {
  const gridClass = `grid grid-cols-${columns.sm} md:grid-cols-${columns.md} gap-4`

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
})

ProductGridSkeleton.displayName = 'ProductGridSkeleton'

// Category Card Skeleton
export const CategoryCardSkeleton = memo(({ variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className="flex flex-col items-center p-4 bg-white border border-gray-100 rounded-2xl">
        <Skeleton className="w-12 h-12 mb-2" variant="circular" />
        <Skeleton className="h-4 w-16" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <Skeleton className="aspect-[4/3]" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
})

CategoryCardSkeleton.displayName = 'CategoryCardSkeleton'

// Category Grid Skeleton
export const CategoryGridSkeleton = memo(({ count = 6 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <CategoryCardSkeleton key={i} />
    ))}
  </div>
))

CategoryGridSkeleton.displayName = 'CategoryGridSkeleton'

// Table Row Skeleton
export const TableRowSkeleton = memo(({ columns = 5 }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
))

TableRowSkeleton.displayName = 'TableRowSkeleton'

// Table Skeleton
export const TableSkeleton = memo(({ rows = 5, columns = 5 }) => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
))

TableSkeleton.displayName = 'TableSkeleton'

// Card Skeleton
export const CardSkeleton = memo(({ hasImage = false, lines = 3 }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
    {hasImage && <Skeleton className="aspect-video rounded-lg" />}
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
      />
    ))}
  </div>
))

CardSkeleton.displayName = 'CardSkeleton'

// Stats Card Skeleton
export const StatsCardSkeleton = memo(() => (
  <div className="bg-white rounded-xl border border-gray-100 p-4">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8" variant="circular" />
    </div>
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
))

StatsCardSkeleton.displayName = 'StatsCardSkeleton'

// Banner Skeleton
export const BannerSkeleton = memo(() => (
  <div className="bg-gray-100 rounded-2xl p-6 md:p-8">
    <div className="max-w-xl space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-3 mt-4">
        <Skeleton className="h-12 w-36 rounded-lg" />
        <Skeleton className="h-12 w-36 rounded-lg" />
      </div>
    </div>
  </div>
))

BannerSkeleton.displayName = 'BannerSkeleton'

// Page Skeleton - Full page loading
export const PageSkeleton = memo(({ showHeader = true, showSidebar = false }) => (
  <div className="min-h-screen bg-gray-50">
    {showHeader && (
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-64 rounded-lg" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-8" variant="circular" />
            <Skeleton className="h-8 w-8" variant="circular" />
          </div>
        </div>
      </div>
    )}
    <div className="flex">
      {showSidebar && (
        <div className="w-64 bg-white border-r p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      )}
      <div className="flex-1 p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton hasImage lines={4} />
      </div>
    </div>
  </div>
))

PageSkeleton.displayName = 'PageSkeleton'

// Default export
export default {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  CategoryCardSkeleton,
  CategoryGridSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  CardSkeleton,
  StatsCardSkeleton,
  BannerSkeleton,
  PageSkeleton
}
