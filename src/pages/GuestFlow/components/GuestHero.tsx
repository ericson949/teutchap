import React from 'react'
import { Hash, Image as ImageIcon } from 'lucide-react'

interface GuestHeroProps {
  eventData: any
  photoCount: number
}

export const GuestHero: React.FC<GuestHeroProps> = ({ eventData, photoCount }) => {
  return (
    <div className="relative mx-4 mt-4 h-48 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-2xl md:h-64">
      {eventData.cover_url ? (
        <img src={eventData.cover_url} className="h-full w-full scale-105 object-cover opacity-65" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#151312] via-[#111114] to-[var(--bg-app)]">
          <div className="absolute right-[-12%] top-[18%] h-[250px] w-[250px] rounded-full bg-[var(--color-champagne-soft)] blur-[80px]" />
          <div className="absolute bottom-[8%] left-[-10%] h-[220px] w-[220px] rounded-full bg-[var(--color-accent-soft)] blur-[90px]" />
          <Hash className="text-white/[0.035] animate-float stroke-[1.5]" size={140} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-app)] via-[var(--bg-app)]/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-1">
            <p className="t-eyebrow text-[var(--color-champagne)]">
              {new Date(eventData.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="font-serif text-4xl leading-[1.05] text-white text-glow md:text-5xl">{eventData.name}</h1>
          </div>
          <div className="ui-chip ui-chip-warm w-fit">
            <ImageIcon size={14} />
            <span>{photoCount} photos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
