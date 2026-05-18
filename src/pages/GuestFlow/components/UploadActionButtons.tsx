import React from 'react'
import { Camera, Image as ImageIcon } from 'lucide-react'

interface UploadActionButtonsProps {
  onCameraClick: () => void
  onGalleryClick: () => void
}

export const UploadActionButtons: React.FC<UploadActionButtonsProps> = ({ onCameraClick, onGalleryClick }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <button 
        onClick={onCameraClick}
        className="glass rounded-[2rem] p-8 flex flex-col items-center justify-center space-y-3 border-dashed border-white/10 hover:border-blue-500/40 transition-all group active:scale-95 shadow-xl"
      >
        <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
          <Camera size={28} className="text-blue-400" />
        </div>
        <div className="text-center">
          <p className="font-black text-base tracking-tight">Prendre une photo</p>
          <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-0.5 font-black">Instantané • Signature automatique</p>
        </div>
      </button>
      
      <button 
        onClick={onGalleryClick}
        className="glass border border-white/10 rounded-xl py-4 flex items-center justify-center space-x-2 group hover:bg-white/5 transition-all"
      >
        <ImageIcon size={14} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
        <span className="font-black text-[9px] uppercase tracking-widest text-gray-500 group-hover:text-white">Sélectionner plusieurs photos</span>
      </button>
    </div>
  )
}
