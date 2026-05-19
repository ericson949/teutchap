import type React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const Surface = ({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn('bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow-soft)]', className)}>
    {children}
  </div>
)

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
      {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
      <h1 className="ui-page-title">{title}</h1>
      {description && <p className="max-w-xl text-sm leading-6 text-[var(--text-muted)]">{description}</p>}
    </div>
    {action}
  </div>
)

export const PrimaryButton = ({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--text-main)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-white disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]',
      className
    )}
    {...props}
  >
    {children}
  </button>
)

export const SecondaryButton = ({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-main)] transition hover:bg-white/[0.07] disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]',
      className
    )}
    {...props}
  >
    {children}
  </button>
)

export const StatTile = ({
  label,
  value,
  icon
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) => (
  <div className="rounded-2xl border border-[var(--line)] bg-white/[0.025] p-4">
    {icon && <div className="mb-3 text-[var(--accent)]">{icon}</div>}
    <p className="text-2xl font-semibold tabular-nums text-[var(--text-main)]">{value}</p>
    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">{label}</p>
  </div>
)
