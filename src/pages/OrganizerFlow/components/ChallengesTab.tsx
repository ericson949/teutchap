import { PlusCircle, Trash2, Hash } from 'lucide-react'

export const ChallengesTab = ({ challenges, showChallengeForm, setShowChallengeForm, newChallenge, setNewChallenge, handleSaveChallenge, deleteChallenge }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">Défis & Engagement</h2>
        <button 
          onClick={() => setShowChallengeForm(!showChallengeForm)}
          className="bg-primary text-white p-2 rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <PlusCircle size={24} />
        </button>
      </div>

      {showChallengeForm && (
        <div className="glass p-6 rounded-3xl border border-primary/30 space-y-4">
          <input 
            placeholder="Titre du défi" 
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-primary/50"
            value={newChallenge.title}
            onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
          />
          <button 
            onClick={handleSaveChallenge}
            className="w-full bg-primary py-3 rounded-xl font-black uppercase text-[10px] tracking-widest"
          >
            Lancer le défi
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((c: any) => (
          <div key={c.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between group">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary"><Hash size={20} /></div>
              <div>
                <h3 className="font-black text-white">{c.title}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Défi actif</p>
              </div>
            </div>
            <button onClick={() => deleteChallenge(c.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
