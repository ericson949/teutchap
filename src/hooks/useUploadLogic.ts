import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import localforage from 'localforage'

export function useUploadLogic(token: string | undefined) {
  const [pendingPhotos, setPendingPhotos] = useState<any[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [eventData, setEventData] = useState<any>(null)
  const [challenges, setChallenges] = useState<any[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [localUploadsCount] = useState<number>(0)
  const [guestPseudo, setGuestPseudo] = useState<string>('Invité')
  const [shouldCompress, setShouldCompress] = useState(true)


  useEffect(() => {
    if (!token) return
    const saved = localStorage.getItem(`teutchap_pseudo_${token}`) || 'Invité'
    setGuestPseudo(saved)

    const fetchInfo = async () => {
      const { data: event } = await supabase.from('events').select('*').eq('token', token).single()
      if (event) {
        setEventData(event)
        const { data: c } = await supabase.from('challenges').select('*').eq('event_id', event.id)
        if (c) setChallenges(c)
      }
    }
    fetchInfo()
  }, [token])

  const compressImage = async (file: File): Promise<Blob> => {
    setIsCompressing(true)
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const maxDim = 1920
          let width = img.width
          let height = img.height

          // Conservation de l'aspect ratio
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            setIsCompressing(false)
            resolve(file)
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              setIsCompressing(false)
              if (blob) {
                resolve(blob)
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            0.75 // Qualité optimale pour le ratio poids/qualité en 3G/4G
          )
        }
        img.onerror = () => {
          setIsCompressing(false)
          resolve(file)
        }
      }
      reader.onerror = () => {
        setIsCompressing(false)
        resolve(file)
      }
    })
  }

  const handleUpload = async (navigate: any) => {
    if (pendingPhotos.length === 0 || !eventData) return
    
    setIsUploading(true)
    try {
      // Gestion offline-first : file d'attente locale s'il n'y a pas de réseau
      if (!navigator.onLine) {
        const queue: any[] = await localforage.getItem('teutchap_offline_queue') || []
        const newQueueItems = pendingPhotos.map(photo => ({
          id: photo.id || crypto.randomUUID(),
          token: token,
          eventId: eventData.id,
          blob: photo.blob,
          contributorName: guestPseudo,
          challengeId: selectedChallenge,
          compressedSize: photo.compressedSize || photo.blob.size,
          timestamp: new Date().toISOString()
        }))
        await localforage.setItem('teutchap_offline_queue', [...queue, ...newQueueItems])
        
        // Incrémentation optimiste locale pour l'engagement immédiat
        const savedCountKey = `teutchap_guests_count_${token}`
        const currentCount = parseInt(localStorage.getItem(savedCountKey) || '0', 10)
        localStorage.setItem(savedCountKey, (currentCount + 1).toString())

        setPendingPhotos([])
        navigate(`/e/${token}`)
        return
      }

      // Upload standard en ligne
      for (const photo of pendingPhotos) {
        const fileName = `${token}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`
        const { error: storageError } = await supabase.storage
          .from('events_photos')
          .upload(fileName, photo.blob)

        if (storageError) throw storageError

        const { error: dbError } = await supabase.from('photos').insert([{
          event_id: eventData.id,
          url_original: fileName,
          url_thumb: fileName,
          uploader_name: guestPseudo,
          challenge_id: selectedChallenge
        }])

        if (dbError) throw dbError
      }
      
      setPendingPhotos([])
      navigate(`/e/${token}`)
    } catch (err) {
      console.error("Erreur lors de l'upload:", err)
      alert("Une erreur est survenue lors de l'envoi de vos photos.")
    } finally {
      setIsUploading(false)
    }
  }

  return {
    pendingPhotos, setPendingPhotos, isCompressing, setIsCompressing, isUploading,
    eventData, challenges, selectedChallenge, setSelectedChallenge,
    localUploadsCount, guestPseudo,
    handleUpload, compressImage,
    shouldCompress, setShouldCompress
  }
}


