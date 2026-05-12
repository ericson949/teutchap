import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Sparkles, Zap, Hash, Shield, Globe, Users, AlertTriangle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../../lib/supabase'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [creationError, setCreationError] = useState<string | null>(null)
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'mariage',
    expectedGuests: '50',
    eventDate: '',
    endDate: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setCreationError(null)

    // Génération standard et sécurisée d'UUID v4 via la librairie certifiée
    const eventId = uuidv4()
    const token = Math.random().toString(36).substring(2, 10)

    // Formule gratuite affectée par défaut en création
    localStorage.setItem('teutchap_dev_plan', 'free')
    localStorage.setItem(`teutchap_guests_count_${token}`, '1') // Initialisation de l'accès
    
    const payload = {
      id: eventId,
      name: formData.name,
      event_type: formData.eventType,
      event_date: formData.eventDate,
      end_date: isMultiDay ? formData.endDate : null,
      mode: 'public',
      token: token,
      plan: 'free',
      allow_guest_challenges: false,
      joined_guests_count: 1,
      ai_tagging_enabled: true
    }

    try {
      const { error } = await supabase.from('events').insert([payload])

      if (error) {
        console.error("Erreur stricte de création (RLS/Réseau) :", error)
        setCreationError("Impossible de créer l'événement. La base de données a refusé l'accès en écriture (RLS) ou est indisponible.")
        setLoading(false)
        return
      }
      
      // Persistance de secours du payload créé avec succès
      localStorage.setItem(`teutchap_mock_event_${eventId}`, JSON.stringify(payload))
      localStorage.setItem(`teutchap_mock_event_token_${token}`, JSON.stringify(payload))
      
      navigate(`/overview/${eventId}`)
    } catch (err: any) {
      console.error(err)
      setCreationError(err?.message || "Une erreur inattendue est survenue lors de la communication avec le serveur.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col items-center p-4 md:p-8 selection:bg-primary/30 relative overflow-x-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[80px] md:blur-[150px] rounded-full will-change-transform" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[80px] md:blur-[150px] rounded-full will-change-transform" />
      </div>

      <div className="w-full max-w-xl relative z-10 space-y-8 md:space-y-12 py-10 md:py-16 will-change-transform">
        <div className="text-center space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-md md:backdrop-blur-xl animate-float">
            <Zap size={14} className="text-primary fill-current" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-gray-300">
              Initialisation d'Album
            </span>
          </div>
          <h1 className="text-[2.2rem] md:text-8xl font-black tracking-tighter leading-[1] md:leading-[0.85] px-2 flex flex-col items-center">
            <span>Capturez</span>
            <span className="text-gradient">L'éternité</span>
          </h1>
          <p className="text-gray-400 text-[10px] md:text-sm font-bold max-w-[280px] md:max-w-sm mx-auto leading-relaxed uppercase tracking-[0.2em] opacity-60">
            Un album collectif. Zéro app. Souvenirs infinis.
          </p>
        </div>

        <div className="glass rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl space-y-8 md:space-y-10 border border-white/5 relative overflow-hidden group animate-in fade-in zoom-in-95 duration-700 delay-300 fill-mode-both will-change-transform">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[60px] md:blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-primary/20 transition-all duration-1000 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10 relative z-10">
            <div className="space-y-6 md:space-y-8">
              
              {/* Nom de l'événement */}
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                  Nom de l'événement
                </label>
                <div className="relative group/input">
                   <Hash className="absolute left-6 md:left-7 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={18} />
                   <input 
                    required
                    placeholder="Ex: Mariage de Sarah & Marc"
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] pl-14 md:pl-16 pr-8 py-5 md:py-6 text-sm md:text-base font-bold outline-none focus:border-primary/50 transition-all placeholder:text-gray-700 focus:bg-white/[0.08] shadow-inner text-white"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Type d'événement & Nombre de personnes sur une seule ligne */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2 block truncate">
                    Type de réception
                  </label>
                  <div className="relative group/input">
                    <Sparkles className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={16} />
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] pl-10 md:pl-12 pr-8 py-4 md:py-5 text-xs md:text-sm font-bold outline-none focus:border-primary/50 transition-all focus:bg-white/[0.08] shadow-inner appearance-none cursor-pointer text-white"
                      value={formData.eventType}
                      onChange={e => setFormData({...formData, eventType: e.target.value})}
                    >
                      <option value="mariage" className="bg-[#0b0910] py-3 text-white">💍 Mariage</option>
                      <option value="anniversaire" className="bg-[#0b0910] py-3 text-white">🎂 Anniversaire</option>
                      <option value="soiree" className="bg-[#0b0910] py-3 text-white">🎉 Fête / Soirée</option>
                      <option value="entreprise" className="bg-[#0b0910] py-3 text-white">💼 Professionnel</option>
                      <option value="deuil" className="bg-[#0b0910] py-3 text-white">🕊️ Cérémonie</option>
                      <option value="autre" className="bg-[#0b0910] py-3 text-white">✨ Autre</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 group-focus-within/input:text-primary">
                       <span className="text-[10px]">▼</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2 block truncate">
                    Capacité estimée
                  </label>
                  <div className="relative group/input">
                    <Users className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={16} />
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] pl-10 md:pl-12 pr-8 py-4 md:py-5 text-xs md:text-sm font-bold outline-none focus:border-primary/50 transition-all focus:bg-white/[0.08] shadow-inner appearance-none cursor-pointer text-white"
                      value={formData.expectedGuests}
                      onChange={e => setFormData({...formData, expectedGuests: e.target.value})}
                    >
                      <option value="50" className="bg-[#0b0910] py-3 text-white">&lt; 50 invités</option>
                      <option value="100" className="bg-[#0b0910] py-3 text-white">50 - 100 invités</option>
                      <option value="300" className="bg-[#0b0910] py-3 text-white">100 - 300 invités</option>
                      <option value="1000" className="bg-[#0b0910] py-3 text-white">&gt; 300 invités</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 group-focus-within/input:text-primary">
                       <span className="text-[10px]">▼</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date de début & Multi-jours */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                    Date {isMultiDay ? 'de début' : "de l'événement"}
                  </label>
                  <div className="relative group/input">
                    <Calendar className="absolute left-6 md:left-7 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={18} />
                    <input 
                      required
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] pl-14 md:pl-16 pr-8 py-5 md:py-6 text-sm md:text-base font-bold outline-none focus:border-primary/50 transition-all focus:bg-white/[0.08] shadow-inner appearance-none color-scheme-dark text-white"
                      value={formData.eventDate}
                      onChange={e => {
                        const newDate = e.target.value;
                        setFormData(prev => ({
                          ...prev, 
                          eventDate: newDate,
                          endDate: prev.endDate && prev.endDate < newDate ? newDate : prev.endDate
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-4 pt-1">
                  <label className="flex items-center space-x-3 cursor-pointer group w-fit ml-2">
                    <div 
                      onClick={() => setIsMultiDay(!isMultiDay)}
                      className={`w-10 h-5 rounded-full transition-all relative ${isMultiDay ? 'bg-primary shadow-[0_0_15px_rgba(170,59,255,0.4)]' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMultiDay ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-300 transition-colors">
                      Événement sur plusieurs jours
                    </span>
                  </label>

                  {isMultiDay && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                        Date de fin
                      </label>
                      <div className="relative group/input">
                        <Calendar className="absolute left-6 md:left-7 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={18} />
                        <input 
                          required={isMultiDay}
                          type="date"
                          min={formData.eventDate}
                          className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] pl-14 md:pl-16 pr-8 py-5 md:py-6 text-sm md:text-base font-bold outline-none focus:border-primary/50 transition-all focus:bg-white/[0.08] shadow-inner appearance-none color-scheme-dark text-white"
                          value={formData.endDate}
                          onChange={e => setFormData({...formData, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bannière d'erreur stricte */}
            {creationError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start space-x-3 text-red-400 text-xs animate-fade-in">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="space-y-1 font-medium">
                  <p className="font-bold uppercase tracking-wider text-[10px]">Échec de la transaction</p>
                  <p className="leading-relaxed">{creationError}</p>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-black py-6 md:py-7 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_20px_50px_rgba(170,59,255,0.3)] flex items-center justify-center space-x-4 text-[10px] md:text-sm uppercase tracking-[0.25em] border-t border-white/20 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                    <span className="relative z-10">Créer mon album</span>
                  <Sparkles size={18} className="relative z-10 animate-pulse" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-30 px-4">
           {[
             { icon: Shield, label: 'Sécurisé' },
             { icon: Zap, label: 'Instantané' },
             { icon: Globe, label: 'PWA Ready' }
           ].map((badge, i) => (
             <div key={i} className="flex items-center space-x-2.5">
               <badge.icon size={14} />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">{badge.label}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
