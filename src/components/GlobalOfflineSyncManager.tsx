import { useEffect, useState } from 'react'
import localforage from 'localforage'
import { supabase } from '../lib/supabase'

export default function GlobalOfflineSyncManager() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncedCount, setSyncedCount] = useState(0)

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      console.log("🌐 Connexion rétablie ! Lancement automatique de la synchronisation globale...")
      
      // Laisser un court instant pour que la connexion se stabilise
      setTimeout(async () => {
        await syncAllPendingPhotos()
      }, 2000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Vérifier au démarrage si on a des éléments en attente et qu'on est en ligne
    if (navigator.onLine) {
      const timer = setTimeout(() => {
        syncAllPendingPhotos()
      }, 3000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const syncAllPendingPhotos = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      let successCount = 0

      // 1. Synchronisation des suppressions en attente
      const deleteQueue: string[] = JSON.parse(localStorage.getItem('teutchap_offline_delete_queue') || '[]')
      if (deleteQueue.length > 0) {
        console.log(`🗑️ Synchronisation globale de ${deleteQueue.length} suppression(s) en attente...`)
        const remainingDeleteQueue: string[] = []
        for (const photoId of deleteQueue) {
          try {
            const { error } = await supabase.from('photos').delete().eq('id', photoId)
            if (error) {
              remainingDeleteQueue.push(photoId)
            } else {
              successCount++
            }
          } catch(e) {
            remainingDeleteQueue.push(photoId)
          }
        }
        localStorage.setItem('teutchap_offline_delete_queue', JSON.stringify(remainingDeleteQueue))
      }

      // 2. Synchronisation des ajouts en attente
      const queue: any[] = await localforage.getItem('teutchap_offline_queue') || []
      if (queue.length === 0 && deleteQueue.length === 0) return

      if (queue.length > 0) {
        console.log(`🚀 Synchronisation globale de ${queue.length} souvenir(s) en attente...`)
      }
      const remainingQueue: any[] = []

      for (const item of queue) {
        let itemSuccess = false
        try {
          const token = item.token
          let resolvedEventId = item.eventId

          // Si l'eventId est manquant ou est un mock, tenter de le résoudre
          if (!resolvedEventId || resolvedEventId.startsWith('mock-id-')) {
            const cached = localStorage.getItem(`teutchap_event_cache_${token}`)
            if (cached) {
              try { resolvedEventId = JSON.parse(cached).id } catch(e){}
            }
          }
          if (!resolvedEventId || resolvedEventId.startsWith('mock-id-')) {
            try {
              const { data } = await supabase.from('events').select('id').eq('token', token).single()
              if (data?.id) {
                resolvedEventId = data.id
                localStorage.setItem(`teutchap_event_cache_${token}`, JSON.stringify(data))
              }
            } catch(e){}
          }

          if (resolvedEventId && !resolvedEventId.startsWith('mock-id-')) {
            const fileName = `${token}_${Date.now()}_${Math.random().toString(36).substring(2,7)}.jpg`
            const { error: uploadError } = await supabase.storage
              .from('events_photos')
              .upload(fileName, item.blob)

            if (!uploadError) {
              const { error: dbError } = await supabase.from('photos').insert([
                {
                  event_id: resolvedEventId,
                  url_original: fileName,
                  url_thumb: fileName,
                  file_size_bytes: item.compressedSize || item.blob?.size || 0,
                  challenge_id: item.challengeId || null,
                  is_moderated: false,
                  uploader_name: item.contributorName || 'Invité'
                }
              ])
              if (!dbError) {
                successCount++
                itemSuccess = true
              } else {
                console.error("GlobalSync - Erreur DB insert:", dbError)
              }
            } else {
              console.error("GlobalSync - Erreur Storage upload:", uploadError)
            }
          }
        } catch (e) {
          console.error("GlobalSync - Erreur item:", e)
        }

        if (!itemSuccess) {
          remainingQueue.push(item)
        }
      }

      await localforage.setItem('teutchap_offline_queue', remainingQueue)
      if (successCount > 0) {
        setSyncedCount(successCount)
        // Masquer la bannière de succès après 6 secondes
        setTimeout(() => setSyncedCount(0), 6000)
      }
    } catch (err) {
      console.error("Erreur de synchronisation globale:", err)
    } finally {
      setIsSyncing(false)
    }
  }

  if (isOnline && !isSyncing && syncedCount === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
      {!isOnline && (
        <div className="glass-dark border border-amber-500/30 px-3 py-2 rounded-xl shadow-lg flex items-center space-x-2.5 backdrop-blur-md bg-black/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-200">Mode Hors-Ligne</span>
        </div>
      )}

      {isSyncing && (
        <div className="glass border border-primary/30 px-3 py-2 rounded-xl shadow-lg flex items-center space-x-2.5 bg-primary/10 backdrop-blur-md">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-wider text-primary-light">Synchronisation...</span>
        </div>
      )}

      {syncedCount > 0 && (
        <div className="glass border border-emerald-500/30 px-3 py-2 rounded-xl shadow-lg flex items-center space-x-2.5 bg-emerald-500/10 backdrop-blur-md">
          <span className="text-emerald-400 font-bold text-xs">✓</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
            {syncedCount} synchronisé(s) !
          </span>
        </div>
      )}
    </div>
  )
}
