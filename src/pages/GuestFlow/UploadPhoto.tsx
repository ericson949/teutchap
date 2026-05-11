import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon, X, Check, Loader2 } from 'lucide-react'
import localforage from 'localforage'
import { supabase } from '../../lib/supabase'

export default function UploadPhoto() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [compressedSize, setCompressedSize] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Max resolution
        const MAX_WIDTH = 1920
        const MAX_HEIGHT = 1080

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas context null'))
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Compress (75% quality)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Blob null'))
          },
          'image/jpeg',
          0.75
        )
      }
      img.onerror = reject
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      try {
        const compressedBlob = await compressImage(file)
        setCompressedSize(compressedBlob.size)
        setPhotoBlob(compressedBlob)
        setPhotoUrl(URL.createObjectURL(compressedBlob))
      } catch (err) {
        console.error('Compression error:', err)
        alert("Erreur lors de la préparation de l'image.")
      }
    }
  }

  const handleUpload = async () => {
    if (!photoBlob) return
    setIsUploading(true)

    try {
      const isOnline = navigator.onLine
      
      if (!isOnline) {
        // Save to IndexedDB via localforage
        const offlineQueue: any[] = await localforage.getItem('teutchap_offline_queue') || []
        offlineQueue.push({
          token,
          blob: photoBlob,
          timestamp: new Date().toISOString()
        })
        await localforage.setItem('teutchap_offline_queue', offlineQueue)
        
        // Register background sync if available
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const swRegistration = await navigator.serviceWorker.ready
          // @ts-ignore
          await swRegistration.sync.register('sync-photos')
        }

        alert('Réseau indisponible. Photo sauvegardée, elle sera envoyée dès que vous aurez du réseau.')
        navigate(`/e/${token}`)
        return
      }

      // Online: upload to Supabase Storage
      const fileName = `${token}_${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('events_photos')
        .upload(fileName, photoBlob)

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        throw uploadError
      }

      // Add to DB
      const { error: dbError } = await supabase.from('photos').insert([
        {
          event_id: 'mock-event-id', // Normally get this from the token lookup
          url_original: fileName,
          url_thumb: fileName,
          file_size_bytes: compressedSize
        }
      ])
      
      if (dbError) throw dbError

      alert('Photo ajoutée ! ✓')
      navigate(`/e/${token}`)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'envoi. Sauvegarde locale...")
      // Fallback offline logic
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-gray-300">
          <X size={24} />
        </button>
        <span className="font-medium text-sm">Ajouter une photo</span>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {!photoUrl ? (
          <div className="w-full max-w-sm space-y-4">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 transition-colors"
            >
              <div className="bg-primary/20 p-4 rounded-full">
                <Camera size={32} className="text-primary-foreground" />
              </div>
              <span className="font-medium">Prendre une photo</span>
            </button>
            <input 
              ref={cameraInputRef}
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleFileChange}
            />

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 flex items-center justify-center space-x-3 transition-colors"
            >
              <ImageIcon size={20} className="text-gray-400" />
              <span className="font-medium text-gray-300 text-sm">Depuis la galerie</span>
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex-1 rounded-2xl overflow-hidden bg-white/5 relative mb-6 flex items-center justify-center">
              <img src={photoUrl} alt="Preview" className="max-h-[60vh] max-w-full object-contain" />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-gray-300 border border-white/10">
                {(compressedSize / 1024).toFixed(0)} Ko
              </div>
            </div>

            <div className="flex space-x-3 mt-auto pb-8">
              <button 
                onClick={() => setPhotoUrl(null)}
                disabled={isUploading}
                className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-xl font-medium transition-colors"
              >
                Reprendre
              </button>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-[2] bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-medium transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>Confirmer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
