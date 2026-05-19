import type React from 'react'
import { PlusCircle, Trash2, Hash, Zap, Sparkles, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getChallengeTemplates } from '../../../lib/gamification'

export const ChallengesTab = ({
  challenges,
  showChallengeForm,
  setShowChallengeForm,
  newChallenge,
  setNewChallenge,
  handleSaveChallenge,
  deleteChallenge,
  eventType,
  photoCountPerChallenge = {}
}: any) => {
  const templates = getChallengeTemplates(eventType)
  const completedCount = challenges.filter((challenge: any) => (photoCountPerChallenge[challenge.id] || 0) > 0).length
  const challengePhotoCount = Object.values(photoCountPerChallenge).reduce((sum: number, value: any) => sum + Number(value || 0), 0)

  return (
    <div className="relative space-y-8 pb-32 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between gap-6"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">Animation</p>
          <h2 className="mt-2 text-4xl font-serif text-white tracking-tight">Defis & Engagement</h2>
        </div>
        <button
          onClick={() => setShowChallengeForm(!showChallengeForm)}
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 p-3.5 rounded-full transition-all active:scale-95 border border-blue-500/20"
          title="Ajouter un defi"
        >
          <PlusCircle size={20} />
        </button>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        <EngagementMetric label="Defis actifs" value={challenges.length} icon={<Zap size={16} />} />
        <EngagementMetric label="Completes" value={completedCount} icon={<Trophy size={16} />} />
        <EngagementMetric label="Photos defis" value={challengePhotoCount} icon={<Hash size={16} />} />
      </div>

      <div className="bg-white/[0.03] rounded-[28px] border border-white/[0.06] p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300">
            <Sparkles size={14} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em]">Templates recommandes</span>
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35 font-semibold">
            Selectionnez une mission adaptee au type d evenement
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template) => (
            <button
              key={template.title}
              onClick={() => {
                setNewChallenge({ title: template.title, description: template.description })
                setShowChallengeForm(true)
              }}
              className="text-left rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all"
            >
              <p className="text-sm font-black text-white">{template.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-white/40 font-medium">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showChallengeForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/[0.08] space-y-6 mb-8 backdrop-blur-xl relative">
              <div className="space-y-2 relative z-10">
                <h3 className="text-xl font-serif text-white tracking-tight">Nouveau defi</h3>
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-semibold">
                  Creez une mission photo pour vos invites
                </p>
              </div>

              <input
                placeholder="Ex: Prenez une photo avec les maries"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-sm font-medium text-white outline-none focus:border-white/30 transition-all placeholder:text-white/30"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
              />

              <textarea
                placeholder="Consigne courte pour les invites"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-sm font-medium text-white outline-none focus:border-white/30 transition-all placeholder:text-white/30 min-h-24 resize-none"
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
              />

              <button
                onClick={handleSaveChallenge}
                className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 py-4 rounded-full font-bold uppercase text-[9px] tracking-[0.2em] transition-all flex items-center justify-center space-x-2 relative z-10 active:scale-95"
              >
                <Zap size={14} />
                <span>Lancer le defi</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/30 border border-white/[0.05] rounded-[32px] bg-white/[0.02]">
            <Hash size={40} className="mb-4 opacity-50" />
            <p className="font-serif text-xl tracking-tight">Aucun defi actif</p>
            <p className="text-[10px] uppercase tracking-[0.2em] mt-2 font-medium">Lancez-en un pour animer l evenement</p>
          </div>
        ) : (
          challenges.map((challenge: any, index: number) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              key={challenge.id}
              className="bg-white/[0.03] p-6 rounded-[24px] border border-white/[0.05] flex items-center justify-between group hover:border-white/10 transition-all backdrop-blur-md"
            >
              <div className="flex items-center space-x-5">
                <div className="bg-white/5 p-3 rounded-full border border-white/10 text-white/60">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white">{challenge.title}</h3>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.15em] mt-1">
                    {(photoCountPerChallenge[challenge.id] || 0)} photo(s) associee(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteChallenge(challenge.id)}
                className="p-3 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                title="Supprimer le defi"
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

const EngagementMetric = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <div className="rounded-3xl bg-white/[0.03] border border-white/[0.06] p-4">
    <div className="text-blue-300">{icon}</div>
    <p className="mt-3 text-2xl font-black text-white tabular-nums">{value}</p>
    <p className="text-[8px] font-black uppercase tracking-widest text-white/35">{label}</p>
  </div>
)
