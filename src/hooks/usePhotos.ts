import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePhotos(eventId: string | undefined, options: { challengeId?: string | null, autoModeration?: boolean } = {}) {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = async () => {
    if (!eventId) return
    setLoading(true)
    
    let query = supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    
    if (options.autoModeration) {
      query = query.eq('is_flagged', false)
    }
    
    if (options.challengeId) {
      query = query.eq('challenge_id', options.challengeId)
    }

    const { data } = await query
    if (data) setPhotos(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPhotos()

    if (!eventId) return

    // Real-time subscription
    const channel = supabase
      .channel(`event_photos_${eventId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photos', filter: `event_id=eq.${eventId}` }, 
        () => {
          fetchPhotos() // Refresh list on any change (insert/update/delete)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, options.challengeId, options.autoModeration])

  return { photos, loading, refreshPhotos: fetchPhotos }
}
