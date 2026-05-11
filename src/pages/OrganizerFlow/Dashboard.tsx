import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, Download, Image as ImageIcon, Copy, X, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [eventData, setEventData] = useState<any>(null)
  const [challenges, setChallenges] = useState<any[]>([])
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '' })
  
  // Fetch everything
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch event
      const isMock = String(eventId).startsWith('mock-id-')
      const { data: event } = isMock 
        ? { data: { id: eventId, name: 'Événement Démo', token: eventId?.replace('mock-id-', ''), photos_count: 0 } }
        : await supabase.from('events').select('*').eq('id', eventId).single()
      
      if (event) {
        setEventData(event)
        // 2. Fetch challenges
        const { data: chalData } = await supabase.from('challenges').select('*').eq('event_id', event.id)
        if (chalData) setChallenges(chalData)
      }
    }
    fetchData()
  }, [eventId])

  const saveChallenge = async () => {
    if (!newChallenge.title) return
    const { data, error } = await supabase.from('challenges').insert([
      { ...newChallenge, event_id: eventData.id }
    ]).select().single()

    if (data) {
      setChallenges([...challenges, data])
      setShowChallengeForm(false)
      setNewChallenge({ title: '', description: '' })
    } else {
      console.error(error)
    }
  }

  if (!eventData) return <div className="p-8 text-center">Chargement...</div>

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
                Plan {eventData.plan}
              </span>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tighter">Console Organisateur</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {eventData.plan === 'free' && (
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

      <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-10 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Photos', value: eventData.photos_count || 0, icon: ImageIcon },
            { label: 'Défis', value: challenges.length, icon: Hash },
            { label: 'Réactions', value: 'Live', icon: Zap },
            { label: 'Statut', value: 'Actif', icon: Check }
          ].map((stat, i) => (
            <div key={i} className="glass rounded-3xl p-6 border border-white/5 shadow-2xl group hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* QR Code Section */}
        <section className="glass rounded-[2.5rem] border border-white/5 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
          
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex-shrink-0 relative z-10 transition-transform duration-500 group-hover:scale-105">
            <QRCodeSVG value={eventUrl} size={220} level="H" includeMargin={false} />
          </div>
          
          <div className="flex flex-col space-y-6 max-w-md w-full relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-black tracking-tight leading-tight">Diffusez votre <br/><span className="text-primary">Teutchap</span></h2>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Partagez ce QR code ou le lien unique. Vos invités contribuent instantanément sans aucune barrière technique.
            </p>
            
            <div className="flex items-center space-x-3">
              <div className="flex-1 glass border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                {eventUrl}
              </div>
              <button onClick={copyLink} className="p-3 glass border border-white/10 hover:bg-white/10 text-primary rounded-2xl transition-all active:scale-90">
                <Copy size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={shareWhatsApp} className="flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#25D366]/20 active:scale-95">
                <Share2 size={16} />
                <span>WhatsApp</span>
              </button>
              <button 
                onClick={() => window.open(`/e/${eventData.token}/live`, '_blank')}
                className="flex items-center justify-center space-x-2 bg-white text-black hover:bg-gray-100 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                <ImageIcon size={16} />
                <span>Mur Live</span>
              </button>
            </div>
          </div>
        </section>

        {/* Challenges Section */}
        <section className="glass rounded-[2.5rem] border border-white/5 p-8 md:p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Défis Photo</h2>
              <p className="text-gray-500 text-xs mt-1 font-bold uppercase tracking-tighter">Engagez vos convives</p>
            </div>
            <button 
              onClick={() => setShowChallengeForm(true)}
              className="bg-primary/10 text-primary border border-primary/20 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all active:scale-95"
            >
              + Créer un défi
            </button>
          </div>

          {challenges.length === 0 ? (
            <div className="text-center py-12 px-6 glass rounded-[2rem] border-dashed border-white/10">
              <p className="text-gray-400 text-sm font-medium">Aucun défi actif pour le moment.</p>
              <p className="text-gray-600 text-[10px] mt-2 uppercase font-bold">Lancez le premier défi pour animer la galerie !</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {challenges.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-5 glass border border-white/5 rounded-3xl group hover:border-primary/20 transition-all">
                  <div>
                    <h3 className="font-black text-sm tracking-tight">{c.title}</h3>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">{c.description || 'Défi communautaire'}</p>
                  </div>
                  <button className="text-gray-600 hover:text-red-500 transition-colors p-2">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showChallengeForm && (
            <div className="mt-8 p-8 glass border border-primary/30 rounded-[2rem] animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] -mr-16 -mt-16 rounded-full" />
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-gradient">Nouveau Défi</h3>
              <div className="space-y-4">
                <input 
                  placeholder="Ex: Le plus beau sourire..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
                  value={newChallenge.title}
                  onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
                />
                <textarea 
                  placeholder="Expliquez les règles du défi (optionnel)..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-primary/50 transition-all h-28 placeholder:text-gray-600 resize-none"
                  value={newChallenge.description}
                  onChange={e => setNewChallenge({...newChallenge, description: e.target.value})}
                />
                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={saveChallenge}
                    className="flex-[2] bg-primary text-white text-xs font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    Lancer le défi
                  </button>
                  <button 
                    onClick={() => setShowChallengeForm(false)}
                    className="flex-1 glass border border-white/10 text-gray-400 text-xs font-black uppercase tracking-widest py-4 rounded-2xl active:scale-95 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Gallery Preview Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Flux de Photos</h2>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Direct depuis l'événement</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
              <span>Live Updates</span>
            </div>
          </div>

          {eventData.photos_count === 0 ? (
            <div className="glass border border-white/5 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-gray-500">
              <div className="bg-white/5 p-6 rounded-full mb-6">
                <ImageIcon size={48} className="opacity-20" />
              </div>
              <p className="font-bold tracking-tight">Galerie vide</p>
              <p className="text-[10px] mt-2 uppercase tracking-widest font-black opacity-40 text-center">Les photos apparaîtront ici <br/>dès qu'un invité en prendra une.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Images would go here */}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
