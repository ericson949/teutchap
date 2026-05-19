import { Award, Heart, Trophy, Users } from 'lucide-react'
import { getContributorLeaderboard, getEventAwards, isSoberEvent } from '../lib/gamification'

interface EventAwardsProps {
  photos: any[]
  reactions: Record<string, Record<string, number>>
  challenges?: any[]
  eventType?: string
  gamificationMode?: string
  showLeaderboard?: boolean
  showAwards?: boolean
}

export default function EventAwards({
  photos,
  reactions,
  challenges = [],
  eventType,
  gamificationMode,
  showLeaderboard = true,
  showAwards = true
}: EventAwardsProps) {
  const soberMode = isSoberEvent(eventType, gamificationMode)
  const contributors = getContributorLeaderboard(photos, reactions, 5)
  const awards = getEventAwards(photos, reactions, challenges)

  if (soberMode) {
    return (
      <section className="glass rounded-[2rem] border border-white/5 p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-blue-200">
            <Heart size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">Mode sobre</p>
            <h3 className="text-lg font-black text-white">Souvenirs partages</h3>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-white/45 font-medium">
          Les classements publics sont masques pour garder une experience calme et respectueuse.
          Les contributions restent visibles dans l album.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <SoftMetric label="Photos" value={photos.length} />
          <SoftMetric label="Invites" value={contributors.length} />
          <SoftMetric label="Defis" value={challenges.length} />
        </div>
      </section>
    )
  }

  if (photos.length === 0) return null

  return (
    <section className="glass rounded-[2rem] border border-white/5 p-5 md:p-6 space-y-6 overflow-hidden relative">
      <div className="absolute -left-12 -top-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300">
            <Trophy size={14} className="fill-current" />
            <span className="text-[9px] font-black uppercase tracking-[0.22em]">Palmares live</span>
          </div>
          <h3 className="mt-1 text-xl font-black tracking-tight text-white">Le best-of se construit</h3>
        </div>
      </div>

      {showAwards && awards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {awards.map((award) => (
            <div key={award.id} className="rounded-3xl bg-white/[0.03] border border-white/[0.06] p-4">
              <Award size={16} className="text-blue-300" />
              <p className="mt-3 text-xs font-black uppercase tracking-wider text-white">{award.title}</p>
              <p className="mt-1 text-[9px] font-semibold text-white/35">{award.subtitle}</p>
              <p className="mt-3 text-sm font-black text-blue-200 truncate">{award.winner}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/35">{award.score}</p>
            </div>
          ))}
        </div>
      )}

      {showLeaderboard && contributors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white/45">
            <Users size={14} />
            <p className="text-[9px] font-black uppercase tracking-[0.2em]">Classement contributeurs</p>
          </div>
          <div className="space-y-2">
            {contributors.map((contributor, index) => (
              <div key={contributor.name} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-200">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-white truncate">{contributor.name}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/35">
                    {contributor.photos} photo(s) · {contributor.completedChallenges} defi(s) · {contributor.receivedReactions} reaction(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white tabular-nums">{contributor.points}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/35">pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

const SoftMetric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3">
    <p className="text-lg font-black text-white tabular-nums">{value}</p>
    <p className="text-[8px] font-black uppercase tracking-widest text-white/35">{label}</p>
  </div>
)
