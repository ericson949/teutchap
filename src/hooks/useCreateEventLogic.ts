import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { getDeviceId } from './useEvent'

export function useCreateEventLogic() {
  const [loading, setLoading] = useState(false)
  const [creationError, setCreationError] = useState<string | null>(null)
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')
  const [joinInput, setJoinInput] = useState('')
  const [isSpamVerified, setIsSpamVerified] = useState(false)
  const [turnstileState, setTurnstileState] = useState<'idle' | 'verifying' | 'success'>('idle')

  const [formData, setFormData] = useState({
    name: '',
    eventType: 'mariage',
    expectedGuests: '50',
    eventDateTime: '',
    endDateTime: ''
  })

  useEffect(() => {
    const t = setTimeout(() => {
      setTurnstileState('success')
      setIsSpamVerified(true)
    }, 500)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (navigate: any) => {
    if (!isSpamVerified) {
      setCreationError("Veuillez valider le contrôle de sécurité.")
      return
    }

    if (!formData.name || !formData.eventDateTime) {
      setCreationError("Veuillez remplir tous les champs obligatoires.")
      return
    }

    setLoading(true)
    setCreationError(null)
    
    // Génération de l'ID et du token côté client
    const eventId = uuidv4()
    const token = Math.random().toString(36).substring(2, 10).toLowerCase()
    
    try {
        const { error } = await supabase
          .from('events')
          .insert({
            id: eventId,
            name: formData.name,
            event_type: formData.eventType,
            event_date: formData.eventDateTime.split('T')[0],
            token: token,
            status: 'active',
            plan: 'free',
            creator_device_id: getDeviceId()
          })

        if (error) throw error

        navigate(`/overview/${eventId}`)
    } catch (err: any) {
        console.error("Erreur lors de la création de l'événement:", err)
        setCreationError(err.message || "Erreur lors de la création.")
    } finally {
        setLoading(false)
    }
  }

  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  const handleJoin = async (navigate: any) => {
    if (!joinInput.trim()) return
    
    setJoinLoading(true)
    setJoinError(null)

    try {
      const { data, error } = await supabase
        .from('events')
        .select('token')
        .eq('token', joinInput.trim().toLowerCase())
        .single()

      if (error || !data) {
        setJoinError("Code album invalide ou inexistant.")
      } else {
        navigate(`/e/${data.token}`)
      }
    } catch (err) {
      setJoinError("Une erreur est survenue lors de la recherche.")
    } finally {
      setJoinLoading(false)
    }
  }

  return {
    loading, joinLoading, creationError, isMultiDay, setIsMultiDay,
    activeTab, setActiveTab, joinInput, setJoinInput, joinError,
    turnstileState, formData, setFormData, handleSubmit, handleJoin
  }
}
