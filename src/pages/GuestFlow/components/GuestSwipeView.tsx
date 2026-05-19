import React from 'react'
import { Camera } from 'lucide-react'
import TinderPhotoStack from '../../../components/TinderPhotoStack'

interface GuestSwipeViewProps {
  photos: any[]
  onSwipeRight: (photo: any) => void
}

export const GuestSwipeView: React.FC<GuestSwipeViewProps> = ({ photos, onSwipeRight }) => {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 text-center">
        <h2 className="font-serif text-3xl text-white">Decouverte</h2>
        <p className="t-caption mt-1">Glissez pour garder les moments que vous aimez</p>
      </div>

      {photos.length > 0 ? (
        <div className="relative aspect-[3/4] w-full max-w-sm">
          <TinderPhotoStack
            photos={photos.slice(0, 10)}
            onSwipeRight={onSwipeRight}
            onSwipeLeft={(photo) => console.log('Ignored', photo.id)}
          />
        </div>
      ) : (
        <div className="py-20 text-center text-[var(--text-tertiary)]">
          <Camera size={48} className="mx-auto mb-4" />
          <p className="text-sm font-semibold">Aucune photo a decouvrir</p>
        </div>
      )}
    </div>
  )
}
