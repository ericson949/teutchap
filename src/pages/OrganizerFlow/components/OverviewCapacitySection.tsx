import { Database } from 'lucide-react'

export const OverviewCapacitySection = ({ currentPhotos, maxPhotos }: { currentPhotos: number, maxPhotos: number }) => {
  const percentage = Math.min(100, Math.round((currentPhotos / maxPhotos) * 100))
  const isHighCapacity = percentage >= 85

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-white/[0.08] p-2 border border-white/[0.05]">
            <Database size={16} className={isHighCapacity ? 'text-red-400' : 'text-white/80'} />
          </div>
          <div>
            <h3 className="text-xl font-serif text-white tracking-tight leading-none mb-1">Capacité Cloud</h3>
            <span className="text-[9px] font-semibold uppercase text-white/50 tracking-[0.2em]">Occupation du stockage</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-serif text-white tracking-tight">
            {currentPhotos} <span className="text-white/40 text-sm font-sans mx-1">/</span> {maxPhotos}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.02]">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isHighCapacity ? 'bg-red-400' : 'bg-white/80'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-[0.15em] text-white/50">
          <span>{percentage}% Occupé</span>
          {isHighCapacity && <span className="text-red-400">Espace bientôt saturé</span>}
        </div>
      </div>
    </div>
  )
}
