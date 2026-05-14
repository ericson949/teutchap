

export const OverviewCapacitySection = ({ currentPhotos, maxPhotos }: { currentPhotos: number, maxPhotos: number }) => {
  const percentage = Math.min(100, Math.round((currentPhotos / maxPhotos) * 100))
  
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] p-4.5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[8px] font-black uppercase text-primary block">Capacité Album</span>
          <h3 className="text-xs font-bold text-gray-200">Stockage Souvenirs</h3>
        </div>
        <span className="text-[10px] font-black tabular-nums">{currentPhotos} / {maxPhotos}</span>
      </div>
      
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
