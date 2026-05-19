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
      <section className="ui-panel p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="ui-icon ui-icon-warm h-11 w-11">
            <Heart size={18} />
          </div>
          <div>
            <p className="t-eyebrow">Mode sobre</p>
            <h3 className="text-lg font-semibold text-white">Souvenirs partages</h3>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
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
    <section className="ui-panel relative overflow-hidden p-5 md:p-6 space-y-6">
      <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-[var(--color-champagne-soft)] blur-[70px] pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-champagne)]">
            <Trophy size={14} />
            <span className="t-eyebrow text-[var(--color-champagne)]">Palmares live</span>
          </div>
          <h3 className="mt-1 text-xl font-semibold text-white">Le best-of se construit</h3>
        </div>
      </div>

      {showAwards && awards.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {awards.map((award) => (
            <div key={award.id} className="ui-panel-soft p-4">
              <Award size={16} className="text-[var(--color-champagne)]" />
              <p className="mt-3 text-sm font-semibold text-white">{award.title}</p>
              <p className="mt-1 t-caption">{award.subtitle}</p>
              <p className="mt-3 truncate text-sm font-semibold text-[var(--text-primary)]">{award.winner}</p>
              <p className="t-caption">{award.score}</p>
            </div>
          ))}
        </div>
      )}

      {showLeaderboard && contributors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Users size={14} />
            <p className="t-eyebrow">Classement contributeurs</p>
          </div>
          <div className="space-y-2">
            {contributors.map((contributor, index) => (
              <div key={contributor.name} className="ui-panel-soft flex items-center gap-3 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-white/[0.04] text-xs font-semibold text-[var(--text-primary)]">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{contributor.name}</p>
                  <p className="t-caption">
                    {contributor.photos} photo(s) · {contributor.completedChallenges} defi(s) · {contributor.receivedReactions} reaction(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-white">{contributor.points}</p>
                  <p className="t-caption">pts</p>
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
  <div className="ui-panel-soft p-3">
    <p className="text-lg font-semibold tabular-nums text-white">{value}</p>
    <p className="t-caption">{label}</p>
  </div>
)
