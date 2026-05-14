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
      <div className="absolute inset-0 bg-gradient-to-t from-[#08060d] via-transparent to-transparent" />
      
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 flex flex-col justify-end space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gradient leading-none">{eventData.name}</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">
              {new Date(eventData.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="glass px-3 py-1 rounded-full flex items-center space-x-1.5 border-white/5 text-[10px] font-bold">
            <ImageIcon size={12} className="text-primary" />
            <span>{photoCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
