import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, X, Upload, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUploadLogic } from '../../hooks/useUploadLogic'
import { UploadActionButtons } from './components/UploadActionButtons'

interface UploadPhotoProps {
  isModal?: boolean
  onClose?: () => void
  token?: string
}

export default function UploadPhoto({ isModal = false, onClose, token: propToken }: UploadPhotoProps) {
  const { token: routeToken } = useParams()
  const navigate = useNavigate()
  const activeToken = propToken || routeToken

  const {
    pendingPhotos, setPendingPhotos, isCompressing, isUploading,
    challenges, selectedChallenge, setSelectedChallenge,
    guestPseudo, handleUpload, compressImage,
    shouldCompress, setShouldCompress
  } = useUploadLogic(activeToken)

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const onFileChange = async (e: any) => {
    const files = Array.from(e.target.files as FileList)
    const newPhotos = []
    for (const f of files) {
      const blob = shouldCompress ? await compressImage(f) : f
      newPhotos.push({ id: Math.random().toString(36), blob, url: URL.createObjectURL(blob), compressedSize: blob.size })
    }
    setPendingPhotos([...pendingPhotos, ...newPhotos])
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  const handleComplete = () => {
    if (onClose) {
      onClose()
    } else {
      navigate(`/e/${activeToken}`)
    }
  }

  const content = (
    <div className={`min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col ${isModal ? 'w-full h-full' : ''}`}>
      <header className="glass-dark sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3 backdrop-blur-xl">
        <button onClick={handleClose} className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-white" aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-semibold text-white">Nouveau souvenir</h1>
          <span className="t-caption">Signe par {guestPseudo}</span>
        </div>
        <div className="w-10" />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 p-4">
        <div className="glass flex items-center justify-between gap-4 rounded-[var(--radius-md)] border-[var(--border-default)] p-5">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white">Qualite optimisee</h4>
            <p className="text-xs leading-5 text-[var(--text-secondary)]">
              {shouldCompress
                ? "Economise les donnees mobiles sans casser le souvenir."
                : "Conserve la qualite originale. Les fichiers seront plus lourds."}
            </p>
          </div>
          <button
            onClick={() => setShouldCompress(!shouldCompress)}
            className={`relative h-7 w-12 shrink-0 rounded-full border transition-all ${shouldCompress ? 'border-[var(--color-accent)] bg-[var(--color-accent)] shadow-[0_0_16px_var(--color-accent-glow)]' : 'border-white/15 bg-white/5'}`}
            aria-pressed={shouldCompress}
          >
            <div className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${shouldCompress ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        {isCompressing ? <LoadingState /> : pendingPhotos.length === 0 ? (
          <UploadActionButtons
            onCameraClick={() => cameraRef.current?.click()}
            onGalleryClick={() => galleryRef.current?.click()}
          />
        ) : (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="grid grid-cols-2 gap-3">
              {pendingPhotos.map(p => (
                <div key={p.id} className="group relative aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white/5 shadow-xl">
                  <img src={p.url} className="h-full w-full object-cover" />
                  <button onClick={() => setPendingPhotos(prev => prev.filter(x => x.id !== p.id))} className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/65 p-2 text-white transition-colors hover:bg-black/80" aria-label="Retirer la photo"><X size={14} /></button>
                  <div className="glass-dark absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-[10px] font-semibold text-[var(--color-accent)]">{(p.compressedSize / 1024).toFixed(0)} KB</div>
                </div>
              ))}
            </div>

            {challenges.length > 0 && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 t-eyebrow"><Zap size={12} className="text-[var(--color-champagne)]" /><span>Associer a une mission</span></h3>
                <div className="grid grid-cols-2 gap-2">
                  {challenges.map(c => (
                    <button key={c.id} onClick={() => setSelectedChallenge(selectedChallenge === c.id ? null : c.id)} className={`rounded-[var(--radius-sm)] border p-3 text-left text-xs font-semibold transition-all ${selectedChallenge === c.id ? 'border-[var(--color-accent)]/35 bg-[var(--color-accent-soft)] text-white' : 'border-[var(--border-subtle)] bg-white/[0.025] text-[var(--text-secondary)] hover:text-white'}`}>
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isUploading}
              className="btn-accent w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Publier les souvenirs</span>
                </>
              )}
            </button>
          </div>
        )}

        {showConfirmModal && pendingPhotos.length > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="surface-elevated relative flex w-full max-w-sm flex-col gap-6 overflow-hidden rounded-[var(--radius-lg)] p-6 shadow-2xl">
              <div className="space-y-1 text-center">
                <h3 className="font-serif text-2xl text-white">Pret a publier ?</h3>
                <p className="t-caption">
                  {pendingPhotos.length} {pendingPhotos.length > 1 ? 'photos pretes a rejoindre l album' : 'photo prete a rejoindre l album'}
                </p>
              </div>

              <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white/[0.03] p-4 text-xs text-[var(--text-secondary)]">
                <SummaryRow label="Qualite" value={shouldCompress ? 'Optimisee' : 'Originale'} />
                {selectedChallenge && (
                  <SummaryRow
                    label="Mission"
                    value={challenges.find(c => c.id === selectedChallenge)?.title || 'Selectionnee'}
                  />
                )}
                <SummaryRow
                  label="Poids estime"
                  value={`${(pendingPhotos.reduce((sum, p) => sum + p.compressedSize, 0) / 1024).toFixed(0)} KB`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false)
                    handleUpload(handleComplete)
                  }}
                  className="btn-accent flex-1"
                >
                  <Upload size={14} />
                  <span>Publier</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
      </main>
    </div>
  )

  if (isModal) {
    return (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-[var(--bg-app)]"
      >
        {content}
      </motion.div>
    )
  }

  return content
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <span>{label}</span>
    <span className="truncate text-right font-semibold text-white">{value}</span>
  </div>
)

const LoadingState = () => (
  <div className="glass rounded-[var(--radius-lg)] border-[var(--border-default)] p-10 text-center">
    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
    <div className="mt-4 space-y-1">
      <p className="text-sm font-semibold text-white">Preparation des photos...</p>
      <p className="t-caption">Optimisation locale avant l envoi</p>
    </div>
  </div>
)
