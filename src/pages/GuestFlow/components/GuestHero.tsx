import React from 'react'
import { Hash, Image as ImageIcon } from 'lucide-react'

interface GuestHeroProps {
  eventData: any
  photoCount: number
}

export const GuestHero: React.FC<GuestHeroProps> = ({ eventData, photoCount }) => {
  return (
    <div className="relative h-48 md:h-64 overflow-hidden rounded-[32px] border border-white/[0.04] mx-4 mt-4 shadow-2xl">
      {eventData.cover_url ? (
        <img src={eventData.cover_url} className="w-full h-full object-cover opacity-60 scale-105" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-900/30 to-[#08060d] flex items-center justify-center overflow-hidden">
          {/* Subtle glowing mesh shapes */}
          <div className="absolute top-[20%] right-[-10%] w-[250px] h-[250px] bg-blue-500/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-[10%] left-[-10%] w-[200px] h-[200px] bg-cyan-500/10 blur-[80px] rounded-full" />
          <Hash className="text-white/[0.02] animate-float stroke-[1.5]" size={140} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08060d] via-transparent to-transparent" />
      
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-blue-400/70 text-[10px] font-bold uppercase tracking-[0.25em] mb-1">
              {new Date(eventData.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-white text-glow leading-[1.1]">{eventData.name}</h1>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl px-4 py-1.5 rounded-full flex items-center space-x-2 text-xs font-semibold w-fit text-blue-300">
            <ImageIcon size={14} className="text-blue-400" />
            <span>{photoCount} photos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
