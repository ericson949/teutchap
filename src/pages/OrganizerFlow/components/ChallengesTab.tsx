import { PlusCircle, Trash2, Hash, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export const ChallengesTab = ({ challenges, showChallengeForm, setShowChallengeForm, newChallenge, setNewChallenge, handleSaveChallenge, deleteChallenge }: any) => {
  return (
    <div className="space-y-8 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between"
      >
        <div>
           <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">Animation</p>
           <h2 className="mt-2 text-4xl font-serif text-white tracking-tight">Défis & Engagement</h2>
        </div>
        <button 
          onClick={() => setShowChallengeForm(!showChallengeForm)}
          className="bg-white/10 hover:bg-white/20 text-white p-3.5 rounded-full transition-all active:scale-95 border border-white/10"
        >
          <PlusCircle size={20} />
        </button>
      </motion.div>

      <AnimatePresence>
        {showChallengeForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/[0.08] space-y-6 mb-8 backdrop-blur-xl relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="space-y-2 relative z-10">
                <h3 className="text-xl font-serif text-white tracking-tight">Nouveau défi</h3>
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-semibold">Créez un défi photo pour vos invités</p>
              </div>

              <div className="relative z-10">
                <input 
                  placeholder="Ex: Prenez une photo avec le marié" 
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-sm font-medium text-white outline-none focus:border-white/30 transition-all placeholder:text-white/30"
                  value={newChallenge.title}
                  onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
                />
              </div>

              <button 
                onClick={handleSaveChallenge}
                className="w-full bg-white hover:bg-white/90 text-black py-4 rounded-full font-bold uppercase text-[9px] tracking-[0.2em] transition-all flex items-center justify-center space-x-2 relative z-10"
              >
                <Zap size={14} />
                <span>Lancer le défi</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.length === 0 ? (
           <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/30 border border-white/[0.05] rounded-[32px] bg-white/[0.02]">
             <Hash size={40} className="mb-4 opacity-50" />
             <p className="font-serif text-xl tracking-tight">Aucun défi actif</p>
             <p className="text-[10px] uppercase tracking-[0.2em] mt-2 font-medium">Lancez-en un pour animer l'événement</p>
           </div>
        ) : (
          challenges.map((c: any, i: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={c.id} 
              className="bg-white/[0.03] p-6 rounded-[24px] border border-white/[0.05] flex items-center justify-between group hover:border-white/10 transition-all backdrop-blur-md"
            >
              <div className="flex items-center space-x-5">
                <div className="bg-white/5 p-3 rounded-full border border-white/10 text-white/60"><Zap size={18} /></div>
                <div>
                  <h3 className="font-serif text-lg text-white">{c.title}</h3>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.15em] mt-1">Défi actif</p>
                </div>
              </div>
              <button 
                onClick={() => deleteChallenge(c.id)} 
                className="p-3 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
