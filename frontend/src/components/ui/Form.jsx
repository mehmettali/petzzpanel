// ============================================
// PETZZ PANEL - MERKEZİ FORM COMPONENTLERI
// Tutarlı form elemanları için kullanılır
// ============================================

import { memo, forwardRef } from 'react'
import { Search, ChevronDown, Eye, EyeOff, X } from 'lucide-react'
import clsx from 'clsx'

// ==================== INPUT ====================
export const Input = memo(forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  const variants = {
    default: 'border-gray-300 focus:border-[#EF7F1A] focus:ring-[#EF7F1A]/20',
    filled: 'border-transparent bg-gray-100 focus:bg-white focus:border-[#EF7F1A]',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
  }

  const inputVariant = error ? 'error' : variant

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full border rounded-lg transition-all focus:outline-none focus:ring-2',
            sizes[size],
            variants[inputVariant],
            Icon && iconPosition === 'left' && 'pl-10',
            Icon && iconPosition === 'right' && 'pr-10',
            className
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  )
}))

Input.displayName = 'Input'

// ==================== SEARCH INPUT ====================
export const SearchInput = memo(forwardRef(({
  onClear,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const sizes = {
    sm: 'pl-9 pr-8 py-1.5 text-sm',
    md: 'pl-10 pr-10 py-2.5 text-sm',
    lg: 'pl-12 pr-12 py-3 text-base'
  }

  const iconSizes = {
    sm: 'w-4 h-4 left-2.5',
    md: 'w-5 h-5 left-3',
    lg: 'w-5 h-5 left-4'
  }

  return (
    <div className="relative">
      <Search className={clsx('absolute top-1/2 -translate-y-1/2 text-gray-400', iconSizes[size])} />
      <input
        ref={ref}
        type="text"
        className={clsx(
          'w-full border border-gray-300 rounded-lg transition-all',
          'focus:outline-none focus:border-[#EF7F1A] focus:ring-2 focus:ring-[#EF7F1A]/20',
          sizes[size],
          className
        )}
        {...props}
      />
      {props.value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}))

SearchInput.displayName = 'SearchInput'

// ==================== SELECT ====================
export const Select = memo(forwardRef(({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Seçiniz...',
  size = 'md',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'w-full border rounded-lg appearance-none cursor-pointer transition-all',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 focus:border-[#EF7F1A] focus:ring-[#EF7F1A]/20',
            sizes[size],
            'pr-10',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  )
}))

Select.displayName = 'Select'

// ==================== TEXTAREA ====================
export const Textarea = memo(forwardRef(({
  label,
  error,
  hint,
  rows = 4,
  className = '',
  containerClassName = '',
  ...props
}, ref) => (
  <div className={containerClassName}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      rows={rows}
      className={clsx(
        'w-full px-4 py-2.5 border rounded-lg text-sm transition-all resize-none',
        'focus:outline-none focus:ring-2',
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
          : 'border-gray-300 focus:border-[#EF7F1A] focus:ring-[#EF7F1A]/20',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
  </div>
)))

Textarea.displayName = 'Textarea'

// ==================== CHECKBOX ====================
export const Checkbox = memo(forwardRef(({
  label,
  description,
  className = '',
  ...props
}, ref) => (
  <label className={clsx('flex items-start gap-3 cursor-pointer', className)}>
    <input
      ref={ref}
      type="checkbox"
      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#EF7F1A] focus:ring-[#EF7F1A]/20 cursor-pointer"
      {...props}
    />
    <div>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  </label>
)))

Checkbox.displayName = 'Checkbox'

// ==================== RADIO ====================
export const Radio = memo(forwardRef(({
  label,
  description,
  className = '',
  ...props
}, ref) => (
  <label className={clsx('flex items-start gap-3 cursor-pointer', className)}>
    <input
      ref={ref}
      type="radio"
      className="mt-0.5 w-4 h-4 border-gray-300 text-[#EF7F1A] focus:ring-[#EF7F1A]/20 cursor-pointer"
      {...props}
    />
    <div>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  </label>
)))

Radio.displayName = 'Radio'

// ==================== BUTTON ====================
export const Button = memo(forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-[#EF7F1A] hover:bg-[#D66A0F] text-white shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    outline: 'border-2 border-[#EF7F1A] text-[#EF7F1A] hover:bg-[#EF7F1A] hover:text-white',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all',
        'focus:outline-none focus:ring-2 focus:ring-[#EF7F1A]/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <div className={clsx('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
      ) : (
        Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
    </button>
  )
}))

Button.displayName = 'Button'

// ==================== FORM GROUP ====================
export const FormGroup = memo(({ children, className = '' }) => (
  <div className={clsx('space-y-4', className)}>
    {children}
  </div>
))

FormGroup.displayName = 'FormGroup'

// ==================== FORM ROW ====================
export const FormRow = memo(({ children, cols = 2, className = '' }) => (
  <div className={clsx(`grid gap-4`, `grid-cols-1 md:grid-cols-${cols}`, className)}>
    {children}
  </div>
))

FormRow.displayName = 'FormRow'

// ==================== FIELD GROUP ====================
export const FieldGroup = memo(({ label, children, className = '' }) => (
  <fieldset className={clsx('border border-gray-200 rounded-lg p-4', className)}>
    {label && (
      <legend className="px-2 text-sm font-medium text-gray-700">{label}</legend>
    )}
    {children}
  </fieldset>
))

FieldGroup.displayName = 'FieldGroup'

// Default export
export default {
  Input,
  SearchInput,
  Select,
  Textarea,
  Checkbox,
  Radio,
  Button,
  FormGroup,
  FormRow,
  FieldGroup
}
