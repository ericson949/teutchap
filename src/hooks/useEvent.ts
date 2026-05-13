import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Génération ou récupération garantie d'un fingerprint persistant d'appareil
export const getDeviceId = () => {
  let id = localStorage.getItem('teutchap_device_id')
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    localStorage.setItem('teutchap_device_id', id)
  }
  return id
}

export function useEvent(idOrToken: string | undefined, isToken: boolean = false) {
  const [eventData, setEventData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!idOrToken) {
      setLoading(false)
      return
    }

    const fetchEvent = async () => {
      setLoading(true)
      try {
        const query = supabase.from('events').select('*')
        if (isToken) {
          query.eq('token', idOrToken)
        } else {
          query.eq('id', idOrToken)
        }

        const { data, error } = await query.single()
        if (error || !data) {
          throw error || new Error("Événement introuvable")
        }
        setEventData(data)
        setError(null)
      } catch (err: any) {
        console.error("Échec strict de récupération Supabase (RLS/Introuvable) :", err)
        setError(err || new Error("Événement introuvable en base de données"))
        setEventData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [idOrToken, isToken])

  // Propagation en temps réel garantie des compteurs (invités rejoints, photos) vers toutes les instances
  useEffect(() => {
    if (!eventData?.id) return

    const channel = supabase
      .channel(`event_updates_${eventData.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'events',
        filter: `id=eq.${eventData.id}`
      }, (payload) => {
        if (payload.new) {
          setEventData(payload.new)
          if (payload.new.token && payload.new.joined_guests_count !== undefined) {
            localStorage.setItem(`teutchap_guests_count_${payload.new.token}`, payload.new.joined_guests_count.toString())
          }
        }
      })
      .subscribe()

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
            if (userId && userId.includes('-')) {
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
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
        if (!anonError && anonData?.user?.id) {
          userId = anonData.user.id
        } else {
          userId = getDeviceId()
        }
      }

      if (userId && userId.includes('-')) {
        const shadowEmail = `anon-${userId}@teutchap.shadow`
        await supabase.from('users').upsert([
          {
            id: userId,
            email: shadowEmail,
            name: pseudo,
            plan: 'free'
          }
        ], { onConflict: 'id' })

        await supabase.from('event_invite_user').upsert([
          {
            event_id: eventData.id,
            user_id: userId,
            role: 'guest',
            last_active_at: new Date().toISOString()
          }
        ], { onConflict: 'event_id,user_id' })
      }

      const currentCount = eventData.joined_guests_count || 0
      await updateEvent({ joined_guests_count: currentCount + 1 })
      return true
    } catch (err) {
      console.error("Erreur d'enregistrement invité :", err)
      const currentCount = eventData.joined_guests_count || 0
      await updateEvent({ joined_guests_count: currentCount + 1 })
      return true
    }
  }

  return { 
    eventData, 
    loading, 
    error, 
    updateEvent, 
    setEventData,
    incrementGuestCount,
    joinEventAsGuest,
    deviceId: getDeviceId()
  }
}

