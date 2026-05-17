import { useState, useEffect } from 'react'
import { Cloud, Trash2, Eye, Download, FolderArchive, Loader2, Upload } from 'lucide-react'


export const GalleryTab = ({ 
  photos, 
  isAdminUploading, 
  adminFileInputRef, 
  handleAdminUploadChange, 
  handleDeletePhoto,
  selectedFilesForUpload = [],
  showUploadModal = false,
  setShowUploadModal,
  organizerCompress = true,
  setOrganizerCompress,
  confirmAdminUpload,
  cancelAdminUpload
}: any) => {

  const [isZipping, setIsZipping] = useState(false)
  const [zipProgress, setZipProgress] = useState(0)
  const [zipStatus, setZipStatus] = useState('')

  const [previewUrls, setPreviewUrls] = useState<string[]>([])

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
      // Import dynamique de JSZip comme spécifié dans le PRD (Architecture Technique)
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      const total = photos.length
      
      // 1. Récupération des fichiers binaires des photos
      for (let i = 0; i < total; i++) {
        const photo = photos[i]
        setZipStatus(`Récupération de la photo ${i + 1}/${total}...`)
        setZipProgress(Math.round((i / total) * 50)) // Utilise les premiers 50% pour le chargement

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

      // 2. Génération de l'archive ZIP compressée
      setZipStatus('Compression de l\'album...')
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        // Les 50% restants de la progression sont affectés à la phase de compression
        const compressionProgress = Math.round(50 + (metadata.percent || 0) / 2)
        setZipProgress(compressionProgress)
      })

      // 3. Déclenchement du téléchargement navigateur
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
      
      setTimeout(() => {
        setIsZipping(false)
      }, 1500)

    } catch (err) {
      console.error('Erreur lors de la génération du ZIP:', err)
      alert("Une erreur est survenue lors de l'assemblage de l'album ZIP.")
      setIsZipping(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">Galerie Temps Réel</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input type="file" multiple accept="image/*" className="hidden" ref={adminFileInputRef} onChange={handleAdminUploadChange} />
          
          {photos.length > 0 && (
            <button 
              onClick={handleDownloadZIP}
              disabled={isZipping}
              className="flex-1 md:flex-none bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-lg shadow-white/5"
            >
              <Download size={16} />
              <span>Télécharger ZIP</span>
            </button>
          )}

          <button 
            disabled={isAdminUploading}
            onClick={() => adminFileInputRef.current?.click()}
            className="flex-1 md:flex-none glass border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center justify-center space-x-2"
          >
            <Cloud size={16} />
            <span>{isAdminUploading ? 'Téléversement...' : 'Ajouter des photos'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {photos.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-40 italic">Aucune photo pour le moment</div>
        ) : (
          photos.map((photo: any) => (
            <div key={photo.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden glass border border-white/5 shadow-xl group">
              <img 
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><Eye size={20} /></button>
                <button onClick={(e) => handleDeletePhoto(photo, e)} className="p-3 bg-red-500/20 text-red-500 rounded-2xl hover:bg-red-500/30 transition-all"><Trash2 size={20} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Overlay Premium de Progression ZIP */}
      {isZipping && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass rounded-[3rem] p-10 max-w-sm w-full border border-primary/20 flex flex-col items-center text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Anneau de chargement */}
              <div className="absolute inset-0 border-4 border-white/5 border-t-primary rounded-full animate-spin" />
              <FolderArchive size={32} className="text-primary animate-pulse" />
            </div>
            
            <div className="space-y-2 relative z-10">
              <h3 className="text-lg font-black uppercase tracking-widest text-gradient">Création du ZIP</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider h-4">{zipStatus}</p>
            </div>

            {/* Barre de progression épurée */}
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 relative z-10">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(170,59,255,0.5)]" 
                style={{ width: `${zipProgress}%` }}
              />
            </div>

            <span className="text-2xl font-black text-white tabular-nums relative z-10">{zipProgress}%</span>
          </div>
        </div>
      )}

      {/* Modale de Prévisualisation & Confirmation Admin */}
      {showUploadModal && selectedFilesForUpload.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="glass rounded-[3rem] p-8 max-w-lg w-full border border-white/10 flex flex-col space-y-6 shadow-2xl relative overflow-hidden max-h-[90vh]">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />
            
            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase tracking-widest text-white">Validation de l'envoi</h3>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                {selectedFilesForUpload.length} {selectedFilesForUpload.length > 1 ? 'photos sélectionnées' : 'photo sélectionnée'}
              </p>
            </div>

            {/* Zone de prévisualisation des miniatures */}
            <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[220px] p-1 bg-black/30 rounded-2xl border border-white/5 scrollbar-thin">
              {previewUrls.map((url: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                  <img src={url} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Toggle de compression HD */}
            <div className="glass p-5 rounded-[2rem] border border-white/5 flex items-center justify-between space-x-4 relative overflow-hidden group">
              <div className="space-y-1 relative z-10">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Optimisation HD</h4>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-tight">
                  {organizerCompress 
                    ? "Activée (réduit la taille de 8 Mo à ~350 Ko par photo)" 
                    : "Qualité originale (fichier lourd et long à téléverser)"}
                </p>
              </div>
              <button 
                onClick={() => setOrganizerCompress(!organizerCompress)} 
                className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${organizerCompress ? 'bg-primary shadow-[0_0_15px_rgba(170,59,255,0.4)]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${organizerCompress ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-2">
              <button 
                onClick={cancelAdminUpload}
                className="flex-1 py-4 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:bg-white/5 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={confirmAdminUpload}
                className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all shadow-lg shadow-white/5 flex items-center justify-center space-x-2"
              >
                <Upload size={14} />
                <span>Téléverser</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


