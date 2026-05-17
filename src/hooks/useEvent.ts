import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Génération ou récupération garantie d'un fingerprint persistant d'appareil au format strict UUIDv4
export const getDeviceId = () => {
  let id = localStorage.getItem('teutchap_device_uuid_v4')
  if (!id) {
    try {
      id = crypto.randomUUID()
    } catch (e) {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    localStorage.setItem('teutchap_device_uuid_v4', id)
  }
  return id
}

let sessionEventCache: Record<string, any> = {}

export function useEvent(idOrToken: string | undefined, isToken: boolean = false) {
  const [eventData, setEventData] = useState<any>(idOrToken ? sessionEventCache[idOrToken] : null)
  const [loading, setLoading] = useState(!idOrToken || !sessionEventCache[idOrToken])
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!idOrToken) {
      setLoading(false)
      return
    }

    // 1. Tenter de charger le cache immédiatement pour l'interactivité (Offline First)
    const cached = localStorage.getItem(`teutchap_event_cache_${idOrToken}`)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setEventData(parsed)
        if (idOrToken) sessionEventCache[idOrToken] = parsed
        setLoading(false) // On affiche le cache tout de suite
      } catch (e) {}
    }

    const fetchEvent = async (isBackgroundCheck = false) => {
      // On ne met loading=true que si on n'a rien en cache
      if (!isBackgroundCheck && !localStorage.getItem(`teutchap_event_cache_${idOrToken}`)) {
        setLoading(true)
      }
      
      try {
        let query = supabase.from('events').select('*')
        if (isToken) {
          query = query.eq('token', idOrToken)
        } else {
          query = query.eq('id', idOrToken)
        }

        const { data, error } = await query.single()
        
        if (error || !data) {
          if (!isBackgroundCheck) {
            setError(error || new Error("Event not found"))
            setEventData(null)
          }
          return
        }

        // Vérification de sécurité après récupération pour gérer les anciens événements (NULL)
        if (!isToken) {
          const deviceId = getDeviceId()
          const { data: { user } } = await supabase.auth.getUser()

          const isUserOwner = user && data.user_id === user.id
          const isDeviceOwner = data.creator_device_id === deviceId
          
          // Si l'événement n'a pas encore de créateur (ancien event), on l'assigne à cet appareil
          if (!data.creator_device_id && !data.user_id) {
             await supabase.from('events').update({ creator_device_id: deviceId }).eq('id', data.id)
             data.creator_device_id = deviceId
          } else if (!isUserOwner && !isDeviceOwner) {
            if (!isBackgroundCheck) {
              setEventData(null)
              setError(new Error("Access Denied"))
            }
            return
          }
        }
        
        setEventData(data)
        setError(null)
        
        // Mise à jour des caches (Session + LocalStorage)
        if (idOrToken) sessionEventCache[idOrToken] = data
        if (data.id) sessionEventCache[data.id] = data
        if (data.token) sessionEventCache[data.token] = data

        localStorage.setItem(`teutchap_event_cache_${idOrToken}`, JSON.stringify(data))
        if (data.token) localStorage.setItem(`teutchap_event_cache_${data.token}`, JSON.stringify(data))
        if (data.id) localStorage.setItem(`teutchap_event_cache_${data.id}`, JSON.stringify(data))
      } catch (err: any) {
        console.error("Échec de récupération Supabase :", err)

        const isNotFoundError = err?.code === 'PGRST116' || err?.message?.toLowerCase().includes('0 rows')
        if (navigator.onLine && isNotFoundError) {
          localStorage.removeItem(`teutchap_event_cache_${idOrToken}`)
          setError(new Error("Cet album n'existe plus."))
          setEventData(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchEvent(!!cached) // Background check si on a déjà chargé le cache
  }, [idOrToken, isToken])

  // Communication 100% basée sur WebSocket (priorisation Realtime absolue sans polling)
  useEffect(() => {
    if (!eventData?.id) return

    const channel = supabase
      .channel(`event_updates_${eventData.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: `id=eq.${eventData.id}`
      }, (payload) => {
        // Détection instantanée via WebSocket de la suppression de l'album
        if (payload.eventType === 'DELETE') {
          console.warn("🔴 Signal WebSocket reçu : l'événement a été supprimé. Déconnexion immédiate...")
          localStorage.removeItem(`teutchap_event_cache_${eventData.id}`)
          if (eventData.token) {
            localStorage.removeItem(`teutchap_event_cache_${eventData.token}`)
            localStorage.removeItem(`teutchap_pseudo_${eventData.token}`)
            localStorage.removeItem(`teutchap_pwd_verified_${eventData.token}`)
          }
          setError(new Error("Cet album n'existe plus ou a été supprimé."))
          setEventData(null)
          return
        }

        if (payload.new && payload.eventType === 'UPDATE') {
          setEventData(payload.new)
          if (payload.new.token && payload.new.joined_guests_count !== undefined) {
            localStorage.setItem(`teutchap_guests_count_${payload.new.token}`, payload.new.joined_guests_count.toString())
          }
        }
      })
      .subscribe(async (status) => {
        // En cas de reconnexion réussie du WebSocket (ex: après un redémarrage des conteneurs lors d'un reset BD)
        if (status === 'SUBSCRIBED' && navigator.onLine) {
          try {
            const { error } = await supabase.from('events').select('id').eq('id', eventData.id).single()
            if (error && (error.code === 'PGRST116' || error.message?.toLowerCase().includes('0 rows'))) {
              console.warn("🔴 Vérification post-reconnexion WebSocket : l'événement est introuvable. Déconnexion immédiate...")
              localStorage.removeItem(`teutchap_event_cache_${eventData.id}`)
              if (eventData.token) {
                localStorage.removeItem(`teutchap_event_cache_${eventData.token}`)
                localStorage.removeItem(`teutchap_pseudo_${eventData.token}`)
                localStorage.removeItem(`teutchap_pwd_verified_${eventData.token}`)
              }
              setError(new Error("Cet album n'existe plus ou a été supprimé."))
              setEventData(null)
            }
          } catch (e) {}
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventData?.id])

  // Suivi en temps réel de la Présence (Activité connectée)
  useEffect(() => {
    if (!eventData?.id) return

    let channel: any = null

    const setupPresence = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser()
        let userId = authData?.user?.id
        if (!userId) {
          const { data: anonData } = await supabase.auth.signInAnonymously()
          userId = anonData?.user?.id || getDeviceId()
        }

        const savedPseudo = eventData.token ? localStorage.getItem(`teutchap_pseudo_${eventData.token}`) : null
        const pseudo = savedPseudo || 'Invité'

        channel = supabase.channel(`presence_${eventData.id}`, {
          config: { presence: { key: userId } }
        })

        channel.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: userId,
              pseudo: pseudo,
              online_at: new Date().toISOString()
            })

            // Mise à jour silencieuse de last_active_at en base
            if (userId) {
              supabase
                .from('event_invite_user')
                .update({ last_active_at: new Date().toISOString() })
                .eq('event_id', eventData.id)
                .eq('user_id', userId)
                .then()
            }
          }
        })
      } catch (err) {
        console.error("Erreur d'initialisation de Presence :", err)
      }
    }

    setupPresence()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [eventData?.id, eventData?.token])

  const updateEvent = async (updates: any) => {
    if (!eventData?.id) return { data: null, error: new Error("Aucune donnée d'événement") }

    // Mise à jour optimiste locale
    const nextData = { ...eventData, ...updates }
    setEventData(nextData)

    // Persistance dans le cache local de l'événement en cours
    if (updates.joined_guests_count !== undefined) {
      localStorage.setItem(`teutchap_guests_count_${eventData.token}`, updates.joined_guests_count.toString())
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventData.id)
        .select()
        .single()
      
      if (!error && data) {
        setEventData(data)
        return { data, error: null }
      }
      return { data: nextData, error }
    } catch (err) {
      return { data: nextData, error: err }
    }
  }

  const deleteEvent = async () => {
    if (!eventData?.id) return { error: new Error("Aucune donnée d'événement") }
    
    try {
      // 1. Récupération de tous les fichiers de l'album pour les supprimer du stockage cloud
      const { data: photosList } = await supabase
        .from('photos')
        .select('url_original, url_thumb')
        .eq('event_id', eventData.id)

      if (photosList && photosList.length > 0) {
        const filesToRemove: string[] = []
        photosList.forEach(p => {
          if (p.url_original) filesToRemove.push(p.url_original)
          if (p.url_thumb && p.url_thumb !== p.url_original) filesToRemove.push(p.url_thumb)
        })

        if (filesToRemove.length > 0) {
          await supabase.storage.from('events_photos').remove(filesToRemove)
        }
      }

      // 2. Suppression de la ligne événement (cascade SQL sur les tables photos, challenges, reactions)
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventData.id)

      if (error) throw error

      // 3. Purge du cache local associé
      localStorage.removeItem(`teutchap_pwd_verified_${eventData.token}`)
      localStorage.removeItem(`teutchap_pseudo_${eventData.token}`)
      localStorage.removeItem(`teutchap_guests_count_${eventData.token}`)
      localStorage.removeItem(`teutchap_photos_cache_${eventData.id}`)
      
      return { success: true, error: null }
    } catch (err) {
      console.error("Erreur lors de la suppression de l'événement:", err)
      return { success: false, error: err }
    }
  }


  const incrementGuestCount = async () => {
    if (!eventData) return false
    const currentCount = eventData.joined_guests_count || 0
    await updateEvent({ joined_guests_count: currentCount + 1 })
    return true
  }

  // Enregistrement relationnel complet d'un invité (users + event_invite_user)
  const joinEventAsGuest = async (pseudo: string) => {
    if (!eventData?.id) return false

    try {
      const { data: authData } = await supabase.auth.getUser()
      let userId = authData?.user?.id

      if (!userId) {
        try {
          const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
          if (!anonError && anonData?.user?.id) {
            userId = anonData.user.id
          }
        } catch (anonEx) {
          // Mode anonyme potentiellement inactif sur l'instance Supabase
        }
        if (!userId) {
          userId = getDeviceId()
        }
      }

      if (userId) {
        // Vérification préalable pour savoir si l'utilisateur est déjà membre de l'événement
        const { data: existingLink } = await supabase
          .from('event_invite_user')
          .select('id, role')
          .eq('event_id', eventData.id)
          .eq('user_id', userId)
          .maybeSingle()

        const shadowEmail = `anon-${userId}@teutchap.shadow`
        
        try {
          await supabase.from('users').upsert([
            {
              id: userId,
              email: shadowEmail,
              name: pseudo,
              plan: 'free'
            }
          ], { onConflict: 'id' })
        } catch (upsertUserErr) {
          console.warn("Avertissement mineur insertion users:", upsertUserErr)
        }

        if (existingLink) {
          // Déjà membre : on actualise uniquement son timestamp d'activité pour préserver son rôle (ex: co_admin)
          try {
            await supabase.from('event_invite_user')
              .update({ last_active_at: new Date().toISOString() })
              .eq('event_id', eventData.id)
              .eq('user_id', userId)
          } catch (updateLinkErr) {
            console.warn("Avertissement mise à jour activité invité:", updateLinkErr)
          }
        } else {
          // Nouveau membre : on crée le lien et on incrémente formellement le compteur
          try {
            await supabase.from('event_invite_user').upsert([
              {
                event_id: eventData.id,
                user_id: userId,
                role: 'guest',
                last_active_at: new Date().toISOString()
              }
            ], { onConflict: 'event_id,user_id' })
          } catch (insertLinkErr) {
            console.warn("Avertissement création lien invité:", insertLinkErr)
          }

          try {
            const currentCount = eventData.joined_guests_count || 0
            await updateEvent({ joined_guests_count: currentCount + 1 })
          } catch (updateCountErr) {
            console.warn("Avertissement incrémentation compteur:", updateCountErr)
          }
        }
      }

      return true
    } catch (err) {
      console.error("Erreur d'enregistrement invité :", err)
      return false
    }
  }

  const isOwner = eventData?.creator_device_id === getDeviceId()

  return { 
    eventData, 
    loading, 
    error, 
    isOwner,
    updateEvent, 
    deleteEvent,
    setEventData,
    incrementGuestCount,
    joinEventAsGuest,
    deviceId: getDeviceId()
  }
}


