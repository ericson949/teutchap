import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface PremiumTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'top' | 'bottom';
}

export default function PremiumTabs({ tabs, activeTab, onChange, className, variant = 'top' }: PremiumTabsProps) {
  return (
    <div className={cn(
      "w-full z-40 transition-all duration-300",
      variant === 'bottom' ? "fixed bottom-0 left-0 right-0 p-4" : "sticky top-0 mb-6",
      className
    )}>
      <div 
        style={{ WebkitBackdropFilter: 'blur(20px)' }}
        className={cn(
          "max-w-md mx-auto flex items-center justify-around p-1 rounded-2xl border backdrop-blur-xl shadow-[var(--shadow-soft)]",
          "bg-[rgba(17,18,23,0.86)] border-[var(--line)]",
          variant === 'bottom' ? "h-16" : "h-14"
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all duration-300 group",
                isActive ? "text-white" : "text-[var(--text-muted)] hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/10" />
              )}
              
              <div className={cn(
                "relative z-10 flex flex-col items-center gap-1",
                isActive && "transition-transform duration-300"
              )}>
                {tab.icon && (
                  <span className={cn(
                    "transition-colors",
                    isActive ? "text-[var(--accent)]" : "group-hover:text-white"
                  )}>
                    {tab.icon}
                  </span>
                )}
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.15em]",
                  isActive ? "opacity-100" : "opacity-60"
                )}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
