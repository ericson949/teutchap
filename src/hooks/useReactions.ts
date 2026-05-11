import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useReactions() {
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({})

  const fetchReactions = async () => {
    const { data } = await supabase.from('reactions').select('*')
    if (data) {
      const reactionMap: Record<string, Record<string, number>> = {}
      data.forEach(r => {
        if (!reactionMap[r.photo_id]) reactionMap[r.photo_id] = {}
        reactionMap[r.photo_id][r.emoji] = (reactionMap[r.photo_id][r.emoji] || 0) + 1
      })
      setReactions(reactionMap)
    }
  }

  useEffect(() => {
    fetchReactions()

    const channel = supabase
      .channel('public:reactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => {
        fetchReactions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const addReaction = async (photoId: string, emoji: string) => {
    const fingerprint = localStorage.getItem('teutchap_fp') || Math.random().toString(36).substring(7)
    localStorage.setItem('teutchap_fp', fingerprint)

    const { error } = await supabase.from('reactions').upsert([
      { photo_id: photoId, emoji, device_fingerprint: fingerprint }
    ])
    return { error }
  }

  return { reactions, addReaction }
}
