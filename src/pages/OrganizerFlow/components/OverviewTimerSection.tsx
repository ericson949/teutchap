import { Hourglass, Check } from 'lucide-react'
import { TimeRemaining } from '../../../types'

interface OverviewTimerSectionProps {
  timeRemaining: TimeRemaining;
}

export const OverviewTimerSection = ({ timeRemaining }: OverviewTimerSectionProps) => {
  const isFinished = timeRemaining.phase === 'finished'

  return (
    <div className="glass-dark border border-white/5 hover:border-white/10 transition-all duration-500 rounded-[2rem] p-6 space-y-4 shadow-2xl relative overflow-hidden group">
      {/* Background Decorative Mesh Glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full -mr-8 -mt-8 pointer-events-none transition-all duration-700 ${isFinished ? 'bg-green-500/10' : 'bg-accent/15'}`} />

      <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${isFinished ? 'bg-green-500/10 text-green-400' : 'bg-accent/10 text-accent group-hover:scale-105'}`}>
            {isFinished ? <Check size={16} /> : <Hourglass size={16} className="animate-spin" />}
          </div>
          <div>
            <span className={`text-[8px] font-black uppercase tracking-widest block ${isFinished ? 'text-green-400' : 'text-accent-light'}`}>
              {isFinished ? 'Album scellé' : 'Cycle Temps Réel'}
            </span>
            <h3 className="text-xs font-black text-gray-200 tracking-tight">{timeRemaining.label}</h3>
          </div>
        </div>
        {!isFinished && (
          <div className="flex items-center space-x-1.5 bg-accent/5 border border-accent/10 px-3 py-1 rounded-full text-[8px] font-black uppercase text-accent tracking-widest animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>En cours</span>
          </div>
        )}
      </div>

      {!isFinished && (
        <div className="grid grid-cols-4 gap-2 text-center relative z-10">
          {[
            { v: timeRemaining.days, l: 'Jours' },
            { v: timeRemaining.hours, l: 'Heures' },
            { v: timeRemaining.minutes, l: 'Min' },
            { v: timeRemaining.seconds, l: 'Sec', color: 'text-accent font-black shadow-accent/20' }
          ].map((t, i) => (
            <div key={i} className="bg-black/40 border border-white/5 rounded-2xl py-3 group-hover:border-white/10 transition-colors shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              <span className={`text-xl md:text-2xl font-black block tracking-tight ${t.color || 'text-white'}`}>
                {String(t.v).padStart(2, '0')}
              </span>
              <span className="text-[7px] font-black uppercase text-gray-500 tracking-widest mt-0.5 block">{t.l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
