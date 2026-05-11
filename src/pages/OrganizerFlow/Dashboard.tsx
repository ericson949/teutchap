import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, Download, Image as ImageIcon, Copy } from 'lucide-react'

export default function Dashboard() {
  const { eventId } = useParams()
  const [eventData, setEventData] = useState<any>(null)
  
  // Mock data for development if no backend is provided
  useEffect(() => {
    // In a real app, fetch from Supabase:
    // const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
    // setEventData(data)
    
    const isMock = String(eventId).startsWith('mock-id-')
    const token = isMock ? String(eventId).replace('mock-id-', '') : 'demo-token'

    setEventData({
      id: eventId,
      name: 'Mon Super Événement',
      date: '2026-05-15',
      token: token,
      photos_count: 0
    })
  }, [eventId])

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
        <div>
          <h1 className="text-xl font-bold text-gray-900">{eventData.name}</h1>
          <p className="text-sm text-gray-500">Dashboard Organisateur</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Download size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
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
          </div>
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
