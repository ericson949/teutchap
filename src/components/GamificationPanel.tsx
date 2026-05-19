import { Award, Camera, Heart, Sparkles, Target, Trophy } from 'lucide-react'
import type React from 'react'
import { getGamificationStats, getPhotoLeaderboard, isSoberEvent } from '../lib/gamification'

interface GamificationPanelProps {
  photos: any[]
  reactions: Record<string, Record<string, number>>
  guestPseudo?: string
  compact?: boolean
  eventType?: string
  gamificationMode?: string
}

export default function GamificationPanel({ photos, reactions, guestPseudo, compact = false, eventType, gamificationMode }: GamificationPanelProps) {
  if (gamificationMode === 'off') return null
  if (isSoberEvent(eventType, gamificationMode)) {
    return (
      <section className="ui-panel p-5 md:p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="ui-icon ui-icon-warm h-11 w-11">
            <Heart size={18} />
          </div>
          <div>
            <p className="t-eyebrow">Contribution discrete</p>
            <h3 className="text-lg font-semibold text-white">Merci pour vos souvenirs</h3>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          Pour cet evenement, Teutchap garde une experience sobre: pas de classement visible, seulement des souvenirs partages.
        </p>
      </section>
    )
  }

  const stats = getGamificationStats(photos, reactions, guestPseudo)
  const topPhotos = getPhotoLeaderboard(photos, reactions)
  const unlockedBadges = stats.badges.filter((badge) => badge.unlocked)
  const nextBadge = stats.badges.find((badge) => !badge.unlocked)

  return (
    <section className="ui-panel relative overflow-hidden p-5 md:p-6 space-y-5">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--color-champagne-soft)] blur-[70px] pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-champagne)]">
            <Sparkles size={14} />
            <span className="t-eyebrow text-[var(--color-champagne)]">Progression photo</span>
          </div>
          <h3 className="mt-2 text-xl font-semibold text-white">{stats.levelLabel}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums text-white">{stats.points}</p>
          <p className="t-caption">points</p>
        </div>
      </div>

      <div className="relative z-10 space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-[var(--text-primary)] transition-all duration-700"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between t-caption">
          <span>Niveau {stats.level}</span>
          <span>{stats.nextLevelPoints} pts</span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2">
        <Metric icon={<Camera size={14} />} label="Photos" value={stats.ownPhotos} />
        <Metric icon={<Target size={14} />} label="Defis" value={stats.completedChallenges} />
        <Metric icon={<Heart size={14} />} label="Reactions" value={stats.receivedReactions} />
      </div>

      {!compact && (
        <div className="relative z-10 space-y-4">
          <div>
            <p className="mb-2 t-eyebrow">Badges debloques</p>
            <div className="flex flex-wrap gap-2">
              {unlockedBadges.length > 0 ? unlockedBadges.map((badge) => (
                <div key={badge.id} className="ui-chip ui-chip-warm">
                  <Award size={11} />
                  <span>{badge.label}</span>
                </div>
              )) : (
                <p className="text-sm text-[var(--text-tertiary)]">Ajoutez une premiere photo pour commencer.</p>
              )}
            </div>
            {nextBadge && (
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Prochain badge: <span className="text-[var(--text-secondary)]">{nextBadge.label}</span>
              </p>
            )}
          </div>

          {topPhotos.length > 0 && (
            <div>
              <p className="mb-2 t-eyebrow">Photos du moment</p>
              <div className="grid grid-cols-3 gap-2">
                {topPhotos.map((photo, index) => (
                  <div key={photo.id} className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-white/5">
                    <img
                      src={photo.url_thumb?.startsWith('blob:') ? photo.url_thumb : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
                      <Trophy size={9} />
                      <span>{index + 1}</span>
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
                      {photo.reactionTotal}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="ui-panel-soft p-3">
    <div className="text-[var(--color-champagne)]">{icon}</div>
    <p className="mt-2 text-lg font-semibold tabular-nums text-white">{value}</p>
    <p className="t-caption">{label}</p>
  </div>
)
