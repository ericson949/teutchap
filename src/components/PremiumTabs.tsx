import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface PremiumTabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
  variant?: 'top' | 'bottom'
}

export default function PremiumTabs({ tabs, activeTab, onChange, className, variant = 'top' }: PremiumTabsProps) {
  return (
    <div className={cn(
      'w-full z-40 transition-all duration-300',
      variant === 'bottom' ? 'fixed bottom-0 left-0 right-0 p-4' : 'sticky top-0 mb-6',
      className
    )}>
      <div
        style={{ WebkitBackdropFilter: 'blur(20px)' }}
        className={cn(
          'mx-auto flex max-w-md items-center justify-around rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[rgba(17,17,20,0.88)] p-1 shadow-[var(--shadow-soft)] backdrop-blur-xl',
          variant === 'bottom' ? 'h-16' : 'h-14'
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'group relative flex h-full flex-1 flex-col items-center justify-center rounded-[var(--radius-sm)] transition-all duration-300',
                isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-white'
              )}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-[var(--radius-sm)] border border-white/10 bg-white/[0.075]" />
              )}

              <div className="relative z-10 flex flex-col items-center gap-1">
                {tab.icon && (
                  <span className={cn(
                    'transition-colors',
                    isActive ? 'text-[var(--text-primary)]' : 'group-hover:text-white'
                  )}>
                    {tab.icon}
                  </span>
                )}
                <span className={cn(
                  'text-[10px] font-semibold',
                  isActive ? 'opacity-100' : 'opacity-65'
                )}>
                  {tab.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
