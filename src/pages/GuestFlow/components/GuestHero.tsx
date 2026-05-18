import React from 'react'
import { Hash, Image as ImageIcon } from 'lucide-react'

interface GuestHeroProps {
  eventData: any
  photoCount: number
}

export const GuestHero: React.FC<GuestHeroProps> = ({ eventData, photoCount }) => {
  return (
    <div className="relative h-48 md:h-64 overflow-hidden">
      {eventData.cover_url ? (
        <img src={eventData.cover_url} className="w-full h-full object-cover opacity-60 scale-105" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary to-black flex items-center justify-center">
          <Hash className="text-white/5 animate-float" size={140} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-white/50 text-xs font-medium uppercase tracking-[0.3em] mb-2">
              {new Date(eventData.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-white text-glow leading-[1.1]">{eventData.name}</h1>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full flex items-center space-x-2 text-xs font-medium w-fit">
            <ImageIcon size={14} className="text-white/60" />
            <span className="text-white/90">{photoCount} photos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
