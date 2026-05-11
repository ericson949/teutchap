import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'mariage',
    eventDate: '',
    mode: 'public',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Generate a unique token for the event
    const token = Math.random().toString(36).substring(2, 10)

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            name: formData.name,
            event_type: formData.eventType,
            event_date: formData.eventDate,
            mode: formData.mode,
            token: token,
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating event:', error)
        alert("Erreur lors de la création de l'événement. Si vous n'avez pas configuré Supabase, cela est normal.")
        // Fallback for development without DB
        navigate(`/dashboard/mock-id-${token}`)
      } else if (data) {
        navigate(`/dashboard/${data.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Teutchap</h1>
          <p className="text-gray-500 mt-2">Créez votre événement en 30 secondes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'événement</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              placeholder="Ex: Mariage de Sophie & Marc"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              required
              type="date" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              value={formData.eventDate}
              onChange={e => setFormData({...formData, eventDate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              value={formData.eventType}
              onChange={e => setFormData({...formData, eventType: e.target.value})}
            >
              <option value="mariage">Mariage</option>
              <option value="anniversaire">Anniversaire</option>
              <option value="funeraille">Funérailles</option>
              <option value="diplome">Remise de diplôme</option>
              <option value="camp">Camp religieux</option>
              <option value="tontine">Tontine</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode de galerie</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              value={formData.mode}
              onChange={e => setFormData({...formData, mode: e.target.value})}
            >
              <option value="public">Public (les invités voient tout)</option>
              <option value="private">Privé (vous seul voyez les photos)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors mt-6 disabled:opacity-70"
          >
            {loading ? 'Création...' : "Créer l'événement"}
          </button>
        </form>
      </div>
    </div>
  )
}
