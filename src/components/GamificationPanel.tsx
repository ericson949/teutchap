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
      <section className="glass rounded-[2rem] border border-white/5 p-5 md:p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-blue-200">
            <Heart size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">Contribution discrete</p>
            <h3 className="text-lg font-black text-white">Merci pour vos souvenirs</h3>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-white/45 font-medium">
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
    <section className="glass rounded-[2rem] border border-white/5 p-5 md:p-6 space-y-5 overflow-hidden relative">
      <div className="absolute -right-16 -top-16 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300">
            <Sparkles size={14} className="fill-current" />
            <span className="text-[9px] font-black uppercase tracking-[0.22em]">Progression photo</span>
          </div>
          <h3 className="mt-2 text-xl font-black tracking-tight text-white">{stats.levelLabel}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white tabular-nums">{stats.points}</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-white/40">points</p>
        </div>
      </div>

      <div className="relative z-10 space-y-2">
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/35">
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
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Badges debloques</p>
            <div className="flex flex-wrap gap-2">
              {unlockedBadges.length > 0 ? unlockedBadges.map((badge) => (
                <div key={badge.id} className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-blue-200">
                  <Award size={11} />
                  <span>{badge.label}</span>
                </div>
              )) : (
                <p className="text-[10px] font-bold text-white/35">Ajoutez une premiere photo pour commencer.</p>
              )}
            </div>
            {nextBadge && (
              <p className="mt-2 text-[9px] font-bold text-white/35">
                Prochain badge: <span className="text-white/60">{nextBadge.label}</span>
              </p>
            )}
          </div>

          {topPhotos.length > 0 && (
            <div>
              <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Photos du moment</p>
              <div className="grid grid-cols-3 gap-2">
                {topPhotos.map((photo, index) => (
                  <div key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <img
                      src={photo.url_thumb?.startsWith('blob:') ? photo.url_thumb : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[8px] font-black text-white backdrop-blur">
                      <Trophy size={9} />
                      <span>{index + 1}</span>
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 rounded-full bg-black/65 px-2 py-1 text-[8px] font-black text-white backdrop-blur">
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
  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3">
    <div className="text-blue-300">{icon}</div>
    <p className="mt-2 text-lg font-black tabular-nums text-white">{value}</p>
    <p className="text-[8px] font-black uppercase tracking-widest text-white/35">{label}</p>
  </div>
)
