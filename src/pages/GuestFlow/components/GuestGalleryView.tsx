import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Image as ImageIcon, ArrowLeft, X, User, Heart, Zap, Sparkles, Loader2 } from 'lucide-react'


import { supabase } from '../../../lib/supabase'



interface GuestGalleryViewProps {
  photos: any[]
  userReactions: any
  reactions: any
  addReaction: (id: string, emoji: string) => void
  challenges?: any[]
}

export const GuestGalleryView: React.FC<GuestGalleryViewProps> = ({ photos, userReactions, reactions, addReaction, challenges = [] }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null)
  const [isBindingChallenge, setIsBindingChallenge] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)


  const handleBindPhotoToChallenge = async (photoId: string, challengeId: string | null) => {
    setIsBindingChallenge(true)
    try {
      const { error } = await supabase
        .from('photos')
        .update({ challenge_id: challengeId })
        .eq('id', photoId)
      if (error) throw error
      setSelectedPhoto((prev: any) => prev ? { ...prev, challenge_id: challengeId } : null)
    } catch (e) {
      console.error("Erreur liaison défi:", e)
      alert("Erreur lors de la liaison au défi.")
    } finally {
      setIsBindingChallenge(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight">Album de l'événement</h2>
      </div>
      
      {photos.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-10" />
          <p className="text-gray-500 font-bold">L'album est encore vide</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo) => {
            const photoChallenge = challenges.find((c: any) => c.id === photo.challenge_id)
            return (
              <div 
                key={photo.id} 
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden glass border border-white/5 shadow-lg group cursor-pointer"
              >
                <img 
                  src={photo.url_thumb?.startsWith('blob:') ? photo.url_thumb : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Badge défi s'il est associé */}
                {photoChallenge && (
                  <div className="absolute top-2 left-2 glass px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-wider text-primary-light flex items-center space-x-1 border border-white/10">
                    <Zap size={8} className="fill-current text-primary" />
                    <span>{photoChallenge.title}</span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex gap-1 justify-center">
                    {['❤️', '🔥', '👏'].map(emoji => (
                      <button 
                        key={emoji}
                        onClick={(e) => { e.stopPropagation(); addReaction(photo.id, emoji); }}
                        className={`glass-dark px-2 py-0.5 rounded-full text-[8px] flex items-center space-x-0.5 transition-all ${userReactions[photo.id] === emoji ? 'border-primary bg-primary/20' : ''}`}
                      >
                        <span>{emoji}</span>
                        {reactions[photo.id]?.[emoji] && <span className="font-black text-white">{reactions[photo.id][emoji]}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modale de Détail Premium (Frosted details drawer) */}
      {selectedPhoto && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="relative glass rounded-[2.5rem] p-6 max-w-sm w-full border border-white/10 flex flex-col space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-none">
            {/* Photo en haute résolution */}
            <div 
              onClick={() => setIsFullscreen(true)}
              className="aspect-[3/4] w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl relative cursor-zoom-in group"
            >
              {/* Bouton de retour en haut à gauche */}
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }} 
                className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-2.5 rounded-full text-white border border-white/10 hover:bg-black/70 transition-all z-20 shadow-lg"
                title="Retour à l'album"
              >
                <ArrowLeft size={18} />
              </button>

              <img 
                src={selectedPhoto.url_original?.startsWith('blob:') ? selectedPhoto.url_original : import.meta.env.VITE_SUPABASE_URL + '/storage/v1/object/public/events_photos/' + selectedPhoto.url_original} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              
              {/* Overlay d'aide visuel au survol */}
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">Plein écran</span>
              </div>
            </div>

            {/* Fiche d'informations premium */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="bg-white/10 p-2.5 rounded-xl text-white/70">
                  <User size={16} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">Ajouté par</span>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{selectedPhoto.uploader_name || selectedPhoto.contributor_name || 'Invité'}</p>
                </div>
              </div>

              {/* Réactions */}
              <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="bg-white/10 p-2.5 rounded-xl text-white/70">
                  <Heart size={16} />
                </div>
                <div className="space-y-0.5 flex-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">Réactions totales</span>
                  <div className="flex gap-2 pt-1">
                    {['❤️', '🔥', '👏'].map(emoji => {
                      const count = reactions[selectedPhoto.id]?.[emoji] || 0
                      return (
                        <div key={emoji} className="glass-dark px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center space-x-1">
                          <span>{emoji}</span>
                          <span className="text-white">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Catégorie / Défi lié */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">Défi associé</span>
                  {isBindingChallenge && <Loader2 size={12} className="animate-spin text-primary" />}
                </div>
                
                {selectedPhoto.challenge_id ? (
                  <div className="inline-flex items-center space-x-1.5 bg-primary/20 text-primary-light px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border border-primary/25 shadow-lg shadow-primary/10">
                    <Sparkles size={10} className="text-primary fill-current" />
                    <span>{challenges.find((c: any) => c.id === selectedPhoto.challenge_id)?.title}</span>
                  </div>
                ) : (
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 italic leading-none">Aucun défi associé</p>
                )}

                {/* Associer un nouveau défi */}
                {challenges.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[7px] font-black uppercase tracking-wider text-gray-500 block">Lier à un défi :</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPhoto.challenge_id && (
                        <button 
                          disabled={isBindingChallenge}
                          onClick={() => handleBindPhotoToChallenge(selectedPhoto.id, null)}
                          className="px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/15 hover:bg-red-500/20 transition-all"
                        >
                          Détacher
                        </button>
                      )}
                      {challenges.map((c: any) => {
                        if (c.id === selectedPhoto.challenge_id) return null
                        return (
                          <button 
                            key={c.id}
                            disabled={isBindingChallenge}
                            onClick={() => handleBindPhotoToChallenge(selectedPhoto.id, c.id)}
                            className="px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest glass text-gray-400 hover:text-white border border-white/5 hover:bg-white/10 transition-all"
                          >
                            {c.title}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox Plein Écran Premium */}
      {selectedPhoto && isFullscreen && createPortal(
        <div 
          onClick={() => setIsFullscreen(false)} 
          className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center animate-in fade-in duration-200 cursor-zoom-out select-none"
        >
          {/* Background blurred representation for rich cinematic padding */}
          <div className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 pointer-events-none scale-110" style={{ backgroundImage: 'url(' + (selectedPhoto.url_original?.startsWith('blob:') ? selectedPhoto.url_original : import.meta.env.VITE_SUPABASE_URL + '/storage/v1/object/public/events_photos/' + selectedPhoto.url_original) + ')' }} />

          <img 
            src={selectedPhoto.url_original?.startsWith('blob:') ? selectedPhoto.url_original : import.meta.env.VITE_SUPABASE_URL + '/storage/v1/object/public/events_photos/' + selectedPhoto.url_original} 
            className="w-full h-full object-contain relative z-10 p-2 md:p-6" 
            alt="Plein écran"
          />
          
          {/* Bouton fermer en haut à droite en plein écran */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
            className="absolute top-6 right-6 z-20 bg-black/60 backdrop-blur-md p-3 rounded-full text-white/80 hover:text-white border border-white/10 hover:bg-black/80 transition-all flex items-center justify-center shadow-2xl active:scale-90"
          >
            <X size={20} />
          </button>

          {/* Toast d'information en bas */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-full text-white/60 text-[9px] font-black uppercase tracking-[0.2em] border border-white/10 pointer-events-none">
            Cliquez n'importe où pour fermer
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

