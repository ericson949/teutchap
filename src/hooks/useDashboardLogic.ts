import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useEvent } from './useEvent'
import { useChallenges } from './useChallenges'
import { usePhotos } from './usePhotos'
import { useReactions } from './useReactions'
import { useEventGuests } from './useEventGuests'
import { useAuth } from '../contexts/AuthContext'

export function useDashboardLogic(eventId: string | undefined) {
  const { user } = useAuth()
  const { eventData, loading: eventLoading, updateEvent } = useEvent(eventId)
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

  const handleAdminUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsAdminUploading(true)
    // Upload implementation...
    setIsAdminUploading(false)
  }

  const handleDeletePhoto = async (photo: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Supprimer cette photo ?")) return
    await supabase.from('photos').delete().eq('id', photo.id)
  }

  const totalReactions = photos.reduce((sum, p) => sum + (p.reaction_count || 0), 0)
  const engagement = photos.length > 0 ? Math.min(100, Math.round((totalReactions / (photos.length * 2)) * 100)) : 0

  return {
    user, eventData, eventLoading, challenges, photos, reactions, guests,
    activeTab, setActiveTab,
    showChallengeForm, setShowChallengeForm,
    isAdminUploading, setIsAdminUploading, adminFileInputRef,
    timeRemaining, totalReactions, engagement,
    updateEvent, addChallenge, deleteChallenge, addReaction,
    handleAdminUploadChange, handleDeletePhoto
  }
}
