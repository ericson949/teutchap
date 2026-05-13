import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon, X, Loader2, ArrowLeft, Zap, Upload, AlertCircle, ShieldCheck } from 'lucide-react'
import localforage from 'localforage'
import { supabase } from '../../lib/supabase'
import { useAppPlans } from '../../hooks/useAppPlans'

export default function UploadPhoto() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  interface PendingPhoto {
    id: string
    file: File
    blob: Blob
    url: string
    compressedSize: number
  }
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [eventData, setEventData] = useState<any>(null)
  const [challenges, setChallenges] = useState<any[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [guestPseudo, setGuestPseudo] = useState<string>('Invité Anonyme')
  const [localUploadsCount, setLocalUploadsCount] = useState<number>(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) return
    
    // Récupérer la session persistante
    const savedPseudo = localStorage.getItem(`teutchap_pseudo_${token}`) || 'Invité Anonyme'
    setGuestPseudo(savedPseudo)

    const checkAccurateCount = async (evId?: string) => {
      let offlineCount = 0
      try {
        const queue: any[] = await localforage.getItem('teutchap_offline_queue') || []
        offlineCount = queue.filter(item => item.token === token).length
      } catch(e){}

      let remoteCount = 0
      if (evId && !evId.startsWith('mock-id-')) {
        const cachedP = localStorage.getItem(`teutchap_photos_cache_${evId}`)
        if (cachedP) {
          try {
            const arr = JSON.parse(cachedP)
            remoteCount = arr.filter((p: any) => p.uploader_name === savedPseudo || p.contributor_name === savedPseudo).length
          } catch(e){}
        }
        if (navigator.onLine) {
          try {
            const { count } = await supabase
              .from('photos')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', evId)
              .eq('uploader_name', savedPseudo)
            if (count !== null && count !== undefined) {
              remoteCount = count
            }
          } catch(e){}
        }
      }

      const accurateTotal = offlineCount + remoteCount
      setLocalUploadsCount(accurateTotal)
      localStorage.setItem(`teutchap_uploads_count_${token}`, accurateTotal.toString())
    }

    const fetchEventInfo = async () => {
      let resolvedEvent = null
      const cachedEvent = localStorage.getItem(`teutchap_event_cache_${token}`)
      if (cachedEvent) {
        try {
          resolvedEvent = JSON.parse(cachedEvent)
          setEventData(resolvedEvent)
        } catch(e){}
      }

      if (navigator.onLine) {
        try {
          const { data: event } = await supabase.from('events').select('*').eq('token', token).single()
          if (event) {
            resolvedEvent = event
            setEventData(event)
            localStorage.setItem(`teutchap_event_cache_${token}`, JSON.stringify(event))
            if (event.id) localStorage.setItem(`teutchap_event_cache_${event.id}`, JSON.stringify(event))
            const { data: chalData } = await supabase.from('challenges').select('*').eq('event_id', event.id)
            if (chalData) setChallenges(chalData)
          }
        } catch (err) {
          console.error("Erreur fetchEventInfo Supabase:", err)
        }
      }

      if (!resolvedEvent) {
        const mockPlan = localStorage.getItem('teutchap_dev_plan') || 'premium'
        resolvedEvent = {
          id: `mock-id-${token}`,
          name: "Célébration Teutchap",
          token: token,
          plan: mockPlan
        }
        setEventData(resolvedEvent)
      }

      await checkAccurateCount(resolvedEvent?.id)
    }
    fetchEventInfo()
  }, [token])

  // Détermination de la limite d'uploads autorisés sur cet appareil pour protéger les quotas du plan
  const plan = eventData?.plan || 'free'
  const { currentConfig } = useAppPlans(plan)
  const maxUploadsPerDevice = currentConfig.max_photos_per_user
  const isUploadQuotaExceeded = localUploadsCount >= maxUploadsPerDevice

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      let resolved = false;
      const complete = (res: Blob) => {
        if (!resolved) {
          resolved = true;
          resolve(res);
        }
      };

      // Sécurité anti-gel : si l'image native mobile (HEIC, etc.) ne charge pas en 1.2s, on renvoie le fichier brut
      setTimeout(() => {
        complete(file);
      }, 1200);

      try {
        if (!file || !file.type || !file.type.startsWith('image/')) {
          return complete(file);
        }
        
        let objectUrl = '';
        try {
          objectUrl = URL.createObjectURL(file);
        } catch (e) {
          return complete(file);
        }

        const img = new Image();
        img.src = objectUrl;
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            const MAX_WIDTH = 1920;
            const MAX_HEIGHT = 1080;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              try { URL.revokeObjectURL(objectUrl); } catch(e){}
              return complete(file);
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(
              (blob) => {
                try { URL.revokeObjectURL(objectUrl); } catch(e){}
                if (blob) complete(blob);
                else complete(file);
              },
              'image/jpeg',
              0.75
            );
          } catch (e) {
            try { URL.revokeObjectURL(objectUrl); } catch(err){}
            complete(file);
          }
        };
        
        img.onerror = () => {
          try { URL.revokeObjectURL(objectUrl); } catch(e){}
          complete(file);
        };
      } catch (fatalErr) {
        complete(file);
      }
    });
  }


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const files = Array.from(e.target.files)
    const remainingQuota = maxUploadsPerDevice - localUploadsCount - pendingPhotos.length

    if (remainingQuota <= 0) {
      alert(`⚠️ Quota atteint : Votre appareil a déjà partagé ou mis en file le maximum de ${maxUploadsPerDevice} photos autorisées sur cette formule.`)
      return
    }

    const allowedFiles = files.slice(0, remainingQuota)
    if (files.length > remainingQuota) {
      alert(`⚠️ Quota limité : Seules les ${remainingQuota} premières photos sélectionnées ont pu être prises en compte pour respecter la limite de votre appareil.`)
    }

    setIsCompressing(true)
    
    try {
      const newPhotos: PendingPhoto[] = []
      for (const file of allowedFiles) {
        try {
          const compressedBlob = await compressImage(file)
          
          let previewUrl = ''
          try {
            previewUrl = URL.createObjectURL(compressedBlob)
          } catch (urlErr) {
            try {
              previewUrl = await new Promise<string>((res) => {
                const reader = new FileReader()
                reader.onloadend = () => res((reader.result as string) || '')
                reader.onerror = () => res('')
                reader.readAsDataURL(compressedBlob)
              })
            } catch (readerErr) {
              previewUrl = ''
            }
          }

          newPhotos.push({
            id: crypto.randomUUID(),
            file,
            blob: compressedBlob,
            url: previewUrl,
            compressedSize: compressedBlob.size
          })
        } catch (itemErr) {
          console.warn('Skipping item compression error:', itemErr)
        }
      }
      
      if (newPhotos.length > 0) {
        setPendingPhotos(prev => [...prev, ...newPhotos])
      }
    } catch (err) {
      console.error('File selection error:', err)
    } finally {
      setIsCompressing(false)
      // Réinitialisation de la valeur de l'input pour autoriser la re-sélection des mêmes fichiers
      e.target.value = ''
    }
  }

  const handleUpload = async () => {
    if (pendingPhotos.length === 0) return
    setIsUploading(true)

    let realEventId = eventData?.id
    if (!realEventId || realEventId.startsWith('mock-id-')) {
      const cached = localStorage.getItem(`teutchap_event_cache_${token}`)
      if (cached) {
        try { realEventId = JSON.parse(cached).id } catch(e){}
      }
    }

    const isOnline = navigator.onLine
    const targetEventId = realEventId || `mock-id-${token}`

    const enqueueSingleOffline = async (photoItem: any) => {
      try {
        const offlineQueue: any[] = await localforage.getItem('teutchap_offline_queue') || []
        offlineQueue.push({
          id: crypto.randomUUID(),
          token,
          eventId: targetEventId,
          blob: photoItem.blob,
          previewUrl: photoItem.url,
          compressedSize: photoItem.compressedSize,
          challengeId: selectedChallenge,
          contributorName: guestPseudo,
          timestamp: new Date().toISOString()
        })
        await localforage.setItem('teutchap_offline_queue', offlineQueue)
      } catch (qErr) {
        console.error("Erreur d'écriture dans la file locale:", qErr)
      }
    }

    try {
      if (!isOnline || !realEventId || realEventId.startsWith('mock-id-')) {
        for (const item of pendingPhotos) {
          await enqueueSingleOffline(item)
        }
        const nextCount = localUploadsCount + pendingPhotos.length
        localStorage.setItem(`teutchap_uploads_count_${token}`, nextCount.toString())
        setLocalUploadsCount(nextCount)

        alert(`🌐 Mode Démo / Hors-ligne activé. Vos ${pendingPhotos.length} souvenirs signés sont mis en file d'attente et visibles instantanément !`)
        navigate(`/e/${token}`)
        return
      }

      // Mode en ligne : Upload séquentiel sécurisé pour le lot de photos
      let successCount = 0
      for (const item of pendingPhotos) {
        try {
          const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
          const fileName = `${token}_${uniqueSuffix}.jpg`
          
          const { error: uploadError } = await supabase.storage
            .from('events_photos')
            .upload(fileName, item.blob, {
              cacheControl: '3600',
              upsert: false,
              contentType: item.blob.type || 'image/jpeg'
            })

          if (uploadError) throw uploadError

          const payload = {
            event_id: targetEventId,
            url_original: fileName,
            url_thumb: fileName,
            file_size_bytes: item.compressedSize,
            challenge_id: selectedChallenge,
            is_moderated: false,
            uploader_name: guestPseudo
          }

          const { error: dbError } = await supabase.from('photos').insert([payload])
          if (dbError) throw dbError

          successCount++
        } catch (itemErr) {
          console.error("Erreur sur l'upload d'un item, basculement en file locale:", itemErr)
          await enqueueSingleOffline(item)
        }
      }

      const nextCount = localUploadsCount + pendingPhotos.length
      localStorage.setItem(`teutchap_uploads_count_${token}`, nextCount.toString())
      setLocalUploadsCount(nextCount)

      if (successCount === pendingPhotos.length) {
        alert(`✨ Succès : ${successCount} photo(s) publiée(s) et signée(s) en direct sur le mur !`)
      } else if (successCount > 0) {
        alert(`⚠️ Reçu partiel : ${successCount} photos publiées en ligne. Les autres ont été sécurisées en file locale suite à une perturbation réseau.`)
      } else {
        alert(`🌐 Mode de secours local activé. Vos photos signées sont sécurisées en file d'attente et visibles instantanément !`)
      }

      navigate(`/e/${token}`)
    } catch (err) {
      console.error(err)
      for (const item of pendingPhotos) {
        await enqueueSingleOffline(item)
      }
      const nextCount = localUploadsCount + pendingPhotos.length
      localStorage.setItem(`teutchap_uploads_count_${token}`, nextCount.toString())
      setLocalUploadsCount(nextCount)

      alert("Erreur de connexion. L'intégralité de vos photos sélectionnées a été conservée en sécurité en attente d'envoi automatique !")
      navigate(`/e/${token}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30 relative">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <header className="glass-dark border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-gradient">Nouveau Souvenir</h1>
          <span className="text-[8px] text-gray-500 font-bold">Signé par {guestPseudo}</span>
        </div>
        <div className="w-8" />
      </header>

      <main className="flex-1 p-4 space-y-6 relative z-10 max-w-xl mx-auto w-full">
        {/* Barre d'état des quotas de l'appareil */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-[10px] font-bold text-gray-400">Quota de votre appareil</span>
          </div>
          <span className={`font-black tabular-nums text-[11px] ${isUploadQuotaExceeded ? 'text-red-400' : 'text-primary-light'}`}>
            {localUploadsCount} / {maxUploadsPerDevice} captures
          </span>
        </div>

        {isCompressing ? (
          <div className="glass rounded-[2.5rem] p-12 text-center space-y-4 border-primary/20 animate-in fade-in duration-300">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-black text-white tracking-tight">Optimisation sur votre appareil...</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Compression HD intelligente via Canvas API</p>
            </div>
          </div>
        ) : pendingPhotos.length === 0 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black tracking-tight">Partagez l'instant</h2>
              <p className="text-gray-500 text-[9px] font-bold tracking-widest uppercase">
                Album : <span className="text-white">{eventData?.name}</span>
              </p>
            </div>

            {isUploadQuotaExceeded ? (
              <div className="glass border-red-500/20 bg-red-500/5 rounded-3xl p-6 text-center space-y-3">
                <AlertCircle size={32} className="text-red-400 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-white leading-relaxed">
                  Pour garantir un accès équitable au stockage, cet appareil a atteint son quota de contribution.
                </p>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                  Profitez de la galerie et des réactions en direct !
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => cameraInputRef.current?.click()}
                  className="glass rounded-[2rem] p-8 flex flex-col items-center justify-center space-y-3 border-dashed border-white/10 hover:border-primary/40 transition-all group active:scale-95 shadow-xl"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                    <Camera size={28} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-base tracking-tight">Prendre une photo</p>
                    <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-0.5 font-black">Instantané • Signature automatique</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="glass border border-white/10 rounded-xl py-4 flex items-center justify-center space-x-2 group hover:bg-white/5 transition-all"
                >
                  <ImageIcon size={14} className="text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="font-black text-[9px] uppercase tracking-widest text-gray-500 group-hover:text-white">Sélectionner plusieurs photos</span>
                </button>
              </div>
            )}

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-6 animate-in zoom-in-95 duration-300 pb-16">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-gradient">
                {pendingPhotos.length} {pendingPhotos.length > 1 ? 'Photos prêtes' : 'Photo prête'}
              </h3>
              {localUploadsCount + pendingPhotos.length < maxUploadsPerDevice && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary-light transition-colors flex items-center space-x-1 glass px-3 py-1.5 rounded-full border border-primary/20"
                >
                  <span>+ Ajouter au lot</span>
                </button>
              )}
            </div>

            <div className={`grid gap-3 ${pendingPhotos.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-2'}`}>
              {pendingPhotos.map(p => (
                <div key={p.id} className="relative glass rounded-2xl overflow-hidden shadow-xl border border-white/10 group aspect-[3/4]">
                  <img src={p.url} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setPendingPhotos(prev => prev.filter(item => item.id !== p.id))}
                    className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-2 rounded-full text-white border border-white/10 hover:bg-black/80 transition-all scale-90"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-2 left-2 glass-dark px-2 py-0.5 rounded text-[8px] font-black text-primary-light border-white/5 truncate max-w-[80%]">
                    {(p.compressedSize / 1024).toFixed(0)} KB
                  </div>
                </div>
              ))}
            </div>

            {/* Section Défis Optionnels */}
            {challenges.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-1.5">
                  <Zap size={12} className="text-primary fill-current" />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Associer le lot à un défi ?</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {challenges.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setSelectedChallenge(selectedChallenge === c.id ? null : c.id)}
                      className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-wider text-center transition-all border ${
                        selectedChallenge === c.id 
                          ? 'bg-primary border-primary text-white shadow shadow-primary/20 scale-105' 
                          : 'glass border-white/5 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-3 border-t border-white/20 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm tracking-widest uppercase font-black">Envoi de {pendingPhotos.length} photo{pendingPhotos.length > 1 ? 's' : ''}...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span className="text-sm tracking-widest uppercase font-black">Publier {pendingPhotos.length > 1 ? 'les photos signées' : 'la photo signée'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
