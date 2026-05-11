import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, Download, Image as ImageIcon, Copy, X, Zap, Hash, Check, Shield, Sparkles } from 'lucide-react'
import { useEvent } from '../../hooks/useEvent'
import { useChallenges } from '../../hooks/useChallenges'
import { usePhotos } from '../../hooks/usePhotos'

export default function Dashboard() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  
  // Custom Hooks
  const { eventData, loading: eventLoading, updateEvent, setEventData } = useEvent(eventId)
  const { challenges, addChallenge, deleteChallenge } = useChallenges(eventData?.id)
  const { photos, loading: photosLoading } = usePhotos(eventData?.id)
  
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '' })

  const handleSaveChallenge = async () => {
    if (!newChallenge.title) return
    const { data } = await addChallenge(newChallenge.title, newChallenge.description)
    if (data) {
      setShowChallengeForm(false)
      setNewChallenge({ title: '', description: '' })
    }
  }

  if (eventLoading || !eventData) return <div className="p-8 text-center text-white bg-[#08060d] min-h-screen flex items-center justify-center font-black uppercase tracking-[0.3em]">Chargement...</div>

  const eventUrl = `${window.location.origin}/e/${eventData.token}`

  const copyLink = () => {
    navigator.clipboard.writeText(eventUrl)
    alert('Lien copié !')
  }

  const shareWhatsApp = () => {
    const text = `Partagez vos photos de ${eventData.name} !\n\nCliquez ici : ${eventUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[0%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[150px] rounded-full" />
      </div>

      <header className="glass-dark border-b border-white/5 px-8 py-5 flex justify-between items-center sticky top-0 z-40 backdrop-blur-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Hash size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gradient">{eventData.name}</h1>
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                eventData.plan === 'free' ? 'border-white/10 text-gray-500' : 'border-primary/30 bg-primary/10 text-primary'
              }`}>
                Plan {eventData.plan || 'Free'}
              </span>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tighter">Console Organisateur</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {eventData.plan !== 'premium' && (
            <button 
              onClick={() => navigate(`/dashboard/${eventId}/upgrade`)}
              className="hidden md:flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-primary/20"
            >
              <Zap size={14} className="fill-current" />
              <span>UPGRADE</span>
            </button>
          )}
          <button className="p-2.5 glass border border-white/10 text-gray-400 hover:text-white rounded-xl transition-all">
            <Download size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 md:space-y-12 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Photos', value: photos.length, icon: ImageIcon, color: 'text-primary' },
            { label: 'Défis', value: challenges.length, icon: Hash, color: 'text-accent' },
            { label: 'Réactions', value: 'Live', icon: Zap, color: 'text-yellow-400' },
            { label: 'Statut', value: 'Actif', icon: Check, color: 'text-green-400' }
          ].map((stat, i) => (
            <div key={i} className="glass rounded-[2rem] p-6 border border-white/5 shadow-2xl group hover:border-primary/20 transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={18} />
                </div>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 opacity-60">{stat.label}</p>
              <p className="text-4xl font-black tracking-tighter tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* QR Code Section */}
        <section className="glass rounded-[2.5rem] border border-white/5 p-6 md:p-12 flex flex-col lg:flex-row gap-8 lg:gap-16 items-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -mr-40 -mt-40 rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
          
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex-shrink-0 relative z-10 transition-all duration-700 group-hover:scale-[1.03] group-hover:rotate-1">
            <QRCodeSVG value={eventUrl} size={200} level="H" includeMargin={false} className="w-48 h-48 md:w-56 md:h-56" />
            <div className="mt-6 flex items-center justify-center space-x-2 text-black/40">
               <div className="w-2 h-2 bg-black/10 rounded-full" />
               <span className="text-[8px] font-black uppercase tracking-[0.2em]">Scanner pour rejoindre</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-8 max-w-lg w-full relative z-10 text-center lg:text-left">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] md:leading-[0.9]">
                Propulsez <br/>
                <span className="text-gradient">L'Engagement</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed max-w-sm mx-auto lg:mx-0">
                Partagez ce QR code ou le lien unique. Vos invités contribuent sans application à installer.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 glass border border-white/10 rounded-2xl px-5 py-4 text-[10px] md:text-xs font-mono text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap bg-black/20">
                  {eventUrl}
                </div>
                <button onClick={copyLink} className="p-4 glass border border-white/10 hover:bg-white/10 text-primary rounded-2xl transition-all active:scale-90 shadow-xl">
                  <Copy size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={shareWhatsApp} className="flex items-center justify-center space-x-3 bg-[#25D366] hover:bg-[#1EBE5A] text-white py-5 rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#25D366]/20 active:scale-95">
                  <Share2 size={18} />
                  <span>WhatsApp</span>
                </button>
                <button 
                  onClick={() => window.open(`/e/${eventData.token}/live`, '_blank')}
                  className="flex items-center justify-center space-x-3 bg-white text-black hover:bg-gray-100 py-5 rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95"
                >
                  <ImageIcon size={18} />
                  <span>Mur Live</span>
                </button>
              </div>

              <button 
                onClick={() => alert('Génération du Highlight Reel IA en cours...')}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-primary to-accent text-white py-5 rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary/30 active:scale-95 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                <Sparkles size={18} className="animate-pulse" />
                <span className="relative z-10">Générer Highlights IA</span>
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* AI & Automation Section */}
          <section className="glass rounded-[2.5rem] border border-white/5 p-8 md:p-10 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-48 bg-accent/5 blur-[80px] -ml-24 -mt-24 rounded-full" />
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-2xl font-black tracking-tight">IA & Sécurité</h2>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Automatisation intelligente</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl text-accent">
                <Shield size={24} />
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="glass border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-primary/20 transition-all bg-white/[0.01]">
                <div className="flex items-center space-x-5">
                  <div className="bg-primary/10 p-3 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight">Modération Auto</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">Filtrage en temps réel</p>
                  </div>
                </div>
                <button 
                  onClick={() => updateEvent({ auto_moderation: !eventData.auto_moderation })}
                  className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${eventData.auto_moderation ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${eventData.auto_moderation ? 'left-8' : 'left-1'}`} />
                </button>
              </div>

              <div className="glass border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-accent/20 transition-all bg-white/[0.01]">
                <div className="flex items-center space-x-5">
                  <div className="bg-accent/10 p-3 rounded-2xl text-accent group-hover:scale-110 transition-transform">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight">Tagging IA</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">Indexation automatique</p>
                  </div>
                </div>
                <button 
                  onClick={() => updateEvent({ ai_tagging_enabled: !eventData.ai_tagging_enabled })}
                  className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${eventData.ai_tagging_enabled ? 'bg-accent' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${eventData.ai_tagging_enabled ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Challenges Section */}
          <section className="glass rounded-[2.5rem] border border-white/5 p-8 md:p-10 shadow-2xl relative">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Défis Photo</h2>
                <p className="text-gray-500 text-[10px] mt-1 font-bold uppercase tracking-widest">Animez la galerie</p>
              </div>
              <button 
                onClick={() => setShowChallengeForm(true)}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                + Créer
              </button>
            </div>

            {challenges.length === 0 ? (
              <div className="text-center py-16 px-6 glass rounded-[2.5rem] border-dashed border-white/10 flex flex-col items-center justify-center space-y-4">
                <Hash size={32} className="text-gray-700" />
                <div>
                  <p className="text-gray-400 text-sm font-bold">Aucun défi actif</p>
                  <p className="text-gray-600 text-[9px] mt-1 uppercase font-black tracking-[0.2em]">Lancez le premier défi !</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {challenges.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-5 glass border border-white/5 rounded-3xl group hover:border-primary/20 transition-all hover:translate-x-1 duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/5 p-2 rounded-lg text-gray-500">
                        <Hash size={14} />
                      </div>
                      <div>
                        <h3 className="font-black text-sm tracking-tight">{c.title}</h3>
                        <p className="text-[10px] text-gray-500 font-medium">{c.description || 'Challenge communautaire'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteChallenge(c.id)}
                      className="text-gray-700 hover:text-red-500 transition-colors p-2 active:scale-90"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showChallengeForm && (
              <div className="absolute inset-0 z-20 bg-[#08060d]/95 backdrop-blur-xl p-8 rounded-[2.5rem] animate-in fade-in zoom-in-95 duration-300 flex flex-col justify-center">
                <h3 className="text-xl font-black uppercase tracking-widest mb-8 text-gradient">Nouveau Défi</h3>
                <div className="space-y-4">
                  <input 
                    placeholder="Titre (ex: Le plus beau sourire)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-primary/50 transition-all placeholder:text-gray-700"
                    value={newChallenge.title}
                    onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
                  />
                  <textarea 
                    placeholder="Description..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-primary/50 transition-all h-32 placeholder:text-gray-700 resize-none"
                    value={newChallenge.description}
                    onChange={e => setNewChallenge({...newChallenge, description: e.target.value})}
                  />
                  <div className="flex space-x-4 pt-4">
                    <button 
                      onClick={handleSaveChallenge}
                      className="flex-[2] bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                    >
                      Lancer
                    </button>
                    <button 
                      onClick={() => setShowChallengeForm(false)}
                      className="flex-1 glass border border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] py-5 rounded-2xl active:scale-95 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Gallery Preview Section */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tighter">Flux en Direct</h2>
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest mt-1 opacity-60">Photos partagées par vos invités</p>
            </div>
            <div className="flex items-center space-x-3 text-[9px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span>Mises à jour automatiques</span>
            </div>
          </div>

          {photos.length === 0 ? (
            <div className="glass border border-white/5 border-dashed rounded-[3rem] p-24 flex flex-col items-center justify-center text-gray-600 bg-white/[0.01] group">
              <div className="bg-white/5 p-8 rounded-full mb-8 group-hover:scale-110 transition-transform duration-500">
                <ImageIcon size={56} className="opacity-10" />
              </div>
              <p className="font-black tracking-tight text-xl text-gray-500">L'album est encore vide</p>
              <p className="text-[10px] mt-3 uppercase tracking-[0.2em] font-bold opacity-40 text-center max-w-xs leading-loose">Les photos de vos convives apparaîtront ici <br className="hidden md:block" /> instantanément.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {photos.map((photo: any, idx: number) => (
                <div 
                  key={photo.id} 
                  className="relative aspect-[3/4] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden glass border border-white/10 group shadow-xl transition-all duration-500 hover:-translate-y-2"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <img 
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {photo.is_flagged ? (
                     <div className="absolute inset-0 bg-red-900/60 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
                        <Shield size={24} className="text-white mb-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white">Photo bloquée par l'IA</span>
                     </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                       <div className="flex gap-1">
                          {photo.ai_tags?.slice(0, 2).map((t: string) => (
                            <span key={t} className="text-[6px] font-black uppercase tracking-widest bg-white/20 px-1.5 py-0.5 rounded-md text-white">#{t}</span>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
