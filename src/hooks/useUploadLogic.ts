import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUploadLogic(token: string | undefined) {
  const [pendingPhotos, setPendingPhotos] = useState<any[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [eventData, setEventData] = useState<any>(null)
  const [challenges, setChallenges] = useState<any[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [localUploadsCount] = useState<number>(0)
  const [guestPseudo, setGuestPseudo] = useState<string>('Invité')

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
    // Dans une version réelle, on utiliserait canvas ou une lib pour compresser
    // Ici on garde le blob original pour la stabilité immédiate mais on pourrait ajouter du redimensionnement
    return file
  }

  const handleUpload = async (navigate: any) => {
    if (pendingPhotos.length === 0 || !eventData) return
    
    setIsUploading(true)
    try {
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
    handleUpload, compressImage
  }
}
