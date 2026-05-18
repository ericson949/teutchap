import { useState, useEffect } from 'react'
import { Cloud, Trash2, Download, FolderArchive, Loader2, Upload, X, User, Heart, Sparkles, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { supabase } from '../../../lib/supabase'

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
  cancelAdminUpload
}: any) => {

  const [isZipping, setIsZipping] = useState(false)
  const [zipProgress, setZipProgress] = useState(0)
  const [zipStatus, setZipStatus] = useState('')
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null)
  const [isBindingChallenge, setIsBindingChallenge] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

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
      console.error("Erreur liaison défi:", e)
      alert("Erreur lors de la liaison au défi.")
    } finally {
      setIsBindingChallenge(false)
    }
  }

  useEffect(() => {
    if (!selectedFilesForUpload || selectedFilesForUpload.length === 0) {
      setPreviewUrls([])
      return
    }
    const urls = selectedFilesForUpload.map((f: File) => URL.createObjectURL(f))
    setPreviewUrls(urls)
    return () => {
      urls.forEach((u: string) => URL.revokeObjectURL(u))
    }
  }, [selectedFilesForUpload])

  const handleDownloadZIP = async () => {
    if (photos.length === 0) return
    setIsZipping(true)
    setZipProgress(0)
    setZipStatus('Initialisation...')

    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const total = photos.length
      
      for (let i = 0; i < total; i++) {
        const photo = photos[i]
        setZipStatus(`Récupération de la photo ${i + 1}/${total}...`)
        setZipProgress(Math.round((i / total) * 50))

        try {
          const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_original || photo.url_thumb}`
          const response = await fetch(imageUrl)
          if (!response.ok) throw new Error('Échec du fetch')
          const blob = await response.blob()

          const extension = photo.url_original?.split('.').pop() || 'jpg'
          const uploaderName = photo.uploader_name || 'Invite'
          const safeUploaderName = uploaderName.replace(/[^a-zA-Z0-9]/g, '_')
          const filename = `${safeUploaderName}_${photo.id.substring(0, 5)}.${extension}`
          
          zip.file(filename, blob)
        } catch (fetchErr) {
          console.warn(`Échec de récupération de la photo ${photo.id}:`, fetchErr)
        }
      }

      setZipStatus('Compression de l\'album...')
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        const compressionProgress = Math.round(50 + (metadata.percent || 0) / 2)
        setZipProgress(compressionProgress)
      })

      setZipStatus('Enregistrement en cours...')
      const downloadUrl = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `Teutchap_Album_${Date.now()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

      setZipStatus('Album téléchargé !')
      setZipProgress(100)
      
      setTimeout(() => setIsZipping(false), 1500)
    } catch (err) {
      console.error('Erreur lors de la génération du ZIP:', err)
      alert("Une erreur est survenue lors de l'assemblage de l'album ZIP.")
      setIsZipping(false)
    }
  }

  return (
    <div className="relative space-y-8 pb-32 font-sans">
      {/* Premium background mesh blobs */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] -z-20 pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[50%] right-[5%] w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] -z-20 pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[10%] left-[20%] w-96 h-96 bg-blue-600/5 rounded-full blur-[130px] -z-20 pointer-events-none animate-pulse-slow" style={{ animationDelay: '4s' }} />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">Contenu</p>
          <h2 className="mt-2 text-4xl font-serif text-white tracking-tight">Galerie Temps Réel</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <input type="file" multiple accept="image/*" className="hidden" ref={adminFileInputRef} onChange={handleAdminUploadChange} />
          
          {photos.length > 0 && (
            <button 
              onClick={handleDownloadZIP}
              disabled={isZipping}
              className="flex-1 md:flex-none bg-blue-500/10 border border-blue-500/20 text-blue-300 px-6 py-4 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-blue-500/20 transition-all flex items-center justify-center space-x-3 active:scale-95"
            >
              <Download size={16} />
              <span>Télécharger l'album</span>
            </button>
          )}

          <button 
            disabled={isAdminUploading}
            onClick={() => adminFileInputRef.current?.click()}
            className="flex-1 md:flex-none bg-blue-500/10 border border-blue-500/20 text-blue-300 px-8 py-4 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-blue-500/20 transition-all flex items-center justify-center space-x-3 active:scale-95"
          >
            <Cloud size={16} />
            <span>{isAdminUploading ? 'Envoi...' : 'Ajouter'}</span>
          </button>
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {photos.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-white/30 border border-white/[0.05] rounded-[32px] bg-white/[0.02]">
            <ImageIcon size={48} className="mb-4 opacity-50" />
            <p className="font-serif text-xl tracking-tight">Aucun souvenir capturé</p>
            <p className="text-[10px] uppercase tracking-[0.2em] mt-2 font-medium">L'album est vide</p>
          </div>
        ) : (
          photos.map((photo: any, i: number) => {
            const photoChallenge = challenges.find((c: any) => c.id === photo.challenge_id)
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                key={photo.id} 
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-white/5 border border-white/[0.05] group cursor-pointer"
              >
                <img 
                  src={import.meta.env.VITE_SUPABASE_URL + '/storage/v1/object/public/events_photos/' + photo.url_thumb} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Subtle dark overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

                {photoChallenge && (
                  <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.15em] text-white flex items-center space-x-1.5 border border-white/20 z-20">
                    <Sparkles size={10} className="text-white" />
                    <span>{photoChallenge.title}</span>
                  </div>
                )}
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* Upload ZIP Modal Overlay */}
      <AnimatePresence>
        {isZipping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-[40px] p-10 max-w-sm w-full flex flex-col items-center text-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-white/5 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                <FolderArchive size={24} className="text-white opacity-80" />
              </div>
              
              <div className="space-y-3 z-10 w-full">
                <h3 className="text-2xl font-serif text-white tracking-tight">Préparation</h3>
                <p className="text-[9px] font-semibold text-white/50 uppercase tracking-[0.2em]">{zipStatus}</p>
              </div>

              <div className="w-full bg-white/[0.05] h-1 rounded-full overflow-hidden relative z-10">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-300" 
                  style={{ width: `${zipProgress}%` }}
                />
              </div>

              <span className="text-3xl font-serif text-white relative z-10">{zipProgress}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Confirmation Modal */}
      <AnimatePresence>
        {showUploadModal && selectedFilesForUpload.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/[0.03] rounded-[40px] p-8 max-w-lg w-full border border-white/[0.08] flex flex-col space-y-8 shadow-2xl overflow-hidden max-h-[90vh]"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-3xl font-serif text-white tracking-tight">Ajouter des photos</h3>
                <p className="text-[10px] text-white/50 font-medium uppercase tracking-[0.2em]">
                  {selectedFilesForUpload.length} fichier{selectedFilesForUpload.length > 1 && 's'} sélectionné{selectedFilesForUpload.length > 1 && 's'}
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto max-h-[250px] pr-2 scrollbar-thin">
                {previewUrls.map((url: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-[16px] overflow-hidden border border-white/10">
                    <img src={url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="bg-white/[0.02] p-6 rounded-[24px] border border-white/[0.05] flex items-center justify-between space-x-4">
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white">Compression d'image</h4>
                  <p className="text-[9px] text-white/40 font-medium uppercase tracking-widest leading-relaxed max-w-[200px]">
                    {organizerCompress ? "Optimisé pour le web (~350Ko/img)" : "Taille originale (Plus long)"}
                  </p>
                </div>
                <button 
                  onClick={() => setOrganizerCompress(!organizerCompress)} 
                  className={`w-12 h-6 rounded-full transition-all relative shrink-0 border ${organizerCompress ? 'bg-white border-white' : 'bg-transparent border-white/20'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${organizerCompress ? 'left-7 bg-black' : 'left-1 bg-white/40'}`} />
                </button>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={cancelAdminUpload}
                  className="flex-1 py-4 border border-white/10 hover:bg-white/[0.05] rounded-full font-bold uppercase text-[9px] tracking-[0.2em] text-white/60 hover:text-white transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmAdminUpload}
                  className="flex-1 py-4 bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 rounded-full font-bold uppercase text-[9px] tracking-[0.2em] transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Upload size={14} />
                  <span>Confirmer</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Detail View */}
      <AnimatePresence>
        {selectedPhoto && !isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white/[0.02] border border-white/[0.05] rounded-[40px] p-6 max-w-sm w-full flex flex-col space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <div 
                onClick={() => setIsFullscreen(true)}
                className="aspect-[3/4] w-full rounded-[24px] overflow-hidden border border-white/10 relative cursor-zoom-in group"
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }} 
                  className="absolute top-4 left-4 bg-black/40 backdrop-blur-xl p-3 rounded-full text-white hover:bg-black/60 transition-all z-20 border border-white/10"
                >
                  <ArrowLeft size={16} />
                </button>
                <img 
                  src={import.meta.env.VITE_SUPABASE_URL + '/storage/v1/object/public/events_photos/' + (selectedPhoto.url_original || selectedPhoto.url_thumb)} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>

              <div className="space-y-4 px-2 pb-2">
                {/* Info Block */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/[0.03] border border-white/[0.05] p-4 rounded-[20px] flex flex-col gap-2">
                      <User size={14} className="text-white/40" />
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-0.5">Capturé par</span>
                        <p className="text-[10px] font-mono text-white truncate">{selectedPhoto.uploader_name || selectedPhoto.contributor_name || 'Invité'}</p>
                      </div>
                   </div>
                   <div className="bg-white/[0.03] border border-white/[0.05] p-4 rounded-[20px] flex flex-col gap-2">
                      <Heart size={14} className="text-white/40" />
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-0.5">Réactions</span>
                        <div className="flex gap-1.5 mt-1">
                          {['❤️', '🔥', '👏'].map(emoji => {
                            const count = selectedPhoto.reaction_count || 0
                            return (
                              <div key={emoji} className="bg-white/5 px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center space-x-1">
                                <span>{emoji}</span>
                                <span className="text-white/80">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                   </div>
                </div>

                {/* Challenge Section */}
                <div className="bg-white/[0.03] border border-white/[0.05] p-5 rounded-[24px] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">Défi associé</span>
                    {isBindingChallenge && <Loader2 size={12} className="animate-spin text-white/50" />}
                  </div>
                  
                  {selectedPhoto.challenge_id ? (
                    <div className="inline-flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border border-white/20">
                      <Sparkles size={12} />
                      <span>{challenges.find((c: any) => c.id === selectedPhoto.challenge_id)?.title}</span>
                    </div>
                  ) : (
                    <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/30 italic">Aucun défi associé</p>
                  )}

                  {challenges.length > 0 && (
                    <div className="pt-4 border-t border-white/[0.05] space-y-3">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 block">Assigner à un défi</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedPhoto.challenge_id && (
                          <button 
                            disabled={isBindingChallenge}
                            onClick={() => handleBindPhotoToChallenge(selectedPhoto.id, null)}
                            className="px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                          >
                            Détacher
                          </button>
                        )}
                        {challenges.map((c: any) => {
                          if (c.id === selectedPhoto.challenge_id) return null
                          return (
                            <button 
                              key={c.id}
                              disabled={isBindingChallenge}
                              onClick={() => handleBindPhotoToChallenge(selectedPhoto.id, c.id)}
                              className="px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] bg-white/[0.05] text-white/60 border border-white/[0.08] hover:bg-white/10 hover:text-white transition-all"
                            >
                              {c.title}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={(e) => { setSelectedPhoto(null); handleDeletePhoto(selectedPhoto, e); }}
                  className="w-full py-4 mt-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-full font-bold uppercase text-[9px] tracking-[0.2em] transition-all flex items-center justify-center space-x-2"
                >
                  <Trash2 size={14} />
                  <span>Supprimer de l'album</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Cinematic Image */}
      <AnimatePresence>
        {selectedPhoto && isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)} 
            className="fixed inset-0 z-[120] bg-[#050505] flex items-center justify-center cursor-zoom-out select-none"
          >
            <div className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-20 pointer-events-none scale-110" style={{ backgroundImage: 'url(' + import.meta.env.VITE_SUPABASE_URL + '/storage/v1/object/public/events_photos/' + (selectedPhoto.url_original || selectedPhoto.url_thumb) + ')' }} />

            <img 
              src={import.meta.env.VITE_SUPABASE_URL + '/storage/v1/object/public/events_photos/' + (selectedPhoto.url_original || selectedPhoto.url_thumb)} 
              className="w-full h-full object-contain relative z-10 p-4" 
            />
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
              className="absolute top-8 right-8 z-20 bg-white/5 backdrop-blur-xl p-4 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center border border-white/10"
            >
              <X size={20} />
            </button>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full text-white/50 text-[9px] font-bold uppercase tracking-[0.2em] border border-white/5">
              Cliquer pour fermer
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
