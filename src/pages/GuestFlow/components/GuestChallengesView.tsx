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
        <h2 className="text-xl font-black tracking-tight">Défis en cours</h2>
        {allowGuestChallenges && (
          <button onClick={() => setShowChallengeForm(!showChallengeForm)} className="text-primary text-[10px] font-black uppercase">
            {showChallengeForm ? 'Fermer' : '+ Proposer'}
          </button>
        )}
      </div>

      {allowGuestChallenges && showChallengeForm && (
        <form onSubmit={handleCreateChallengeSubmit} className="glass rounded-2xl p-5 border-primary/20 space-y-3">
          <input required placeholder="Titre du défi" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none" value={newChalTitle} onChange={e => setNewChalTitle(e.target.value)} />
          <button type="submit" className="w-full bg-primary text-white font-black py-3 rounded-xl text-[10px] uppercase">Lancer le défi</button>
        </form>
      )}

      <div className="glass rounded-3xl border border-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300">
              <Sparkles size={13} className="fill-current" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Missions suggerees</span>
            </div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/35">
              Inspirez vos prochaines photos
            </p>
          </div>
          <Target size={18} className="text-white/30" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {templates.map(template => {
            const alreadyActive = activeChallengeIds.has(template.title.toLowerCase())
            return (
              <div key={template.title} className={`rounded-2xl border p-3 ${alreadyActive ? 'border-blue-500/20 bg-blue-500/10' : 'border-white/5 bg-white/[0.03]'}`}>
                <p className="text-xs font-black text-white">{template.title}</p>
                <p className="mt-1 text-[9px] font-semibold leading-relaxed text-white/40">{template.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {challenges.length === 0 ? (
          <div className="text-center py-10 opacity-40">
            <Trophy size={32} className="mx-auto mb-2" />
            <p className="text-xs font-bold uppercase">Aucun défi lancé</p>
          </div>
        ) : (
          challenges.map(c => (
            <div key={c.id} className="glass p-5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-xl text-primary"><Hash size={16} /></div>
                <div>
                  <h3 className="font-black text-sm">{c.title}</h3>
                  <p className="text-[10px] text-gray-500">{c.description || 'Challenge communautaire'}</p>
                </div>
              </div>
              <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black">
                {photoCountPerChallenge[c.id] || 0}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
