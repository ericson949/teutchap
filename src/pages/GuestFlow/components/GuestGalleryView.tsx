import React from 'react'
import { Image as ImageIcon } from 'lucide-react'

interface GuestGalleryViewProps {
  photos: any[]
  userReactions: any
  reactions: any
  addReaction: (id: string, emoji: string) => void
}

export const GuestGalleryView: React.FC<GuestGalleryViewProps> = ({ photos, userReactions, reactions, addReaction }) => {
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
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden glass border border-white/5 shadow-lg group">
              <img 
                src={photo.url_thumb?.startsWith('blob:') ? photo.url_thumb : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
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
          ))}
        </div>
      )}
    </div>
  )
}
