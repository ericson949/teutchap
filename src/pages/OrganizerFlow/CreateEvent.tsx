import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Sparkles, Zap, Hash, Shield, Globe } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'mariage',
    eventDate: '',
    endDate: '',
    mode: 'public',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = Math.random().toString(36).substring(2, 10)

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            name: formData.name,
            event_type: formData.eventType,
            event_date: formData.eventDate,
            end_date: isMultiDay ? formData.endDate : null,
            mode: formData.mode,
            token: token,
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating event:', error)
        navigate(`/dashboard/mock-id-${token}`)
      } else if (data) {
        navigate(`/dashboard/${data.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col items-center justify-center p-6 selection:bg-primary/30 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-xl relative z-10 space-y-12">
        <div className="text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-xl animate-float">
            <Zap size={14} className="text-primary fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-300">Expérience Premium</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] md:leading-[0.85]">
            Capturez <br/>
            <span className="text-gradient">L'éternité</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-bold max-w-sm mx-auto leading-relaxed uppercase tracking-[0.2em] opacity-60">
            Un album collectif. Zéro app. <br className="hidden md:block" /> Souvenirs infinis.
          </p>
        </div>

        <div className="glass rounded-[3rem] p-8 md:p-14 shadow-2xl space-y-10 border border-white/5 relative overflow-hidden group animate-in fade-in zoom-in-95 duration-700 delay-300 fill-mode-both">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
          
          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Nom de votre événement</label>
                <div className="relative group/input">
                   <Hash className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={20} />
                   <input 
                    required
                    placeholder="Ex: Mariage de Sarah & Marc"
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-6 text-sm md:text-base font-bold outline-none focus:border-primary/50 transition-all placeholder:text-gray-700 focus:bg-white/[0.08] shadow-inner"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Date {isMultiDay ? 'de début' : ''}</label>
                    <div className="relative group/input">
                      <Calendar className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={20} />
                      <input 
                        required
                        type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-6 text-sm md:text-base font-bold outline-none focus:border-primary/50 transition-all focus:bg-white/[0.08] shadow-inner appearance-none color-scheme-dark"
                        value={formData.eventDate}
                        onChange={e => setFormData({...formData, eventDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Confidentialité</label>
                    <div className="relative group/input">
                      <Globe className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={20} />
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-6 text-sm md:text-base font-bold outline-none focus:border-primary/50 transition-all focus:bg-white/[0.08] shadow-inner appearance-none cursor-pointer"
                        value={formData.mode}
                        onChange={e => setFormData({...formData, mode: e.target.value})}
                      >
                        <option value="public" className="bg-[#0b0910] py-4">Galerie Publique</option>
                        <option value="private" className="bg-[#0b0910] py-4">Accès Privé</option>
                      </select>
                      <div className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 group-focus-within/input:text-primary transition-colors">
                         <Sparkles size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer group w-fit ml-2">
                    <div 
                      onClick={() => setIsMultiDay(!isMultiDay)}
                      className={`w-10 h-5 rounded-full transition-all relative ${isMultiDay ? 'bg-primary' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMultiDay ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-300 transition-colors">Événement sur plusieurs jours</span>
                  </label>

                  {isMultiDay && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Date de fin</label>
                      <div className="relative group/input">
                        <Calendar className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={20} />
                        <input 
                          required={isMultiDay}
                          type="date"
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-6 text-sm md:text-base font-bold outline-none focus:border-primary/50 transition-all focus:bg-white/[0.08] shadow-inner appearance-none color-scheme-dark"
                          value={formData.endDate}
                          onChange={e => setFormData({...formData, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-black py-7 rounded-[2rem] shadow-[0_20px_60px_rgba(170,59,255,0.4)] flex items-center justify-center space-x-4 text-xs md:text-sm uppercase tracking-[0.3em] border-t border-white/20 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Créer mon Teutchap</span>
                  <Sparkles size={18} className="relative z-10 animate-pulse" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-30 px-4">
           {[
             { icon: Shield, label: 'Sécurisé' },
             { icon: Zap, label: 'Instantané' },
             { icon: Globe, label: 'PWA Ready' }
           ].map((badge, i) => (
             <div key={i} className="flex items-center space-x-2.5">
               <badge.icon size={16} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">{badge.label}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
