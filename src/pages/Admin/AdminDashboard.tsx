import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  TrendingUp, 
  Search, 
  ShieldCheck, 
  Trash2, 
  Eye, 
  CreditCard,
  ArrowUpRight,
  Filter
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      // For development purposes, we could allow access or show a warning
      // For production, we would redirect to home
      // navigate('/')
    }
  }, [isAdmin, authLoading, navigate])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. Fetch Stats
        const { data: statsData } = await supabase.from('global_stats').select('*').single()
        setStats(statsData)

        // 2. Fetch Events with Owner Info
        const { data: eventsData } = await supabase
          .from('events')
          .select(`
            *,
            users (email, name)
          `)
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (eventsData) setEvents(eventsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (authLoading) return <div className="min-h-screen bg-[#08060d] flex items-center justify-center text-white">Verification...</div>

  // Even if not admin, we show a "Developer View" if it's localhost
  const isDev = window.location.hostname === 'localhost'
  if (!isAdmin && !isDev) {
    return <div className="min-h-screen bg-[#08060d] flex items-center justify-center text-white">Accès refusé.</div>
  }

  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.users?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col font-sans selection:bg-primary/30">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="glass-dark border-b border-white/5 px-8 py-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-3xl">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2.5 rounded-xl shadow-lg shadow-yellow-500/20">
            <ShieldCheck size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Admin Panel</h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Teutchap Global Control</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
           <div className="hidden md:flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Système Operational</span>
           </div>
           <button 
            onClick={() => navigate('/portal')}
            className="glass border-white/10 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
           >
             Retour Portail
           </button>
        </div>
      </header>

      <main className="flex-1 p-8 relative z-10 max-w-[1600px] mx-auto w-full space-y-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Utilisateurs', value: stats?.total_users || 0, icon: Users, color: 'text-blue-400', trend: '+12%' },
            { label: 'Événements', value: stats?.total_events || 0, icon: Calendar, color: 'text-primary', trend: '+5%' },
            { label: 'Photos', value: stats?.total_photos || 0, icon: ImageIcon, color: 'text-green-400', trend: '+28%' },
            { label: 'Revenus Est.', value: `${stats?.estimated_revenue || 0} CFA`, icon: CreditCard, color: 'text-yellow-400', trend: '+15%' }
          ].map((stat, i) => (
            <div key={i} className="glass rounded-[2rem] p-8 border-white/5 group hover:border-white/10 transition-all shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <stat.icon size={64} />
               </div>
               <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="flex items-center space-x-1 text-green-400 text-[10px] font-black">
                     <TrendingUp size={12} />
                     <span>{stat.trend}</span>
                  </div>
               </div>
               <div className="mt-6">
                  <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
                  <div className="text-3xl font-black tracking-tighter mt-1">{stat.value}</div>
               </div>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Activity Chart (Mock) */}
           <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tighter uppercase">Activité de la Plateforme</h2>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Évolutions des uploads sur 30 jours</p>
                </div>
                <div className="flex bg-white/5 rounded-xl p-1">
                  {['7D', '30D', 'ALL'].map(t => (
                    <button key={t} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${t === '30D' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="h-64 w-full bg-gradient-to-t from-white/[0.02] to-transparent rounded-2xl border border-white/5 relative flex items-end p-4 space-x-1">
                 {[40, 20, 60, 80, 45, 90, 70, 30, 50, 85, 40, 60].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t-sm relative group">
                       <div 
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all duration-1000" 
                        style={{ height: `${h}%` }}
                       />
                       <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                         {h}%
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Quick Actions / Recent Activity */}
           <div className="glass rounded-[2.5rem] p-8 border-white/5 space-y-8">
              <h2 className="text-xl font-black tracking-tighter uppercase">Alertes Modération</h2>
              <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all cursor-pointer">
                      <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                         <Trash2 size={20} />
                      </div>
                      <div className="flex-1">
                         <p className="text-xs font-bold text-white">Photo signalée #AJ92</p>
                         <p className="text-[10px] text-gray-500 font-medium">Contenu inapproprié suspecté</p>
                      </div>
                      <ArrowUpRight size={16} className="text-gray-600" />
                   </div>
                 ))}
                 <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                   Voir tous les signalements
                 </button>
              </div>
           </div>
        </div>

        {/* Events Table */}
        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h2 className="text-2xl font-black tracking-tighter uppercase">Gestion des Événements</h2>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Liste complète des albums actifs</p>
            </div>
            <div className="flex items-center space-x-4">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="text"
                    placeholder="Rechercher un événement ou un email..."
                    className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 text-sm font-medium outline-none focus:border-primary/50 transition-all w-full md:w-80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <button className="glass-dark border-white/10 p-3 rounded-xl text-gray-400 hover:text-white">
                  <Filter size={20} />
               </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Événement</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Organisateur</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Photos</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Plan</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black uppercase">
                          {event.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{event.name}</p>
                          <p className="text-[10px] text-gray-500 font-medium">#{event.token}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-white">{event.users?.name || 'Inconnu'}</p>
                      <p className="text-[10px] text-gray-500">{event.users?.email || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs font-bold text-gray-400">
                         {new Date(event.event_date).toLocaleDateString('fr-FR')}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-white">{event.photo_count || 0}</span>
                          <ImageIcon size={14} className="text-gray-600" />
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                         event.plan === 'vip' ? 'bg-yellow-500/20 text-yellow-500' : 
                         event.plan === 'premium' ? 'bg-primary/20 text-primary' : 
                         'bg-gray-500/20 text-gray-500'
                       }`}>
                         {event.plan}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => navigate(`/e/${event.token}`)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                           <Eye size={18} />
                         </button>
                         <button className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500 transition-all">
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
