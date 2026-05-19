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
        className="group flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-white/[0.025] p-8 text-center shadow-[var(--shadow-card)] transition-all hover:border-[var(--color-accent)]/45 hover:bg-white/[0.04] active:scale-[0.99]"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-accent)]/25 bg-[var(--color-accent-soft)] text-[var(--color-accent)] transition-transform group-hover:scale-105">
          <Camera size={26} />
        </div>
        <div>
          <p className="text-base font-semibold text-white">Prendre une photo</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Signature automatique avec votre pseudo</p>
        </div>
      </button>

      <button
        onClick={onGalleryClick}
        className="btn-secondary w-full"
      >
        <ImageIcon size={16} />
        <span>Choisir depuis la galerie</span>
      </button>
    </div>
  )
}
