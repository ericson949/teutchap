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
      <div className={cn(
        "max-w-md mx-auto flex items-center justify-around p-1.5 rounded-[2rem] border backdrop-blur-2xl shadow-2xl",
        "bg-white/5 border-white/10",
        variant === 'bottom' ? "h-16" : "h-14"
      )}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full rounded-2xl transition-all duration-500 group",
                isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 rounded-2xl blur-[2px] animate-pulse-slow" />
              )}
              {isActive && (
                <div className="absolute inset-0 bg-white/5 border border-white/20 rounded-2xl" />
              )}
              
              <div className={cn(
                "relative z-10 flex flex-col items-center gap-1",
                isActive && "scale-110 transition-transform duration-300"
              )}>
                {tab.icon && (
                  <span className={cn(
                    "transition-colors",
                    isActive ? "text-primary-light" : "group-hover:text-gray-400"
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
