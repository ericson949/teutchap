import React from 'react'
import { Trophy, Hash, Sparkles, Target } from 'lucide-react'
import { getChallengeTemplates } from '../../../lib/gamification'

interface GuestChallengesViewProps {
  challenges: any[]
  photoCountPerChallenge: any
  showChallengeForm: boolean
  setShowChallengeForm: (val: boolean) => void
  handleCreateChallengeSubmit: (e: React.FormEvent) => void
  newChalTitle: string
  setNewChalTitle: (val: string) => void
  allowGuestChallenges?: boolean
  eventType?: string
}

export const GuestChallengesView: React.FC<GuestChallengesViewProps> = ({
  challenges, photoCountPerChallenge, showChallengeForm, setShowChallengeForm,
  handleCreateChallengeSubmit, newChalTitle, setNewChalTitle, allowGuestChallenges = false,
  eventType
}) => {
  const templates = getChallengeTemplates(eventType).slice(0, 4)
  const activeChallengeIds = new Set(challenges.map(c => c.title?.toLowerCase()))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-white">Missions photo</h2>
        {allowGuestChallenges && (
          <button onClick={() => setShowChallengeForm(!showChallengeForm)} className="text-sm font-semibold text-[var(--text-primary)]">
            {showChallengeForm ? 'Fermer' : 'Proposer'}
          </button>
        )}
      </div>

      {allowGuestChallenges && showChallengeForm && (
        <form onSubmit={handleCreateChallengeSubmit} className="ui-panel p-5 space-y-3">
          <input required placeholder="Titre de la mission" className="ui-input pl-4" value={newChalTitle} onChange={e => setNewChalTitle(e.target.value)} />
          <button type="submit" className="btn-accent w-full">Lancer la mission</button>
        </form>
      )}

      <div className="ui-panel p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--color-champagne)]">
              <Sparkles size={13} />
              <span className="t-eyebrow text-[var(--color-champagne)]">Suggestions</span>
            </div>
            <p className="mt-1 t-caption">Inspirez les prochaines photos</p>
          </div>
          <Target size={18} className="text-[var(--text-tertiary)]" />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {templates.map(template => {
            const alreadyActive = activeChallengeIds.has(template.title.toLowerCase())
            return (
              <div key={template.title} className={`rounded-[var(--radius-md)] border p-3 ${alreadyActive ? 'border-[var(--color-champagne)]/25 bg-[var(--color-champagne-soft)]' : 'border-[var(--border-subtle)] bg-white/[0.025]'}`}>
                <p className="text-sm font-semibold text-white">{template.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{template.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {challenges.length === 0 ? (
          <div className="py-10 text-center text-[var(--text-tertiary)]">
            <Trophy size={32} className="mx-auto mb-2" />
            <p className="text-sm font-semibold">Aucune mission lancee</p>
          </div>
        ) : (
          challenges.map(c => (
            <div key={c.id} className="ui-panel-soft flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="ui-icon ui-icon-warm h-10 w-10"><Hash size={16} /></div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{c.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{c.description || 'Mission communautaire'}</p>
                </div>
              </div>
              <div className="ui-chip">
                {photoCountPerChallenge[c.id] || 0}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
