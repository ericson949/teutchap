import { useState, useEffect } from 'react'
import { X, Play, Pause } from 'lucide-react'

interface HighlightReelProps {
  photos: any[]
  onClose: () => void
}

export default function HighlightReel({ photos, onClose }: HighlightReelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const DURATION_PER_SLIDE = 5000 // 5 seconds per photo
  const UPDATE_INTERVAL = 50 // ms

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + (UPDATE_INTERVAL / DURATION_PER_SLIDE) * 100
        if (nextProgress >= 100) {
          handleNext()
          return 0
        }
        return nextProgress
      })
    }, UPDATE_INTERVAL)

    return () => clearInterval(timer)
  }, [currentIndex, isPaused])

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setProgress(0)
    }
  }

  if (!photos || photos.length === 0) return null

  const currentPhoto = photos[currentIndex]

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-300">
      {/* Background Blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src={currentPhoto.url_original?.startsWith('blob:') ? currentPhoto.url_original : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${currentPhoto.url_original}`} 
          className="w-full h-full object-cover blur-3xl opacity-30"
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-md h-full md:h-[90vh] md:rounded-[2.5rem] overflow-hidden bg-black flex flex-col">
        
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 p-4 flex space-x-1 z-20 bg-gradient-to-b from-black/80 to-transparent pt-6 md:pt-4">
          {photos.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75 ease-linear"
                style={{ 
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Controls */}
        <div className="absolute top-8 left-0 right-0 px-4 flex justify-between items-center z-20">
          <div className="flex items-center space-x-2">
             <div className="bg-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                Top {currentIndex + 1}/{photos.length}
             </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsPaused(!isPaused)} className="text-white hover:opacity-70 transition-opacity">
              {isPaused ? <Play size={24} className="fill-current" /> : <Pause size={24} className="fill-current" />}
            </button>
            <button onClick={onClose} className="text-white hover:opacity-70 transition-opacity">
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div 
          className="flex-1 relative flex items-center justify-center"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <img 
            key={currentPhoto.id}
            src={currentPhoto.url_original?.startsWith('blob:') ? currentPhoto.url_original : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${currentPhoto.url_original}`} 
            className="w-full h-full object-cover"
          />

          {/* Navigation Overlay Areas (Invisible) */}
          <div className="absolute inset-y-0 left-0 w-1/3" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
          <div className="absolute inset-y-0 right-0 w-1/3" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
        </div>

        {/* Footer Meta */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent z-20 pb-12 md:pb-8">
           {currentPhoto.ai_tags && currentPhoto.ai_tags.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-4">
               {currentPhoto.ai_tags.map((tag: string) => (
                 <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full text-white backdrop-blur-md">
                   #{tag}
                 </span>
               ))}
             </div>
           )}
           <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">🔥 {currentPhoto.reaction_count || 0} réactions</span>
           </div>
        </div>
      </div>
    </div>
  )
}
