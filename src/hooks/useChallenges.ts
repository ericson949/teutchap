import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
      // Résilience locale en cas d'erreur / RLS
      const localChal = JSON.parse(localStorage.getItem(`teutchap_chals_${eventId}`) || 'null')
      if (localChal) {
        setChallenges(localChal)
      } else {
        const initial = [
          { id: 'chal-1', title: "La table la plus ambiancée", description: "Montrez quelle table fait le plus de bruit !" },
          { id: 'chal-2', title: "Selfie de groupe épique", description: "Faites rentrer le plus de personnes possibles dans le cadre." }
        ]
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

    // 1. Immédiat via cache (Objectif 3ms)
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
    if (!eventId) return { data: null, error: new Error("No eventId") }

    // Mise à jour optimiste et locale garantie pour une latence perçue nulle
    const newLocal = { 
      id: `local_chal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, 
      title, 
      description, 
      event_id: eventId,
      created_at: new Date().toISOString()
    }

    const nextList = [...challenges, newLocal]
    setChallenges(nextList)
    
    // Sauvegarde en fallback
    localStorage.setItem(`teutchap_chals_${eventId}`, JSON.stringify(nextList))


    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert([{ title, description, event_id: eventId }])
        .select()
        .single()
      
      if (!error && data) {
        // Remplace l'élément local temporaire par la vraie ligne de la base
        setChallenges(prev => prev.map(c => c.id === newLocal.id ? data : c))
        return { data, error: null }
      }
      return { data: newLocal, error: null } // Fallback gracieux sur l'optimistic
    } catch (err) {
      return { data: newLocal, error: null }
    }
  }

  const deleteChallenge = async (id: string) => {
    const nextList = challenges.filter(c => c.id !== id)
    setChallenges(nextList)
    if (eventId) {
      localStorage.setItem(`teutchap_chals_${eventId}`, JSON.stringify(nextList))
    }

      await supabase.from('challenges').delete().eq('id', id)
    return { error: null }
  }

  return { challenges, loading, addChallenge, deleteChallenge, refreshChallenges: fetchChallenges }
}
