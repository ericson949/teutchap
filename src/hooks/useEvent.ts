import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useEvent(idOrToken: string | undefined, isToken: boolean = false) {
  const [eventData, setEventData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!idOrToken) return

    const fetchEvent = async () => {
      setLoading(true)
      try {
        const query = supabase.from('events').select('*')
        if (isToken) {
          query.eq('token', idOrToken)
        } else {
          // Handle mock IDs for dev
          if (idOrToken.startsWith('mock-id-')) {
            setEventData({
              id: idOrToken,
              name: "Événement Démo",
              token: idOrToken.replace('mock-id-', ''),
              event_date: new Date().toISOString(),
              plan_type: 'free'
            })
            setLoading(false)
            return
          }
          query.eq('id', idOrToken)
        }

        const { data, error } = await query.single()
        if (error) throw error
        setEventData(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [idOrToken, isToken])

  const updateEvent = async (updates: any) => {
    if (!eventData?.id) return
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventData.id)
      .select()
      .single()
    
    if (!error && data) {
      setEventData(data)
    }
    return { data, error }
  }

  return { eventData, loading, error, updateEvent, setEventData }
}
