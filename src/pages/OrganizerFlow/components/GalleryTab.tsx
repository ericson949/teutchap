import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Cloud, Download, FolderArchive, Heart, Image as ImageIcon, Loader2, Sparkles, Trash2, Upload, User, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../../../lib/supabase'
import { PageHeader, PrimaryButton, SecondaryButton } from '../../../components/ui/primitives'
import type { Challenge, Photo } from '../../../types'

interface GalleryTabProps {
  photos: Photo[]
  challenges?: Challenge[]
  isAdminUploading: boolean
  adminFileInputRef: React.RefObject<HTMLInputElement | null>
  handleAdminUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDeletePhoto: (photo: Photo, e?: React.MouseEvent) => void
  selectedFilesForUpload?: File[]
  showUploadModal?: boolean
  setShowUploadModal: (val: boolean) => void
  organizerCompress?: boolean
  setOrganizerCompress: (val: boolean) => void
  confirmAdminUpload: () => void
  cancelAdminUpload: () => void
  onPhotoSelectChange?: (selected: boolean) => void
}

const storageUrl = (path?: string) => {
  if (!path) return ''
  if (path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('http')) return path
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${path}`
}

export const GalleryTab = ({
  photos,
  challenges = [],
  isAdminUploading,
  adminFileInputRef,
  handleAdminUploadChange,
  handleDeletePhoto,
  selectedFilesForUpload = [],
  showUploadModal = false,
  organizerCompress = false,
  setOrganizerCompress,
  confirmAdminUpload,
  cancelAdminUpload,
  onPhotoSelectChange
}: GalleryTabProps) => {
  const [isZipping, setIsZipping] = useState(false)
  const [zipProgress, setZipProgress] = useState(0)
  const [zipStatus, setZipStatus] = useState('')
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isBindingChallenge, setIsBindingChallenge] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const selectedChallenge = useMemo(
    () => challenges.find((challenge) => challenge.id === selectedPhoto?.challenge_id),
    [challenges, selectedPhoto?.challenge_id]
  )

  useEffect(() => {
    onPhotoSelectChange?.(!!selectedPhoto)
  }, [selectedPhoto, onPhotoSelectChange])

  useEffect(() => {
    if (!selectedFilesForUpload.length) {
      setPreviewUrls([])
      return
    }
    const urls = selectedFilesForUpload.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [selectedFilesForUpload])

  const handleBindPhotoToChallenge = async (photoId: string, challengeId: string | null) => {
    setIsBindingChallenge(true)
    try {
      const { error } = await supabase.from('photos').update({ challenge_id: challengeId }).eq('id', photoId)
      if (error) throw error
      setSelectedPhoto((prev) => prev ? { ...prev, challenge_id: challengeId } : null)
    } catch (e) {
      console.error('Erreur liaison defi:', e)
      alert('Erreur lors de la liaison au defi.')
    } finally {
      setIsBindingChallenge(false)
    }
  }

  const handleDownloadZIP = async () => {
    if (photos.length === 0) return
    setIsZipping(true)
    setZipProgress(0)
    setZipStatus('Preparation de l album...')

    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      for (let index = 0; index < photos.length; index++) {
        const photo = photos[index]
        setZipStatus(`Recuperation ${index + 1}/${photos.length}`)
        setZipProgress(Math.round((index / photos.length) * 55))

        try {
          const response = await fetch(storageUrl(photo.url_original || photo.url_thumb))
          if (!response.ok) throw new Error('Fetch failed')
          const blob = await response.blob()
          const extension = photo.url_original?.split('.').pop() || 'jpg'
          const author = (photo.uploader_name || photo.contributor_name || 'Invite').replace(/[^a-zA-Z0-9]/g, '_')
          zip.file(`${author}_${photo.id.slice(0, 5)}.${extension}`, blob)
        } catch (error) {
          console.warn(`Photo ignored in ZIP: ${photo.id}`, error)
        }
      }

      setZipStatus('Compression...')
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipProgress(Math.round(55 + (metadata.percent || 0) * 0.45))
      })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Teutchap_Album_${Date.now()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setZipStatus('Album exporte')
      setZipProgress(100)
      setTimeout(() => setIsZipping(false), 1200)
    } catch (error) {
      console.error('Erreur ZIP:', error)
      alert("Une erreur est survenue lors de l'export de l'album.")
      setIsZipping(false)
    }
  }

  return (
    <div className="relative space-y-8 pb-32 font-sans">
      <PageHeader
        eyebrow="Contenu"
        title="Galerie"
        description="Controlez les souvenirs ajoutes a l'album, associez-les a des missions et exportez l'ensemble."
        action={(
          <div className="flex flex-wrap items-center gap-3">
            <input type="file" multiple accept="image/*" className="hidden" ref={adminFileInputRef} onChange={handleAdminUploadChange} />
            {photos.length > 0 && (
              <SecondaryButton onClick={handleDownloadZIP} disabled={isZipping}>
                <Download size={16} />
                <span>Exporter</span>
              </SecondaryButton>
            )}
            <PrimaryButton disabled={isAdminUploading} onClick={() => adminFileInputRef.current?.click()}>
              <Cloud size={16} />
              <span>{isAdminUploading ? 'Envoi...' : 'Ajouter'}</span>
            </PrimaryButton>
          </div>
        )}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {photos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] py-28 text-center text-[var(--text-soft)]">
            <ImageIcon size={40} className="mb-4" />
            <p className="text-lg font-semibold text-[var(--text-main)]">Aucun souvenir</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">L'album est encore vide.</p>
          </div>
        ) : (
          photos.map((photo, index) => {
            const photoChallenge = challenges.find((challenge) => challenge.id === photo.challenge_id)
            return (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.025, 0.25) }}
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-left shadow-[var(--shadow-soft)] outline-none transition hover:border-white/18 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <img src={storageUrl(photo.url_thumb || photo.url_original)} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="truncate text-xs font-semibold text-white">{photo.uploader_name || photo.contributor_name || 'Invite'}</p>
                  {photoChallenge && (
                    <p className="mt-1 inline-flex max-w-full items-center gap-1 rounded-lg bg-black/45 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/75">
                      <Sparkles size={10} />
                      <span className="truncate">{photoChallenge.title}</span>
                    </p>
                  )}
                </div>
              </motion.button>
            )
          })
        )}
      </motion.div>

      <AnimatePresence>
        {isZipping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl">
            <div className="w-full max-w-sm rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow-soft)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/[0.03]">
                <FolderArchive size={24} className="text-[var(--accent)]" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Export de l'album</h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{zipStatus}</p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${zipProgress}%` }} />
              </div>
              <p className="mt-4 text-2xl font-semibold text-white">{zipProgress}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUploadModal && selectedFilesForUpload.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }} className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-xl font-semibold text-white">Ajouter des photos</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{selectedFilesForUpload.length} fichier(s) selectionne(s)</p>
              <div className="mt-6 grid max-h-64 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
                {previewUrls.map((url) => (
                  <div key={url} className="aspect-square overflow-hidden rounded-xl border border-[var(--line)]">
                    <img src={url} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white/[0.025] p-4">
                <div>
                  <p className="text-xs font-semibold text-white">Compression image</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{organizerCompress ? 'Optimise pour le web' : 'Qualite originale'}</p>
                </div>
                <button onClick={() => setOrganizerCompress(!organizerCompress)} className={`relative h-6 w-11 rounded-full border transition ${organizerCompress ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-white/15 bg-white/5'}`}>
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${organizerCompress ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <SecondaryButton onClick={cancelAdminUpload}>Annuler</SecondaryButton>
                <PrimaryButton onClick={confirmAdminUpload}><Upload size={15} /> Confirmer</PrimaryButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedPhoto && !isFullscreen && createPortal(
        <PhotoDetail
          photo={selectedPhoto}
          selectedChallenge={selectedChallenge}
          challenges={challenges}
          isBindingChallenge={isBindingChallenge}
          onClose={() => setSelectedPhoto(null)}
          onFullscreen={() => setIsFullscreen(true)}
          onBind={handleBindPhotoToChallenge}
          onDelete={(event) => {
            const photoToDelete = selectedPhoto
            setSelectedPhoto(null)
            handleDeletePhoto(photoToDelete, event)
          }}
        />,
        document.body
      )}

      {selectedPhoto && isFullscreen && createPortal(
        <div onClick={() => setIsFullscreen(false)} className="fixed inset-0 z-[120] flex cursor-zoom-out items-center justify-center bg-black">
          <img src={storageUrl(selectedPhoto.url_original || selectedPhoto.url_thumb)} className="relative z-10 h-full w-full object-contain p-3 md:p-6" />
          <button onClick={(event) => { event.stopPropagation(); setIsFullscreen(false) }} className="absolute right-5 top-5 z-20 rounded-xl border border-white/10 bg-black/55 p-3 text-white/75 backdrop-blur transition hover:text-white">
            <X size={20} />
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}

const PhotoDetail = ({
  photo,
  selectedChallenge,
  challenges,
  isBindingChallenge,
  onClose,
  onFullscreen,
  onBind,
  onDelete
}: {
  photo: Photo
  selectedChallenge?: Challenge
  challenges: Challenge[]
  isBindingChallenge: boolean
  onClose: () => void
  onFullscreen: () => void
  onBind: (photoId: string, challengeId: string | null) => void
  onDelete: (event: React.MouseEvent) => void
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/82 p-4 backdrop-blur-xl">
    <motion.div initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="grid max-h-[92vh] w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-soft)] md:grid-cols-[1.05fr_0.95fr]">
      <button type="button" onClick={onFullscreen} className="relative min-h-[360px] bg-black text-left">
        <img src={storageUrl(photo.url_original || photo.url_thumb)} className="h-full w-full object-contain" />
        <span className="absolute left-4 top-4 rounded-xl bg-black/55 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75 backdrop-blur">
          Plein ecran
        </span>
      </button>

      <div className="overflow-y-auto p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="ui-eyebrow">Detail photo</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-white">Souvenir</h3>
          </div>
          <button onClick={onClose} className="rounded-xl border border-[var(--line)] bg-white/[0.03] p-3 text-white/65 transition hover:text-white">
            <ArrowLeft size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoTile icon={<User size={16} />} label="Ajoute par" value={photo.uploader_name || photo.contributor_name || 'Invite'} />
          <InfoTile icon={<Heart size={16} />} label="Reactions" value={photo.reaction_count || 0} />
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--line)] bg-white/[0.025] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">Mission associee</p>
            {isBindingChallenge && <Loader2 size={14} className="animate-spin text-[var(--accent)]" />}
          </div>
          {selectedChallenge ? (
            <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white">
              <Sparkles size={14} className="text-[var(--accent)]" />
              <span className="truncate">{selectedChallenge.title}</span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-muted)]">Aucune mission associee.</p>
          )}

          {challenges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
              {photo.challenge_id && (
                <button onClick={() => onBind(photo.id, null)} className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-300">
                  Detacher
                </button>
              )}
              {challenges.filter((challenge) => challenge.id !== photo.challenge_id).map((challenge) => (
                <button key={challenge.id} onClick={() => onBind(photo.id, challenge.id)} className="rounded-lg border border-[var(--line)] bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65 transition hover:text-white">
                  {challenge.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={onDelete} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-red-300 transition hover:bg-red-500/15">
          <Trash2 size={15} />
          Supprimer de l'album
        </button>
      </div>
    </motion.div>
  </div>
)

const InfoTile = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="rounded-2xl border border-[var(--line)] bg-white/[0.025] p-4">
    <div className="text-[var(--accent)]">{icon}</div>
    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">{label}</p>
    <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
  </div>
)
