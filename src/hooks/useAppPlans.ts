import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface AppPlanConfig {
  name: string
  max_guests: number
  max_photos: number
  max_photos_per_user: number
  allow_challenges: boolean
}

// Configuration par défaut basée sur les variables d'environnement (Fallback résilience)
const DEFAULT_PLANS: Record<string, AppPlanConfig> = {
  free: {
    name: 'free',
    max_guests: 15,
    max_photos: parseInt(import.meta.env.VITE_MAX_PHOTOS_FREE || '100', 10),
    max_photos_per_user: parseInt(import.meta.env.VITE_USER_MAX_PHOTOS_FREE || '10', 10),
    allow_challenges: false
  },
  premium: {
    name: 'premium',
    max_guests: 100,
    max_photos: parseInt(import.meta.env.VITE_MAX_PHOTOS_PREMIUM || '1000', 10),
    max_photos_per_user: parseInt(import.meta.env.VITE_USER_MAX_PHOTOS_PREMIUM || '30', 10),
    allow_challenges: true
  },
  vip: {
    name: 'vip',
    max_guests: 500,
    max_photos: parseInt(import.meta.env.VITE_MAX_PHOTOS_VIP || '3000', 10),
    max_photos_per_user: parseInt(import.meta.env.VITE_USER_MAX_PHOTOS_VIP || '100', 10),
    allow_challenges: true
  }
}

export function useAppPlans(planName: string = 'free') {
  const [plans, setPlans] = useState<Record<string, AppPlanConfig>>(() => {
    // 1. Charger instantanément depuis le cache local pour un blocage/calcul fluide hors-ligne
    const cached = localStorage.getItem('teutchap_app_plans_cache')
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (e) {
        // Parsing silencieux en cas de corruption
      }
    }
    // 2. Fallback direct aux valeurs par défaut de l'environnement
    return DEFAULT_PLANS
  })

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase.from('app_plans').select('*')
        if (!error && data && data.length > 0) {
          const plansMap: Record<string, AppPlanConfig> = {}
          data.forEach((p: any) => {
            plansMap[p.name] = {
              name: p.name,
              max_guests: p.max_guests,
              max_photos: p.max_photos,
              max_photos_per_user: p.max_photos_per_user,
              allow_challenges: p.allow_challenges
            }
          })
          setPlans(plansMap)
          // Persistance de la configuration serveur pour le mode déconnecté
          localStorage.setItem('teutchap_app_plans_cache', JSON.stringify(plansMap))
        }
      } catch (err) {
        console.warn("Table app_plans inaccessible ou mode hors-ligne. Préservation du cache local.", err)
      }
    }

    fetchPlans()
  }, [])

  const normalizedPlan = planName ? planName.toLowerCase() : 'free'
  const currentConfig = plans[normalizedPlan] || plans.free || DEFAULT_PLANS.free

  return {
    plans,
    currentConfig
  }
}
