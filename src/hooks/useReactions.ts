import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useReactions() {
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({})
  const [userReactions, setUserReactions] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('teutchap_user_reactions') || '{}')
    } catch (e) {
      return {}
    }
  })

  const fetchReactions = async () => {
    const { data } = await supabase.from('reactions').select('*')
    if (data) {
      const reactionMap: Record<string, Record<string, number>> = {}
      const fingerprint = localStorage.getItem('teutchap_fp')
      const localMap: Record<string, string> = JSON.parse(localStorage.getItem('teutchap_user_reactions') || '{}')
      let localMapUpdated = false

      data.forEach(r => {
        if (!reactionMap[r.photo_id]) reactionMap[r.photo_id] = {}
        reactionMap[r.photo_id][r.emoji] = (reactionMap[r.photo_id][r.emoji] || 0) + 1

        if (fingerprint && r.device_fingerprint === fingerprint) {
          if (localMap[r.photo_id] !== r.emoji) {
            localMap[r.photo_id] = r.emoji
            localMapUpdated = true
          }
        }
      })

      setReactions(reactionMap)
      if (localMapUpdated) {
        localStorage.setItem('teutchap_user_reactions', JSON.stringify(localMap))
        setUserReactions(localMap)
      }
    }
  }

  useEffect(() => {
    // Initialiser le fingerprint si nécessaire
    if (!localStorage.getItem('teutchap_fp')) {
      localStorage.setItem('teutchap_fp', Math.random().toString(36).substring(7))
    }

    fetchReactions()

    const interval = setInterval(() => {
      fetchReactions()
    }, 3000)

    const channel = supabase
      .channel('public:reactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => {
        fetchReactions()
      })
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  const addReaction = async (photoId: string, emoji: string) => {
    const fingerprint = localStorage.getItem('teutchap_fp') || Math.random().toString(36).substring(7)
    localStorage.setItem('teutchap_fp', fingerprint)

    const currentMap: Record<string, string> = JSON.parse(localStorage.getItem('teutchap_user_reactions') || '{}')
    const currentEmoji = currentMap[photoId]

    if (currentEmoji === emoji) {
      // 1. Désactiver la réaction si on clique sur la même
      delete currentMap[photoId]
      localStorage.setItem('teutchap_user_reactions', JSON.stringify(currentMap))
      setUserReactions({ ...currentMap })

      // Mise à jour optimiste des totaux
      setReactions(prev => {
        const photoReactions = { ...(prev[photoId] || {}) }
        if (photoReactions[emoji] > 0) {
          photoReactions[emoji]--
        }
        return { ...prev, [photoId]: photoReactions }
      })

      // Exécution asynchrone côté backend
      await supabase.from('reactions')
        .delete()
        .eq('photo_id', photoId)
        .eq('device_fingerprint', fingerprint)
    } else {
      // 2. Basculer ou activer une nouvelle réaction exclusive
      const oldEmoji = currentEmoji
      currentMap[photoId] = emoji
      localStorage.setItem('teutchap_user_reactions', JSON.stringify(currentMap))
      setUserReactions({ ...currentMap })

      // Mise à jour optimiste des totaux
      setReactions(prev => {
        const photoReactions = { ...(prev[photoId] || {}) }
        if (oldEmoji && photoReactions[oldEmoji] > 0) {
          photoReactions[oldEmoji]--
        }
        photoReactions[emoji] = (photoReactions[emoji] || 0) + 1
        return { ...prev, [photoId]: photoReactions }
      })

      // Garantir l'unicité dans le backend en supprimant d'abord les anciennes réactions pour cette photo/appareil
      await supabase.from('reactions')
        .delete()
        .eq('photo_id', photoId)
        .eq('device_fingerprint', fingerprint)

      // Puis insérer la nouvelle
      await supabase.from('reactions').insert([
        { photo_id: photoId, emoji, device_fingerprint: fingerprint }
      ])
    }

    return { error: null }
  }

  return { reactions, userReactions, addReaction }
}
