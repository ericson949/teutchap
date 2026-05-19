import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getChallengeTemplates } from '../lib/gamification'

export function useChallenges(eventId: string | undefined) {
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChallenges = async () => {
    if (!eventId) {
      setLoading(false)
      return
    }
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('event_id', eventId)

      if (error) throw error
      if (data) {
        setChallenges(data)
        localStorage.setItem(`teutchap_chals_${eventId}`, JSON.stringify(data))
      }
    } catch (err) {
      const localChal = JSON.parse(localStorage.getItem(`teutchap_chals_${eventId}`) || 'null')
      if (localChal) {
        setChallenges(localChal)
      } else {
        const initial = getChallengeTemplates().slice(0, 2).map((template, index) => ({
          id: `chal-${index + 1}`,
          title: template.title,
          description: template.description
        }))
        setChallenges(initial)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }

    const cached = localStorage.getItem(`teutchap_chals_${eventId}`)
    if (cached) {
      try {
        setChallenges(JSON.parse(cached))
        setLoading(false)
      } catch (e) {}
    }

    fetchChallenges()
  }, [eventId])

  const addChallenge = async (title: string, description: string) => {
    if (!eventId) return { data: null, error: new Error('No eventId') }

    const newLocal = {
      id: `local_chal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      event_id: eventId,
      created_at: new Date().toISOString()
    }

    const nextList = [...challenges, newLocal]
    setChallenges(nextList)
    localStorage.setItem(`teutchap_chals_${eventId}`, JSON.stringify(nextList))

    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert([{ title, description, event_id: eventId }])
        .select()
        .single()

      if (!error && data) {
        setChallenges((prev) => {
          const syncedList = prev.map((challenge) => challenge.id === newLocal.id ? data : challenge)
          localStorage.setItem(`teutchap_chals_${eventId}`, JSON.stringify(syncedList))
          return syncedList
        })
        return { data, error: null }
      }
      return { data: newLocal, error: null }
    } catch (err) {
      return { data: newLocal, error: null }
    }
  }

  const deleteChallenge = async (id: string) => {
    const nextList = challenges.filter((challenge) => challenge.id !== id)
    setChallenges(nextList)
    if (eventId) {
      localStorage.setItem(`teutchap_chals_${eventId}`, JSON.stringify(nextList))
    }

    await supabase.from('challenges').delete().eq('id', id)
    return { error: null }
  }

  return { challenges, loading, addChallenge, deleteChallenge, refreshChallenges: fetchChallenges }
}
