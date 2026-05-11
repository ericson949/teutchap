import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Hash, ImageIcon, Calendar, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Portal() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    // In a real app with auth, we'd filter by user_id. 
    // Here we just fetch all for the MVP/Demo.
    const { data } = await supabase
      .from('events')
      .select('*, photos(count)')
      .order('created_at', { ascending: false })
    
    if (data) setEvents(data)
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-[#08060d] text-white flex items-center justify-center font-black uppercase tracking-widest text-[10px]">Chargement...</div>

  return (
    <div className="min-h-screen bg-[#08060d] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gradient">Vos Événements</h1>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">Console Multi-Événements</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-4 rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>Nouvel Événement</span>
          </button>
        </header>

        {events.length === 0 ? (
           <div className="glass rounded-[3rem] p-24 flex flex-col items-center justify-center border-dashed border-white/10 text-center">
              <div className="bg-white/5 p-8 rounded-full mb-8">
                 <Hash size={40} className="text-gray-500" />
              </div>
              <p className="text-xl font-black tracking-tight text-white mb-2">Aucun événement</p>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Commencez par créer votre premier Teutchap</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div 
                key={event.id}
                onClick={() => navigate(`/dashboard/${event.id}`)}
                className="glass rounded-[2rem] p-8 border border-white/5 shadow-2xl group hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col justify-between h-[280px]"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                     <div className={`p-3 rounded-2xl ${event.plan === 'premium' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400'}`}>
                        <Hash size={24} />
                     </div>
                     <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${event.plan === 'premium' ? 'border-primary/50 text-primary bg-primary/10' : 'border-white/10 text-gray-400'}`}>
                        {event.plan === 'premium' ? 'Premium' : 'Gratuit'}
                     </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight leading-tight line-clamp-2">{event.name}</h3>
                    <div className="flex items-center space-x-2 text-gray-500 mt-3">
                       <Calendar size={14} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(event.event_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                   <div className="flex items-center space-x-2 text-white">
                      <ImageIcon size={16} className="opacity-50" />
                      <span className="text-sm font-black">{event.photos?.[0]?.count || 0}</span>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ChevronRight size={16} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
