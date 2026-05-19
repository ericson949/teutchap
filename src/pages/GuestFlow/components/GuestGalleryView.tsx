import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Image as ImageIcon, ArrowLeft, X, User, Heart, Zap, Sparkles, Loader2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

interface GuestGalleryViewProps {
  photos: any[]
  userReactions: any
  reactions: any
  addReaction: (id: string, emoji: string) => void
  challenges?: any[]
  onPhotoSelectChange?: (selected: boolean) => void
}

const REACTIONS = ['❤️', '🔥', '👏']

export const GuestGalleryView: React.FC<GuestGalleryViewProps> = ({
  photos,
  userReactions,
  reactions,
  addReaction,
  challenges = [],
  onPhotoSelectChange
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null)
  const [isBindingChallenge, setIsBindingChallenge] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (onPhotoSelectChange) {
      onPhotoSelectChange(!!selectedPhoto)
    }
  }, [selectedPhoto, onPhotoSelectChange])

  const photoUrl = (photo: any, key: 'url_thumb' | 'url_original') =>
    photo[key]?.startsWith('blob:')
      ? photo[key]
      : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo[key]}`

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
      console.error('Erreur liaison mission:', e)
      alert('Erreur lors de la liaison a la mission.')
    } finally {
      setIsBindingChallenge(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-white">Album de l'evenement</h2>
      </div>

      {photos.length === 0 ? (
        <div className="ui-panel border-dashed py-20 text-center">
          <ImageIcon size={48} className="mx-auto mb-4 text-[var(--text-tertiary)]" />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">L'album est encore vide</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((photo) => {
            const photoChallenge = challenges.find((c: any) => c.id === photo.challenge_id)
            return (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white/5 shadow-lg"
              >
                <img
                  src={photoUrl(photo, 'url_thumb')}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {photoChallenge && (
                  <div className="ui-chip ui-chip-warm absolute left-2 top-2 max-w-[85%] truncate text-[10px]">
                    <Zap size={10} />
                    <span className="truncate">{photoChallenge.title}</span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <div className="flex justify-center gap-1">
                    {REACTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={(e) => { e.stopPropagation(); addReaction(photo.id, emoji) }}
                        className={`glass-dark flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] transition-all ${userReactions[photo.id] === emoji ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : ''}`}
                      >
                        <span>{emoji}</span>
                        {reactions[photo.id]?.[emoji] && <span className="font-semibold text-white">{reactions[photo.id][emoji]}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedPhoto && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="surface-elevated relative flex max-h-[90vh] w-full max-w-sm flex-col gap-5 overflow-y-auto rounded-[var(--radius-lg)] p-5 shadow-2xl">
            <div
              onClick={() => setIsFullscreen(true)}
              className="group relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-[var(--radius-md)] border border-white/15 shadow-2xl"
            >
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null) }}
                className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-black/55 p-2.5 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/75"
                title="Retour a l'album"
              >
                <ArrowLeft size={18} />
              </button>

              <img
                src={photoUrl(selectedPhoto, 'url_original')}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                <span className="ui-chip bg-black/60 text-white">Plein ecran</span>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow icon={<User size={16} />} label="Ajoute par" value={selectedPhoto.uploader_name || selectedPhoto.contributor_name || 'Invite'} />

              <div className="ui-panel-soft flex items-center gap-3 p-4">
                <div className="ui-icon h-10 w-10"><Heart size={16} /></div>
                <div className="min-w-0 flex-1">
                  <span className="t-caption">Reactions</span>
                  <div className="flex gap-2 pt-1">
                    {REACTIONS.map(emoji => {
                      const count = reactions[selectedPhoto.id]?.[emoji] || 0
                      return (
                        <div key={emoji} className="glass-dark flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
                          <span>{emoji}</span>
                          <span className="text-white">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="ui-panel-soft space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="t-caption">Mission associee</span>
                  {isBindingChallenge && <Loader2 size={12} className="animate-spin text-[var(--color-accent)]" />}
                </div>

                {selectedPhoto.challenge_id ? (
                  <div className="ui-chip ui-chip-warm">
                    <Sparkles size={10} />
                    <span>{challenges.find((c: any) => c.id === selectedPhoto.challenge_id)?.title}</span>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-tertiary)]">Aucune mission associee</p>
                )}

                {challenges.length > 0 && (
                  <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
                    <span className="t-caption block">Lier a une mission</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPhoto.challenge_id && (
                        <button
                          disabled={isBindingChallenge}
                          onClick={() => handleBindPhotoToChallenge(selectedPhoto.id, null)}
                          className="rounded-[var(--radius-sm)] border border-red-500/15 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20"
                        >
                          Detacher
                        </button>
                      )}
                      {challenges.map((c: any) => {
                        if (c.id === selectedPhoto.challenge_id) return null
                        return (
                          <button
                            key={c.id}
                            disabled={isBindingChallenge}
                            onClick={() => handleBindPhotoToChallenge(selectedPhoto.id, c.id)}
                            className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] transition-all hover:text-white"
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

      {selectedPhoto && isFullscreen && createPortal(
        <div
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-[120] flex cursor-zoom-out select-none flex-col items-center justify-center bg-black animate-in fade-in duration-200"
        >
          <div className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-3xl pointer-events-none" style={{ backgroundImage: `url(${photoUrl(selectedPhoto, 'url_original')})` }} />

          <img
            src={photoUrl(selectedPhoto, 'url_original')}
            className="relative z-10 h-full w-full object-contain p-2 md:p-6"
            alt="Plein ecran"
          />

          <button
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false) }}
            className="absolute right-6 top-6 z-20 flex items-center justify-center rounded-full border border-white/10 bg-black/60 p-3 text-white/80 shadow-2xl backdrop-blur-md transition-all hover:bg-black/80 hover:text-white active:scale-90"
          >
            <X size={20} />
          </button>

          <div className="ui-chip pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 bg-black/60 text-white/70 backdrop-blur-md">
            Cliquez pour fermer
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="ui-panel-soft flex items-center gap-3 p-4">
    <div className="ui-icon h-10 w-10">{icon}</div>
    <div className="min-w-0">
      <span className="t-caption">{label}</span>
      <p className="truncate text-sm font-semibold text-white">{value}</p>
    </div>
  </div>
)
