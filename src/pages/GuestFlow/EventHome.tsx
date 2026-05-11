import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon } from 'lucide-react'

export default function EventHome() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [eventData, setEventData] = useState<any>(null)

  useEffect(() => {
    // Mocking fetch
    setEventData({
      name: 'Mon Super Événement',
      date: '15 Mai 2026',
      welcome_message: 'Bienvenue ! Partagez vos meilleurs souvenirs avec nous.',
      photos: []
    })
  }, [token])

  if (!eventData) return <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">Chargement...</div>

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Header / Cover */}
        <div className="relative h-64 bg-gradient-to-br from-primary-dark to-black overflow-hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <h1 className="text-3xl font-bold tracking-tight mb-1">{eventData.name}</h1>
            <p className="text-gray-300 text-sm">{eventData.date}</p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="p-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <p className="text-gray-200 leading-relaxed text-sm">
              {eventData.welcome_message}
            </p>
          </div>

          {/* Public Gallery Preview */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Galerie de l'événement</h2>
            {eventData.photos.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="text-gray-500" size={24} />
                </div>
                <p className="text-gray-400 text-sm">Soyez le premier à ajouter une photo !</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {/* Images... */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent pb-safe">
        <button 
          onClick={() => navigate(`/e/${token}/upload`)}
          className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-medium py-4 rounded-xl shadow-lg flex items-center justify-center space-x-2"
        >
          <Camera size={20} />
          <span>Ajouter mes photos</span>
        </button>
      </div>
    </div>
  )
}
