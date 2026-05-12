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

  return { 
    eventData, 
    loading, 
    error, 
    updateEvent, 
    setEventData,
    incrementGuestCount,
    deviceId: getDeviceId()
  }
}
