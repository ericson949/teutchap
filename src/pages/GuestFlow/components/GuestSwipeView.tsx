import React from 'react'
import { Camera } from 'lucide-react'
import TinderPhotoStack from '../../../components/TinderPhotoStack'

interface GuestSwipeViewProps {
  photos: any[]
  onSwipeRight: (photo: any) => void
}

export const GuestSwipeView: React.FC<GuestSwipeViewProps> = ({ photos, onSwipeRight }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black tracking-tight">Découverte</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Swippez pour liker les moments</p>
      </div>
      
      {photos.length > 0 ? (
        <div className="w-full max-w-sm aspect-[3/4] relative">
          <TinderPhotoStack 
            photos={photos.slice(0, 10)} 
            onSwipeRight={onSwipeRight}
            onSwipeLeft={(photo) => console.log('Ignored', photo.id)}
          />
        </div>
      ) : (
        <div className="text-center py-20 opacity-40">
          <Camera size={48} className="mx-auto mb-4" />
          <p className="font-black uppercase tracking-widest text-sm">Aucune photo à swiper</p>
        </div>
      )}
    </div>
  )
}
