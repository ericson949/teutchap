import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useChallenges(eventId: string | undefined) {
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChallenges = async () => {
    if (!eventId) return
    setLoading(true)
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('event_id', eventId)
    if (data) setChallenges(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchChallenges()
  }, [eventId])

  const addChallenge = async (title: string, description: string) => {
    if (!eventId) return
    const { data, error } = await supabase
      .from('challenges')
      .insert([{ title, description, event_id: eventId }])
      .select()
      .single()
    
    if (!error && data) {
      setChallenges(prev => [...prev, data])
    }
    return { data, error }
  }

  const deleteChallenge = async (id: string) => {
    const { error } = await supabase.from('challenges').delete().eq('id', id)
    if (!error) {
      setChallenges(prev => prev.filter(c => c.id !== id))
    }
    return { error }
  }

  return { challenges, loading, addChallenge, deleteChallenge, refreshChallenges: fetchChallenges }
}
