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
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{eventData.name}</h1>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                eventData.plan === 'free' ? 'bg-gray-100 text-gray-500' : 'bg-primary/10 text-primary'
              }`}>
                Plan {eventData.plan}
              </span>
              <p className="text-sm text-gray-500">Dashboard Organisateur</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {eventData.plan === 'free' && (
            <button 
              onClick={() => navigate(`/dashboard/${eventId}/upgrade`)}
              className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-primary/20 transition-all"
            >
              <Zap size={16} className="fill-current" />
              <span>Passer au Premium</span>
            </button>
          )}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Download size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Photos</p>
            <p className="text-2xl font-bold text-gray-900">{eventData.photos_count || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Défis</p>
            <p className="text-2xl font-bold text-gray-900">{challenges.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Réactions</p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Vues Live</p>
            <p className="text-2xl font-bold text-gray-900">Direct</p>
          </div>
        </div>
        {/* QR Code Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
            <QRCodeSVG value={eventUrl} size={200} level="H" />
          </div>
          
          <div className="flex flex-col space-y-4 max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-900">Invitez vos convives</h2>
            <p className="text-gray-500 text-sm">
              Faites scanner ce QR code ou partagez le lien pour que vos invités puissent ajouter leurs photos sans télécharger d'application.
            </p>
            
            <div className="flex items-center space-x-2">
              <input 
                readOnly 
                value={eventUrl} 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
              />
              <button onClick={copyLink} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                <Copy size={18} />
              </button>
            </div>

            <button onClick={shareWhatsApp} className="w-full flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white py-2.5 rounded-lg font-medium transition-colors">
              <Share2 size={18} />
              <span>Partager sur WhatsApp</span>
            </button>

            <button 
              onClick={() => window.open(`/e/${eventData.token}/live`, '_blank')}
              className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              <Share2 size={18} />
              <span>Lancer le Mur Live</span>
            </button>
          </div>
        </section>

        {/* Challenges Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Défis Photo</h2>
            <button 
              onClick={() => setShowChallengeForm(true)}
              className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              + Nouveau défi
            </button>
          </div>

          {challenges.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-sm">Créez des défis pour animer votre événement !</p>
              <p className="text-xs mt-1">Ex: "Selfie avec le marié", "Le plus beau sourire"...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="font-medium text-gray-900">{c.title}</h3>
                    <p className="text-xs text-gray-500">{c.description || 'Pas de description'}</p>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showChallengeForm && (
            <div className="mt-6 p-4 border border-primary/20 bg-primary/5 rounded-xl animate-in slide-in-from-top-2 duration-200">
              <h3 className="text-sm font-bold mb-3">Nouveau défi</h3>
              <div className="space-y-3">
                <input 
                  placeholder="Titre du défi"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
                  value={newChallenge.title}
                  onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
                />
                <textarea 
                  placeholder="Description (optionnel)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors h-20"
                  value={newChallenge.description}
                  onChange={e => setNewChallenge({...newChallenge, description: e.target.value})}
                />
                <div className="flex space-x-2">
                  <button 
                    onClick={saveChallenge}
                    className="flex-1 bg-primary text-white text-sm py-2 rounded-lg font-medium"
                  >
                    Enregistrer
                  </button>
                  <button 
                    onClick={() => setShowChallengeForm(false)}
                    className="flex-1 bg-white border border-gray-200 text-gray-600 text-sm py-2 rounded-lg font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Gallery Preview Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Galerie en direct</h2>
              <p className="text-sm text-gray-500">{eventData.photos_count} photos reçues</p>
            </div>
          </div>

          {eventData.photos_count === 0 ? (
            <div className="bg-white border border-gray-200 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={48} className="mb-4 opacity-50" />
              <p>Aucune photo pour le moment.</p>
              <p className="text-sm">Partagez le lien pour commencer !</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Images will be rendered here */}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
