import { Hourglass, Check } from 'lucide-react'

export const OverviewTimerSection = ({ timeRemaining }: any) => {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            {timeRemaining.phase === 'finished' ? <Check size={14} /> : <Hourglass size={14} className="animate-spin" />}
          </div>
          <div>
            <span className="text-[8px] font-black uppercase text-accent block">Cycle en direct</span>
            <h3 className="text-xs font-bold text-gray-200">{timeRemaining.label}</h3>
          </div>
        </div>
      </div>

      {timeRemaining.phase !== 'finished' && (
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {[
            { v: timeRemaining.days, l: 'J' },
            { v: timeRemaining.hours, l: 'H' },
            { v: timeRemaining.minutes, l: 'M' },
            { v: timeRemaining.seconds, l: 'S', color: 'text-accent' }
          ].map((t, i) => (
            <div key={i} className="bg-black/40 rounded-xl py-2">
              <span className={`text-lg font-black ${t.color || 'text-white'}`}>{String(t.v).padStart(2, '0')}</span>
              <span className="text-[7px] font-black uppercase text-gray-500 block">{t.l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
