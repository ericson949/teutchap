import { useState, useEffect } from 'react'
import localforage from 'localforage'
import { supabase } from '../lib/supabase'

export function usePhotos(eventId: string | undefined, options: { challengeId?: string | null, autoModeration?: boolean, token?: string } = {}) {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = async () => {
    if (!eventId && !options.token) return
    setLoading(true)

    // 1. Lire d'abord les photos en attente hors-ligne pour cet événement
    let offlineVirtualPhotos: any[] = []
    try {
      const queue: any[] = await localforage.getItem('teutchap_offline_queue') || []
      const eventQueue = queue.filter(item => {
        if (eventId && item.eventId === eventId) return true
        if (options.token && item.token === options.token) return true
        return false
      })
      offlineVirtualPhotos = eventQueue.map(item => {
        let objectUrl = item.previewUrl || ''
        if (!objectUrl && item.blob) {
          try { objectUrl = URL.createObjectURL(item.blob) } catch(e){}
        }
        return {
          id: item.id || crypto.randomUUID(),
          event_id: eventId || item.eventId || 'local-event',
          url_original: objectUrl,
          url_thumb: objectUrl,
          file_size_bytes: item.compressedSize || 0,
          challenge_id: item.challengeId || null,
          is_moderated: false,
          uploader_name: item.contributorName || 'Invité',
          contributor_name: item.contributorName || 'Invité',
          created_at: item.timestamp || new Date().toISOString(),
          is_offline_pending: true
        }
      })
      if (options.challengeId) {
        offlineVirtualPhotos = offlineVirtualPhotos.filter(p => p.challenge_id === options.challengeId)
      }
    } catch(e) {
      console.error("Erreur lecture offline queue photos:", e)
    }
    
    let remotePhotos: any[] = []
    let fetchSuccess = false

    if (eventId && navigator.onLine) {
      try {
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

        const { data, error } = await query
        if (!error && data) {
          remotePhotos = data.map((p: any) => ({
            ...p,
            contributor_name: p.uploader_name || p.contributor_name
          }))
          fetchSuccess = true
          const cacheKey = options.challengeId ? `teutchap_photos_cache_${eventId}_c_${options.challengeId}` : `teutchap_photos_cache_${eventId}`
          localStorage.setItem(cacheKey, JSON.stringify(remotePhotos))
        }
      } catch (err) {
        console.error("Erreur réseau silencieuse fetchPhotos:", err)
      }
    }

    if (!fetchSuccess && eventId) {
      // Tenter de lire le cache local
      const cacheKey = options.challengeId ? `teutchap_photos_cache_${eventId}_c_${options.challengeId}` : `teutchap_photos_cache_${eventId}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try { remotePhotos = JSON.parse(cached) } catch(e){}
      }
    }

    // Récupérer la file locale des suppressions en attente et l'historique permanent des suppressions
    const pendingDeletedIds: string[] = JSON.parse(localStorage.getItem('teutchap_offline_delete_queue') || '[]')
    const permanentDeletedIds: string[] = JSON.parse(localStorage.getItem('teutchap_deleted_history') || '[]')
    const allDeletedIds = [...pendingDeletedIds, ...permanentDeletedIds]

    const allPhotos = [...offlineVirtualPhotos, ...remotePhotos].filter(p => !allDeletedIds.includes(p.id))

    setPhotos(allPhotos)
    setLoading(false)
  }

  useEffect(() => {
    if (!eventId && !options.token) {
      setLoading(false)
      return
    }

    // 1. Charger immédiatement depuis le cache pour l'instantanéité (3ms goal)
    const cacheKey = options.challengeId ? `teutchap_photos_cache_${eventId}_c_${options.challengeId}` : `teutchap_photos_cache_${eventId}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setPhotos(parsed)
        setLoading(false)
      } catch (e) {}
    }

    fetchPhotos()

    // Real-time subscription pour les mises à jour sans polling
    const channel = supabase
      .channel(`event_photos_${eventId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photos', filter: `event_id=eq.${eventId}` }, 
        () => fetchPhotos()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, options.challengeId, options.autoModeration, options.token])

  return { photos, loading, refreshPhotos: fetchPhotos }
}
