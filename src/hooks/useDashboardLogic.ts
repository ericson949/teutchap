import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useEvent } from './useEvent'
import { useChallenges } from './useChallenges'
import { usePhotos } from './usePhotos'
import { useReactions } from './useReactions'
import { useEventGuests } from './useEventGuests'
import { useAuth } from '../contexts/AuthContext'
import { compressImageUtil } from '../utils/image'

export function useDashboardLogic(eventId: string | undefined) {
  const { user } = useAuth()
  const { eventData, loading: eventLoading, isOwner, updateEvent, deleteEvent } = useEvent(eventId)
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<File[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [organizerCompress, setOrganizerCompress] = useState(false)



  const { challenges, addChallenge, deleteChallenge } = useChallenges(eventData?.id)
  const { photos } = usePhotos(eventData?.id)
  const { reactions, addReaction } = useReactions()
  const { guests } = useEventGuests(eventData?.id)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [isAdminUploading, setIsAdminUploading] = useState(false)
  const adminFileInputRef = useRef<HTMLInputElement>(null)

  // Timer logic
  const [timeRemaining, setTimeRemaining] = useState<any>({
    label: 'Calcul...', phase: 'before_start', days: 0, hours: 0, minutes: 0, seconds: 0
  })

  useEffect(() => {
    if (!eventData) return
    const updateTimer = () => {
      const now = Date.now()
      const start = new Date(eventData.event_date || eventData.created_at).getTime()
      const end = start + 24 * 3600 * 1000 
      
      let target = start
      let label = "Avant début"
      let phase = 'before_start'

      if (now < start) { target = start; label = "Avant début"; phase = 'before_start'; }
      else if (now < end) { target = end; label = "Temps restant"; phase = 'active'; }
      else { setTimeRemaining({ label: "Terminé", phase: 'finished' }); return; }

      const diff = Math.max(0, target - now)
      setTimeRemaining({
        label, phase,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }
    updateTimer()
    const itv = setInterval(updateTimer, 1000)
    return () => clearInterval(itv)
  }, [eventData])

  const handleAdminUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !eventData) return
    setSelectedFilesForUpload(Array.from(files))
    setShowUploadModal(true)
    if (adminFileInputRef.current) adminFileInputRef.current.value = ''
  }

  const confirmAdminUpload = async () => {
    if (selectedFilesForUpload.length === 0 || !eventData) return
    setIsAdminUploading(true)
    setShowUploadModal(false)
    
    try {
      for (const file of selectedFilesForUpload) {
        const blob = organizerCompress ? await compressImageUtil(file) : file
        const fileName = `${eventData.token}_admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`
        const { error: storageError } = await supabase.storage
          .from('events_photos')
          .upload(fileName, blob)

        if (storageError) throw storageError

        await supabase.from('photos').insert([{
          event_id: eventData.id,
          url_original: fileName,
          url_thumb: fileName,
          uploader_name: 'Organisateur'
        }])
      }
    } catch (err) {
      console.error("Erreur upload admin:", err)
      alert("Erreur lors de l'envoi des photos.")
    } finally {
      setIsAdminUploading(false)
      setSelectedFilesForUpload([])
    }
  }

  const cancelAdminUpload = () => {
    setSelectedFilesForUpload([])
    setShowUploadModal(false)
  }


  const handleDeletePhoto = async (photo: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Supprimer cette photo ?")) return
    await supabase.from('photos').delete().eq('id', photo.id)
  }

  const totalReactions = photos.reduce((sum, p) => sum + (p.reaction_count || 0), 0)
  const engagement = photos.length > 0 ? Math.min(100, Math.round((totalReactions / (photos.length * 2)) * 100)) : 0

  return {
    user, eventData, eventLoading, isOwner, challenges, photos, reactions, guests,
    activeTab, setActiveTab,
    showChallengeForm, setShowChallengeForm,
    isAdminUploading, setIsAdminUploading, adminFileInputRef,
    timeRemaining, totalReactions, engagement,
    updateEvent, deleteEvent, addChallenge, deleteChallenge, addReaction,
    handleAdminUploadChange, handleDeletePhoto,
    selectedFilesForUpload, showUploadModal, setShowUploadModal,
    organizerCompress, setOrganizerCompress, confirmAdminUpload, cancelAdminUpload
  }
}


