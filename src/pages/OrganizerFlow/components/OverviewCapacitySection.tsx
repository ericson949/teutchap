import { Database, Users, Zap } from 'lucide-react'

export const OverviewCapacitySection = ({ 
  currentPhotos, 
  maxPhotos, 
  currentGuests, 
  maxGuests, 
  onUpgrade 
}: { 
  currentPhotos: number, 
  maxPhotos: number, 
  currentGuests: number, 
  maxGuests: number, 
  onUpgrade: () => void 
}) => {
  const photoPercentage = Math.min(100, Math.round((currentPhotos / maxPhotos) * 100))
  const guestPercentage = Math.min(100, Math.round((currentGuests / maxGuests) * 100))
  const isHighPhotoCapacity = photoPercentage >= 85
  const isHighGuestCapacity = guestPercentage >= 85

  return (
    <div className="space-y-6">
      {/* 1. CAPACITÉ STOCKAGE PHOTOS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-blue-500/10 p-2 border border-blue-500/20 text-blue-400">
              <Database size={16} className={isHighPhotoCapacity ? 'text-red-400' : 'text-blue-400'} />
            </div>
            <div>
              <h3 className="text-base font-serif text-white tracking-tight leading-none mb-1">Capacité Cloud</h3>
              <span className="text-[9px] font-semibold uppercase text-white/50 tracking-[0.2em]">Occupation du stockage</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-serif text-white tracking-tight">
              {currentPhotos} <span className="text-white/40 text-xs font-sans mx-1">/</span> {maxPhotos}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.02]">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isHighPhotoCapacity ? 'bg-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]'}`}
              style={{ width: `${photoPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-[0.15em] text-white/50">
            <span>{photoPercentage}% Occupé</span>
            {isHighPhotoCapacity && <span className="text-red-400">Espace bientôt saturé</span>}
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]" />

      {/* 2. LIMITATION DES PARTICIPANTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-blue-500/10 p-2 border border-blue-500/20 text-blue-400">
              <Users size={16} className={isHighGuestCapacity ? 'text-red-400' : 'text-blue-400'} />
            </div>
            <div>
              <h3 className="text-base font-serif text-white tracking-tight leading-none mb-1">Membres Rejoints</h3>
              <span className="text-[9px] font-semibold uppercase text-white/50 tracking-[0.2em]">Limitation des participants</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-serif text-white tracking-tight">
              {currentGuests} <span className="text-white/40 text-xs font-sans mx-1">/</span> {maxGuests}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.02]">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isHighGuestCapacity ? 'bg-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]'}`}
              style={{ width: `${guestPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-[0.15em] text-white/50">
            <span>{guestPercentage}% Occupé</span>
            {isHighGuestCapacity && <span className="text-red-400">Limite de participants atteinte</span>}
          </div>
        </div>
      </div>

      {/* Premium Perks Teaser */}
      <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-4 mt-4 space-y-3">
        <div className="flex items-center space-x-2 text-[9px] font-black text-blue-400 uppercase tracking-[0.15em]">
          <Zap size={11} className="fill-current animate-pulse text-blue-400" />
          <span>Libérez la puissance de l'événement</span>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-white/60 font-medium">
          <li className="flex items-center space-x-2">
            <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
            <span>1 000+ photos HD</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
            <span>Mur Live en Direct</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
            <span>Défis illimités</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
            <span>Co-Administrateurs</span>
          </li>
        </ul>
      </div>

      <button 
        onClick={onUpgrade}
        className="w-full mt-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/30 hover:border-blue-400/50 text-blue-300 hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 active:scale-[0.98] shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10"
      >
        <Zap size={13} className="fill-current text-blue-400 animate-bounce" style={{ animationDuration: '2s' }} />
        <span>Débloquer le Plan Premium</span>
      </button>
    </div>
  )
}
