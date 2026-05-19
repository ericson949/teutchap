import type React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ArrowLeft, Loader2, AlertTriangle, Inbox } from 'lucide-react'

/* ──────────────────────────────────────────────
   TEUTCHAP — UI PRIMITIVES
   Reusable building blocks for the entire app.
   ────────────────────────────────────────────── */

// ── Utility ────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Layout ─────────────────────────────────────

/**
 * PageShell — wraps every page with consistent background,
 * padding, max-width, and the ambient glow effect.
 */
export const PageShell = ({
  children,
  className = '',
  maxWidth = 'max-w-5xl',
  noPadding = false,
}: {
  children: React.ReactNode
  className?: string
  maxWidth?: string
  noPadding?: boolean
}) => (
  <div className={cn('min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col relative overflow-x-hidden', className)}>
    {/* Ambient background glow */}
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      <div className="glow-accent top-[8%] right-[5%] animate-pulse-slow" />
      <div className="glow-accent bottom-[15%] left-[3%] animate-pulse-slow" style={{ animationDelay: '3s' }} />
    </div>
    <div className={cn(
      'relative z-10 flex-1 flex flex-col mx-auto w-full',
      maxWidth,
      !noPadding && 'px-5 py-6 md:px-8'
    )}>
      {children}
    </div>
  </div>
)

// ── App Header ─────────────────────────────────

interface AppHeaderProps {
  title: string
  eyebrow?: string
  onBack?: () => void
  action?: React.ReactNode
  sticky?: boolean
}

export const AppHeader = ({
  title,
  eyebrow,
  onBack,
  action,
  sticky = true,
}: AppHeaderProps) => (
  <header
    className={cn(
      'flex items-center justify-between gap-4 py-4',
      sticky && 'sticky top-0 z-40 bg-[var(--bg-app)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] -mx-5 px-5 md:-mx-8 md:px-8'
    )}
  >
    <div className="flex items-center gap-3 min-w-0">
      {onBack && (
        <button
          onClick={onBack}
          className="glass border border-[var(--border-default)] w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] transition-all hover:bg-white/5 active:scale-95 shrink-0"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="min-w-0">
        {eyebrow && <p className="t-eyebrow mb-0.5">{eyebrow}</p>}
        <h1 className="t-title truncate">{title}</h1>
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>
)

// ── Page Header (non-sticky, for content areas) ──

export const PageHeader = ({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}) => (
  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="space-y-2">
      {eyebrow && <p className="t-eyebrow">{eyebrow}</p>}
      <h1 className="t-title">{title}</h1>
      {description && <p className="t-body max-w-xl">{description}</p>}
    </div>
    {action}
  </div>
)

// ── Cards ──────────────────────────────────────

type CardVariant = 'default' | 'glass' | 'elevated'

const cardVariantStyles: Record<CardVariant, string> = {
  default: 'surface-card',
  glass: 'glass rounded-[var(--radius-md)]',
  elevated: 'surface-elevated',
}

export const Card = ({
  children,
  variant = 'default',
  className = '',
  padding = 'p-5 md:p-6',
}: {
  children: React.ReactNode
  variant?: CardVariant
  className?: string
  padding?: string
}) => (
  <div className={cn(cardVariantStyles[variant], padding, className)}>
    {children}
  </div>
)

/** Legacy alias */
export const Surface = Card

// ── Buttons ────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger'
  isLoading?: boolean
}

const btnVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  danger: 'btn-danger',
}

export const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={cn(btnVariants[variant], className)}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? <Loader2 size={16} className="animate-spin" /> : children}
  </button>
)

/** Legacy aliases */
export const PrimaryButton = ({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button variant="primary" className={className} {...props}>
    {children}
  </Button>
)

export const SecondaryButton = ({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button variant="secondary" className={className} {...props}>
    {children}
  </Button>
)

// ── Toggle ─────────────────────────────────────

export const Toggle = ({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
  description?: string
}) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full border transition-colors duration-200 shrink-0',
        checked
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent-glow)]'
          : 'border-[var(--border-default)] bg-white/5'
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-1'
        )}
      />
    </button>
    {(label || description) && (
      <div className="space-y-0.5">
        {label && <span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>}
        {description && <p className="text-[10px] text-[var(--text-secondary)] leading-tight">{description}</p>}
      </div>
    )}
  </label>
)

// ── Badge ──────────────────────────────────────

type BadgeVariant = 'default' | 'accent' | 'success' | 'danger' | 'muted'

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'border-[var(--border-default)] bg-white/5 text-[var(--text-secondary)]',
  accent: 'border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  danger: 'border-red-500/30 bg-red-500/10 text-red-400',
  muted: 'border-transparent bg-white/[0.04] text-[var(--text-tertiary)]',
}

export const Badge = ({
  children,
  variant = 'default',
  className = '',
  icon,
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  icon?: React.ReactNode
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
      badgeStyles[variant],
      className
    )}
  >
    {icon}
    {children}
  </span>
)

// ── Stat Tile ──────────────────────────────────

export const StatTile = ({
  label,
  value,
  icon
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) => (
  <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white/[0.025] p-4">
    {icon && <div className="mb-3 text-[var(--color-accent)]">{icon}</div>}
    <p className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
    <p className="mt-1 t-eyebrow">{label}</p>
  </div>
)

// ── Modal ──────────────────────────────────────

export const Modal = ({
  children,
  isOpen,
  onClose,
  maxWidth = 'max-w-md',
}: {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  maxWidth?: string
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative w-full surface-elevated rounded-[var(--radius-lg)] overflow-hidden',
          maxWidth
        )}
      >
        {children}
      </div>
    </div>
  )
}

// ── Status Screens ─────────────────────────────

interface StatusScreenProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const LoadingScreen = ({ message = 'Chargement...' }: { message?: string }) => (
  <PageShell className="items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <Loader2 size={28} className="text-[var(--color-accent)] animate-spin" />
      <p className="t-eyebrow">{message}</p>
    </div>
  </PageShell>
)

export const ErrorScreen = ({ title, description, action }: StatusScreenProps) => (
  <PageShell className="items-center justify-center text-center">
    <div className="flex flex-col items-center gap-6 max-w-sm">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)]">
        <AlertTriangle size={28} />
      </div>
      <div className="space-y-2">
        <h2 className="t-title">{title}</h2>
        {description && <p className="t-body">{description}</p>}
      </div>
      {action}
    </div>
  </PageShell>
)

export const EmptyScreen = ({ title, description, icon, action }: StatusScreenProps) => (
  <Card variant="glass" className="rounded-[var(--radius-lg)] border-dashed py-16 flex flex-col items-center justify-center text-center">
    <div className="mb-6 rounded-full bg-white/5 p-6">
      {icon || <Inbox size={36} className="text-[var(--text-tertiary)]" />}
    </div>
    <h3 className="t-title mb-1">{title}</h3>
    {description && <p className="t-body max-w-xs">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </Card>
)

// ── Error Message ──────────────────────────────

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="rounded-[var(--radius-sm)] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
    {message}
  </div>
)

// ── Spinner ────────────────────────────────────

export const Spinner = ({ size = 16 }: { size?: number }) => (
  <Loader2 size={size} className="animate-spin" />
)
