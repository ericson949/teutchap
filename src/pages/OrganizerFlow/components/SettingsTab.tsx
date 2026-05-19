import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Copy, Share2, Trash2, Loader2, AlertTriangle, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import type { EventData } from '../../../types'

interface SettingsTabProps {
  eventData: EventData;
  eventUrl: string;
  copyLink: () => void;
  shareWhatsApp: () => void;
  updateEvent: (updates: Partial<EventData>) => void;
  deleteEvent: () => Promise<any>;
}

export const SettingsTab = ({ eventData, eventUrl, copyLink, shareWhatsApp, updateEvent, deleteEvent }: SettingsTabProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  const handleDeleteClick = async () => {
    if (!confirm("⚠️ DANGER : Êtes-vous absolument sûr de vouloir supprimer définitivement cet événement ?")) return
    
    const confirmationText = prompt(
      "Cette action supprimera toutes les images du cloud et toutes les données associées.\n\n" +
      "Pour confirmer, veuillez saisir le nom exact de l'événement :"
    )
    
    if (confirmationText !== eventData.name) {
      alert("Le nom saisi ne correspond pas. La suppression a été annulée.")
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteEvent()
      if (result?.success) {
        alert("L'événement et tous ses souvenirs ont été supprimés avec succès.")
        navigate('/')
      } else {
        throw result?.error || new Error("Une erreur inconnue est survenue")
      }
    } catch (err: any) {
      console.error("Échec de suppression:", err)
      alert("Erreur lors de la suppression de l'album : " + (err.message || err))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative space-y-8 pb-32 font-sans">
      {/* Premium background mesh blobs */}
      <div className="absolute top-[10%] right-[10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] -z-20 pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[40%] left-[5%] w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] -z-20 pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">Configuration</p>
        <h2 className="mt-2 text-4xl font-serif text-white tracking-tight">Paramètres</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Share Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/[0.02] p-5 sm:p-8 rounded-[32px] border border-white/[0.08] space-y-6 backdrop-blur-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex items-center space-x-4 relative z-10">
            <div className="bg-white/[0.05] p-3 rounded-full border border-white/[0.1]">
              <Share2 size={20} className="text-white/80" />
            </div>
            <h3 className="text-2xl font-serif tracking-tight text-white">Partage & Accès</h3>
          </div>
          
          <div className="bg-black/40 p-5 rounded-[20px] border border-white/[0.05] break-all text-[11px] font-mono text-white/60 relative z-10">
            {eventUrl}
          </div>

          <div className="flex gap-4 relative z-10">
            <button onClick={copyLink} className="flex-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 py-4 rounded-full font-bold uppercase text-[9px] tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-blue-500/20 transition-all active:scale-95">
              <Copy size={14} />
              <span>Copier le lien</span>
            </button>
            <button onClick={shareWhatsApp} className="flex-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 py-4 rounded-full font-bold uppercase text-[9px] tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-blue-500/20 transition-all active:scale-95">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .01 5.403.007 12.039c0 2.12.553 4.189 1.602 6.06L0 24l6.105-1.602a11.834 11.834 0 005.937 1.598h.005c6.637 0 12.042-5.405 12.046-12.041a11.811 11.811 0 00-3.518-8.523z"/>
              </svg>
              <span>WhatsApp</span>
            </button>
          </div>
        </motion.div>

        {/* Gamification Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-white/[0.02] p-5 sm:p-8 rounded-[32px] border border-white/[0.08] space-y-6 backdrop-blur-2xl md:col-span-2"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-white/[0.05] p-3 rounded-full border border-white/[0.1]">
              <Trophy size={20} className="text-white/80" />
            </div>
            <div>
              <h3 className="text-2xl font-serif tracking-tight text-white">Gamification</h3>
              <p className="text-[9px] text-white/40 font-medium uppercase tracking-[0.1em] mt-1">
                Controlez les missions, awards et classements visibles par les invites
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'adaptive', label: 'Auto', desc: 'Selon le type' },
              { id: 'party', label: 'Festif', desc: 'Classements visibles' },
              { id: 'sober', label: 'Sobre', desc: 'Sans competition' },
              { id: 'off', label: 'Off', desc: 'Masquer le jeu' }
            ].map((mode) => {
              const active = (eventData.gamification_mode || 'adaptive') === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => updateEvent({ gamification_mode: mode.id as EventData['gamification_mode'] })}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    active ? 'bg-blue-500/15 border-blue-500/30 text-white' : 'bg-white/[0.03] border-white/[0.05] text-white/45 hover:text-white'
                  }`}
                >
                  <p className="text-[11px] font-black uppercase tracking-widest">{mode.label}</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-wider opacity-60">{mode.desc}</p>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleRow
              title="Classement contributeurs"
              description="Affiche les invites les plus actifs dans l album et le Live Wall"
              checked={eventData.enable_leaderboard !== false}
              onChange={() => updateEvent({ enable_leaderboard: eventData.enable_leaderboard === false })}
            />
            <ToggleRow
              title="Awards de fin d evenement"
              description="Prepare un palmares avec photo du moment, meilleur contributeur et defi star"
              checked={eventData.enable_awards !== false}
              onChange={() => updateEvent({ enable_awards: eventData.enable_awards === false })}
            />
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/[0.02] p-5 sm:p-8 rounded-[32px] border border-white/[0.08] space-y-6 backdrop-blur-2xl"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-white/[0.05] p-3 rounded-full border border-white/[0.1]">
              <Shield size={20} className="text-white/80" />
            </div>
            <h3 className="text-2xl font-serif tracking-tight text-white">Sécurité & IA</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.05] rounded-[24px]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white">Modération Automatique IA</p>
                <p className="text-[9px] text-white/40 font-medium uppercase tracking-[0.1em] mt-1">Bloque les contenus inappropriés</p>
              </div>
              <button 
                onClick={() => updateEvent({ auto_moderation: !eventData.auto_moderation })}
                className={`w-12 h-6 rounded-full transition-all relative border ${eventData.auto_moderation ? 'bg-white border-white' : 'bg-transparent border-white/20'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${eventData.auto_moderation ? 'left-7 bg-black' : 'left-1 bg-white/40'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.05] rounded-[24px]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white">Défis par les Invités</p>
                <p className="text-[9px] text-white/40 font-medium uppercase tracking-[0.1em] mt-1">Autorise les invités à proposer des défis</p>
              </div>
              <button 
                onClick={() => updateEvent({ allow_guest_challenges: !eventData.allow_guest_challenges })}
                className={`w-12 h-6 rounded-full transition-all relative border ${eventData.allow_guest_challenges ? 'bg-white border-white' : 'bg-transparent border-white/20'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${eventData.allow_guest_challenges ? 'left-7 bg-black' : 'left-1 bg-white/40'}`} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-red-500/[0.02] border border-red-500/10 p-5 sm:p-8 rounded-[32px] space-y-6 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-xl font-serif tracking-tight flex items-center space-x-3 text-red-400">
              <AlertTriangle size={20} className="text-red-400" />
              <span>Zone de Danger</span>
            </h3>
            <p className="text-[10px] text-red-300/60 font-medium uppercase tracking-[0.15em] leading-relaxed">
              La suppression de cet événement effacera définitivement l'ensemble de ses données (photos, réactions, défis) sur tous les serveurs. Aucune récupération ne sera possible.
            </p>
          </div>
          
          <button 
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="w-full md:w-auto px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase text-[9px] tracking-[0.2em] rounded-full hover:bg-red-500 hover:text-white transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Suppression...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Supprimer définitivement</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const ToggleRow = ({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between gap-4 p-5 bg-white/[0.03] border border-white/[0.05] rounded-[24px]">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white">{title}</p>
      <p className="text-[9px] text-white/40 font-medium uppercase tracking-[0.1em] mt-1 leading-relaxed">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-all relative border shrink-0 ${checked ? 'bg-white border-white' : 'bg-transparent border-white/20'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${checked ? 'left-7 bg-black' : 'left-1 bg-white/40'}`} />
    </button>
  </div>
)
