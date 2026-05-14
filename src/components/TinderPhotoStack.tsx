import React, { useState, useRef } from 'react';
import { Heart, X, MessageSquare, User, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Photo {
  id: string;
  url_original: string;
  contributor_name?: string;
  uploader_name?: string;
  created_at?: string;
  reaction_count?: number;
}

interface TinderPhotoStackProps {
  photos: Photo[];
  onSwipeLeft?: (photo: Photo) => void;
  onSwipeRight?: (photo: Photo) => void;
  onReact?: (photo: Photo, emoji: string) => void;
}

export default function TinderPhotoStack({ photos, onSwipeLeft, onSwipeRight, onReact }: TinderPhotoStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentPhoto = photos[currentIndex];
  const nextPhoto = photos[currentIndex + 1];

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setOffsetX(clientX - dragStart);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(offsetX) > 100) {
      const direction = offsetX > 0 ? 'right' : 'left';
      swipe(direction);
    } else {
      setOffsetX(0);
    }
  };

  const swipe = (direction: 'left' | 'right') => {
    setExitDirection(direction);
    setTimeout(() => {
      if (direction === 'right' && onSwipeRight && currentPhoto) {
        onSwipeRight(currentPhoto);
      } else if (direction === 'left' && onSwipeLeft && currentPhoto) {
        onSwipeLeft(currentPhoto);
      }
      
      setCurrentIndex(prev => prev + 1);
      setOffsetX(0);
      setExitDirection(null);
    }, 300);
  };

  if (currentIndex >= photos.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-gray-500 space-y-4">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
           <Clock size={32} />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em]">Plus de photos à découvrir !</p>
        <button 
          onClick={() => setCurrentIndex(0)}
          className="px-6 py-2 bg-primary/20 text-primary border border-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          Recommencer
        </button>
      </div>
    );
  }

  const rotation = offsetX / 10;
  const opacity = 1 - Math.abs(offsetX) / 500;

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] mt-4 select-none">
      {/* Background Card (Next Photo) */}
      {nextPhoto && (
        <div className="absolute inset-0 scale-[0.95] translate-y-4 blur-[1px] opacity-40">
          <div className="w-full h-full rounded-[2.5rem] bg-gray-900 border border-white/5 overflow-hidden shadow-2xl">
            <img 
             src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${nextPhoto.url_original}`} 
              className="w-full h-full object-cover"
              alt="Next"
            />
          </div>
        </div>
      )}

      {/* Foreground Card (Current Photo) */}
      <div
        ref={containerRef}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        className={cn(
          "absolute inset-0 z-10 cursor-grab active:cursor-grabbing transition-transform duration-300 ease-out will-change-transform",
          !isDragging && !exitDirection && "transition-all",
          exitDirection === 'right' && "translate-x-[500px] rotate-30 opacity-0",
          exitDirection === 'left' && "translate-x-[-500px] rotate-[-30deg] opacity-0"
        )}
        style={{
          transform: !exitDirection ? `translateX(${offsetX}px) rotate(${rotation}deg)` : undefined,
          opacity: !exitDirection ? opacity : undefined
        }}
      >
        <div className="w-full h-full rounded-[2.5rem] bg-gray-900 border border-white/10 overflow-hidden shadow-2xl relative">
          <img 
            src={`https://pydmzvbwpzofpdtvuxax.supabase.co/storage/v1/object/public/events_photos/${currentPhoto.url_original}`} 
            className="w-full h-full object-cover pointer-events-none"
            alt={currentPhoto.contributor_name || 'Event photo'}
          />
          
          {/* Action Badges */}
          <div className={cn(
            "absolute top-10 left-10 border-4 border-green-500 text-green-500 px-4 py-2 rounded-xl font-black text-2xl uppercase tracking-widest -rotate-12 transition-opacity",
            offsetX > 50 ? "opacity-100" : "opacity-0"
          )}>
            LOVE
          </div>
          <div className={cn(
            "absolute top-10 right-10 border-4 border-red-500 text-red-500 px-4 py-2 rounded-xl font-black text-2xl uppercase tracking-widest rotate-12 transition-opacity",
            offsetX < -50 ? "opacity-100" : "opacity-0"
          )}>
            SKIP
          </div>

          {/* Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 w-fit">
                   <User size={12} className="text-primary-light" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">
                      {currentPhoto.contributor_name || currentPhoto.uploader_name || 'Anonyme'}
                   </span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {currentPhoto.reaction_count || 0} Réactions
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Ajoutée il y a quelques instants
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute -bottom-20 left-0 right-0 flex items-center justify-center space-x-6 z-20">
        <button 
          onClick={() => swipe('left')}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-red-500 shadow-xl hover:scale-110 active:scale-95 transition-all"
        >
          <X size={24} />
        </button>
        <button 
          onClick={() => onReact && onReact(currentPhoto, '💖')}
          className="w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-accent shadow-xl hover:scale-110 active:scale-95 transition-all"
        >
          <MessageSquare size={24} />
        </button>
        <button 
          onClick={() => swipe('right')}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-green-500 shadow-xl hover:scale-110 active:scale-95 transition-all"
        >
          <Heart size={24} fill="currentColor" className={offsetX > 50 ? "animate-pulse" : ""} />
        </button>
      </div>
    </div>
  );
}
