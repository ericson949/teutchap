import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import localforage from 'localforage'
import { useEvent } from './useEvent'
import { useChallenges } from './useChallenges'
import { useAppPlans } from './useAppPlans'
import { usePhotos } from './usePhotos'
import { useReactions } from './useReactions'

export function useEventHomeLogic(token: string | undefined) {
  const { eventData, loading: eventLoading, joinEventAsGuest } = useEvent(token, true)
  const { challenges, addChallenge } = useChallenges(eventData?.id)
  const { currentConfig } = useAppPlans(eventData?.plan)
  
  const [selectedChallenge] = useState<string | null>(null)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [offlineQueueCount, setOfflineQueueCount] = useState(0)
  const [activeTab, setActiveTab] = useState('swipe')
  
  const [guestPseudo, setGuestPseudo] = useState('')
  const [inputPseudo, setInputPseudo] = useState('')
  const [hasSession, setHasSession] = useState(false)
  
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [newChalTitle, setNewChalTitle] = useState('')

  const [pwdInput, setPwdInput] = useState('')
  const [pwdError, setPwdError] = useState(false)
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline] = useState(navigator.onLine)

  const { photos, loading: photosLoading } = usePhotos(eventData?.id, { 
    challengeId: selectedChallenge, 
    autoModeration: eventData?.auto_moderation,
    token
  })
  const { reactions, userReactions, addReaction } = useReactions()

  // Onboarding & Password effects
  useEffect(() => {
    if (!token) return
    const params = new URLSearchParams(window.location.search)
    const urlPwdOk = params.get('pwd_ok')
    const verified = urlPwdOk === '1' || localStorage.getItem(`teutchap_pwd_verified_${token}`) === 'true'
    if (verified) {
      setIsPasswordVerified(true)
      localStorage.setItem(`teutchap_pwd_verified_${token}`, 'true')
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    const params = new URLSearchParams(window.location.search)
    const urlPseudo = params.get('p_sess')
    const saved = urlPseudo || localStorage.getItem(`teutchap_pseudo_${token}`)
    
    if (saved) {
      setGuestPseudo(saved)
      setHasSession(true)
      if (joinEventAsGuest && eventData?.id) {
        joinEventAsGuest(saved)
      }
    }
  }, [token, eventData?.id, joinEventAsGuest])

  // Sync Logic
  const handleSyncOffline = async () => {
    if (!eventData?.id || isSyncing || !navigator.onLine) return
    setIsSyncing(true)
    try {
      const queue: any[] = await localforage.getItem('teutchap_offline_queue') || []
      const tokenQueue = queue.filter(item => item.token === token)
      const remainingQueue = queue.filter(item => item.token !== token)

      if (tokenQueue.length === 0) return

      let successfulCount = 0
      const finalRemainingQueue = [...remainingQueue]

      for (const item of tokenQueue) {
        try {
          const fileName = `${token}_${Date.now()}_${Math.random().toString(36).substring(2,7)}.jpg`
          const { error: uploadError } = await supabase.storage
            .from('events_photos')
            .upload(fileName, item.blob)

          if (!uploadError) {
            await supabase.from('photos').insert([{
              event_id: eventData.id,
              url_original: fileName,
              url_thumb: fileName,
              uploader_name: item.contributorName || guestPseudo || 'Invité'
            }])
            successfulCount++
          } else {
            finalRemainingQueue.push(item)
          }
        } catch (e) {
          finalRemainingQueue.push(item)
        }
      }
      await localforage.setItem('teutchap_offline_queue', finalRemainingQueue)
      setOfflineQueueCount(finalRemainingQueue.filter(item => item.token === token).length)
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    eventData, eventLoading, challenges, currentConfig,
    activeTab, setActiveTab,
    guestPseudo, setGuestPseudo, inputPseudo, setInputPseudo, hasSession,
    showNotificationPrompt, setShowNotificationPrompt,
    offlineQueueCount, isSyncing, isOnline,
    photos, photosLoading,
    reactions, userReactions, addReaction,
    showChallengeForm, setShowChallengeForm,
    newChalTitle, setNewChalTitle,
    pwdInput, setPwdInput, pwdError, isPasswordVerified,
    handleSyncOffline,
    addChallenge,
    handleVerifyPassword: (pwd: string) => {
        if (pwd === eventData?.access_password) {
            setIsPasswordVerified(true)
            localStorage.setItem(`teutchap_pwd_verified_${token}`, 'true')
            return true
        }
        setPwdError(true)
        return false
    }
  }
}
