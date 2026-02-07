// ============================================
// PETZZ PANEL - MERKEZİ MODAL/DIALOG COMPONENTLERI
// Popup ve dialog pencereleri için kullanılır
// ============================================

import { memo, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { Button } from './Form'

// ==================== MODAL ====================
export const Modal = memo(({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  footer,
  className = ''
}) => {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-4xl'
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={clsx(
          'relative w-full bg-white rounded-2xl shadow-2xl',
          'transform transition-all',
          'max-h-[90vh] flex flex-col',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
})

Modal.displayName = 'Modal'

// ==================== CONFIRM DIALOG ====================
export const ConfirmDialog = memo(({
  isOpen,
  onClose,
  onConfirm,
  title = 'Onay',
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'danger',
  loading = false
}) => {
  const variants = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonVariant: 'danger'
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonVariant: 'primary'
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonVariant: 'primary'
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonVariant: 'success'
    }
  }

  const config = variants[variant]
  const IconComponent = config.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4', config.iconBg)}>
          <IconComponent className={clsx('w-6 h-6', config.iconColor)} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {message && <p className="text-gray-600 mb-6">{message}</p>}
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
})

ConfirmDialog.displayName = 'ConfirmDialog'

// ==================== ALERT DIALOG ====================
export const AlertDialog = memo(({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'Tamam',
  variant = 'info'
}) => {
  const variants = {
    error: {
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  }

  const config = variants[variant]
  const IconComponent = config.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4', config.iconBg)}>
          <IconComponent className={clsx('w-6 h-6', config.iconColor)} />
        </div>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>}
        {message && <p className="text-gray-600 mb-6">{message}</p>}
        <Button variant="primary" onClick={onClose} fullWidth>
          {buttonText}
        </Button>
      </div>
    </Modal>
  )
})

AlertDialog.displayName = 'AlertDialog'

// ==================== DRAWER ====================
export const Drawer = memo(({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  showCloseButton = true,
  closeOnOverlay = true,
  footer
}) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full w-full'
  }

  const positions = {
    left: 'left-0',
    right: 'right-0'
  }

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Drawer */}
      <div
        className={clsx(
          'absolute top-0 bottom-0 w-full bg-white shadow-2xl flex flex-col',
          sizes[size],
          positions[position]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(drawerContent, document.body)
})

Drawer.displayName = 'Drawer'

// ==================== TOOLTIP ====================
export const Tooltip = memo(({
  children,
  content,
  position = 'top',
  className = ''
}) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={clsx(
          'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'transition-all duration-200 whitespace-nowrap',
          positions[position],
          className
        )}
      >
        {content}
      </div>
    </div>
  )
})

Tooltip.displayName = 'Tooltip'

// Default export
export default {
  Modal,
  ConfirmDialog,
  AlertDialog,
  Drawer,
  Tooltip
}
