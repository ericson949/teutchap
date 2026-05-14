import React from 'react'
import { Trophy, Hash } from 'lucide-react'

interface GuestChallengesViewProps {
  challenges: any[]
  photoCountPerChallenge: any
  showChallengeForm: boolean
  setShowChallengeForm: (val: boolean) => void
  handleCreateChallengeSubmit: (e: React.FormEvent) => void
  newChalTitle: string
  setNewChalTitle: (val: string) => void
}

export const GuestChallengesView: React.FC<GuestChallengesViewProps> = ({ 
  challenges, photoCountPerChallenge, showChallengeForm, setShowChallengeForm, 
  handleCreateChallengeSubmit, newChalTitle, setNewChalTitle 
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight">Défis en cours</h2>
        <button onClick={() => setShowChallengeForm(!showChallengeForm)} className="text-primary text-[10px] font-black uppercase">
          {showChallengeForm ? 'Fermer' : '+ Proposer'}
        </button>
      </div>

      {showChallengeForm && (
        <form onSubmit={handleCreateChallengeSubmit} className="glass rounded-2xl p-5 border-primary/20 space-y-3">
          <input required placeholder="Titre du défi" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none" value={newChalTitle} onChange={e => setNewChalTitle(e.target.value)} />
          <button type="submit" className="w-full bg-primary text-white font-black py-3 rounded-xl text-[10px] uppercase">Lancer le défi</button>
        </form>
      )}

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
