import type React from 'react'
import { Database, Users, Zap } from 'lucide-react'

export const OverviewCapacitySection = ({
  currentPhotos,
  maxPhotos,
  currentGuests,
  maxGuests,
  onUpgrade
}: {
  currentPhotos: number
  maxPhotos: number
  currentGuests: number
  maxGuests: number
  onUpgrade: () => void
}) => {
  const photoPercentage = Math.min(100, Math.round((currentPhotos / maxPhotos) * 100))
  const guestPercentage = Math.min(100, Math.round((currentGuests / maxGuests) * 100))
  const isHighPhotoCapacity = photoPercentage >= 85
  const isHighGuestCapacity = guestPercentage >= 85

  return (
    <div className="space-y-6">
      <CapacityBlock
        icon={<Database size={16} />}
        title="Capacite Cloud"
        label="Occupation du stockage"
        current={currentPhotos}
        max={maxPhotos}
        percentage={photoPercentage}
        isHigh={isHighPhotoCapacity}
        warning="Espace bientot sature"
      />

      <div className="border-t border-[var(--border-subtle)]" />

      <CapacityBlock
        icon={<Users size={16} />}
        title="Membres rejoints"
        label="Limitation des participants"
        current={currentGuests}
        max={maxGuests}
        percentage={guestPercentage}
        isHigh={isHighGuestCapacity}
        warning="Limite de participants atteinte"
      />

      <div className="ui-panel-soft mt-4 space-y-3 p-4">
        <div className="flex items-center gap-2 text-[var(--color-champagne)]">
          <Zap size={11} />
          <span className="t-eyebrow text-[var(--color-champagne)]">Plan Premium</span>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)]">
          {['1 000+ photos HD', 'Mur Live en direct', 'Missions illimitees', 'Co-administrateurs'].map(item => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--color-champagne)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onUpgrade}
        className="btn-primary mt-3 w-full"
      >
        <Zap size={13} />
        <span>Debloquer le Plan Premium</span>
      </button>
    </div>
  )
}

const CapacityBlock = ({
  icon,
  title,
  label,
  current,
  max,
  percentage,
  isHigh,
  warning
}: {
  icon: React.ReactNode
  title: string
  label: string
  current: number
  max: number
  percentage: number
  isHigh: boolean
  warning: string
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`ui-icon h-10 w-10 ${isHigh ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'ui-icon-warm'}`}>
          {icon}
        </div>
        <div>
          <h3 className="mb-1 font-serif text-base leading-none text-white">{title}</h3>
          <span className="t-eyebrow">{label}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="font-serif text-base text-white">
          {current} <span className="mx-1 font-sans text-xs text-white/40">/</span> {max}
        </span>
      </div>
    </div>

    <div className="space-y-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/[0.02] bg-white/[0.05]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${isHigh ? 'bg-red-400 shadow-[0_0_12px_rgba(239,68,68,0.45)]' : 'bg-[var(--text-primary)]'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between t-caption">
        <span>{percentage}% occupe</span>
        {isHigh && <span className="text-red-400">{warning}</span>}
      </div>
    </div>
  </div>
)
