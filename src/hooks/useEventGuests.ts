import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

export interface EventGuest {
  user_id: string
  pseudo: string
  role: string
  joined_at: string
  last_active_at: string
  isOnline: boolean
}

export function useEventGuests(eventId: string | undefined) {
  const [guests, setGuests] = useState<EventGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({})

  // 1. Récupération de la liste formelle depuis la base de données relationnelle
  const fetchGuests = async () => {
    if (!eventId) return

    try {
      const { data, error } = await supabase
        .from('event_invite_user')
        .select(`
          user_id,
          role,
          joined_at,
          last_active_at,
          users (
            name
          )
        `)
        .eq('event_id', eventId)

      if (error) throw error

      if (data) {
        const formattedGuests: EventGuest[] = data.map((item: any) => ({
          user_id: item.user_id,
          pseudo: item.users?.name || 'Invité',
          role: item.role || 'guest',
          joined_at: item.joined_at,
          last_active_at: item.last_active_at,
          isOnline: false
        }))
        setGuests(formattedGuests)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des invités :", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuests()

    // Écoute des nouveaux inscrits en temps réel via Postgres Changes
    if (!eventId) return
    const dbChannel = supabase
      .channel(`db_guests_${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_invite_user',
        filter: `event_id=eq.${eventId}`
      }, () => {
        // Recharger la liste pour avoir les jointures à jour
        fetchGuests()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(dbChannel)
    }
  }, [eventId])

  // 2. Écoute de Supabase Presence pour déterminer qui est actif (connecté internet) en ce moment
  useEffect(() => {
    if (!eventId) return

    const presenceChannel = supabase.channel(`presence_${eventId}`)

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState()
        const currentOnline: Record<string, any> = {}
        
        Object.keys(newState).forEach(key => {
          const presences: any[] = newState[key] || []
          if (presences.length > 0) {
            // Prendre la présence la plus récente pour cet utilisateur
            currentOnline[key] = presences[0]
          }
        })

        setOnlineUsers(currentOnline)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(presenceChannel)
    }
  }, [eventId])

  // 3. Fusionner la liste DB avec l'état Presence en temps réel
  // Seuls les invités formellement inscrits en base de données sont listés pour l'attribution de rôles
  const mergedGuests: EventGuest[] = useMemo(() => {
    return guests.map(g => ({
      ...g,
      isOnline: !!onlineUsers[g.user_id]
    }))
  }, [guests, onlineUsers])

  // Mettre à jour le rôle (ex: promotion co-admin)
  const updateGuestRole = async (userId: string, newRole: string) => {
    if (!eventId) return false
    // Optimistic update
    setGuests(prev => prev.map(g => g.user_id === userId ? { ...g, role: newRole } : g))

    try {
      const { error } = await supabase
        .from('event_invite_user')
        .update({ role: newRole })
        .eq('event_id', eventId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (err) {
      console.error("Erreur lors de la mise à jour du rôle :", err)
      // Rollback on load
      fetchGuests()
      return false
    }
  }

  return {
    guests: mergedGuests,
    loading,
    refetch: fetchGuests,
    updateGuestRole
  }
}
