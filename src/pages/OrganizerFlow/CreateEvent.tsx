import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Sparkles, Zap, Hash, Shield, Globe } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'mariage',
    eventDate: '',
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
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xl animate-float">
            <Zap size={14} className="text-primary fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Nouveau sur Teutchap</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Capturez <br/>
            <span className="text-gradient">L'éternité</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium max-w-sm mx-auto leading-relaxed uppercase tracking-widest opacity-80">
            Un album collectif. Zéro app. Souvenirs infinis.
          </p>
        </div>

        <div className="glass rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] -mr-24 -mt-24 rounded-full group-hover:bg-primary/10 transition-colors" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nom de l'événement</label>
                <div className="relative">
                   <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                   <input 
                    required
                    placeholder="Ex: Mariage de Sarah & Marc"
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-bold outline-none focus:border-primary/50 transition-all placeholder:text-gray-700 focus:bg-white/10"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      required
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-bold outline-none focus:border-primary/50 transition-all focus:bg-white/10"
                      value={formData.eventDate}
                      onChange={e => setFormData({...formData, eventDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Confidentialité</label>
                  <div className="relative">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-bold outline-none focus:border-primary/50 transition-all focus:bg-white/10 appearance-none"
                      value={formData.mode}
                      onChange={e => setFormData({...formData, mode: e.target.value})}
                    >
                      <option value="public" className="bg-[#08060d]">Galerie Publique</option>
                      <option value="private" className="bg-[#08060d]">Privé (Admin seul)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-black py-6 rounded-[1.5rem] shadow-[0_20px_50px_rgba(170,59,255,0.3)] flex items-center justify-center space-x-4 text-sm uppercase tracking-widest border-t border-white/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Créer mon Teutchap</span>
                  <Sparkles size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center space-x-12 opacity-40">
           <div className="flex items-center space-x-2">
             <Shield size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Sécurisé</span>
           </div>
           <div className="flex items-center space-x-2">
             <Zap size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Instantané</span>
           </div>
           <div className="flex items-center space-x-2">
             <Globe size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">PWA Ready</span>
           </div>
        </div>
      </div>
    </div>
  )
}
