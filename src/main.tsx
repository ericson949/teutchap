import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })
import localforage from 'localforage'
import { supabase } from './lib/supabase'

// Fallback manual sync for browsers without Background Sync API (like iOS Safari)
const syncOfflinePhotos = async () => {
  if (!navigator.onLine) return
  
  try {
    const queue: any[] = await localforage.getItem('teutchap_offline_queue') || []
    if (queue.length === 0) return

    console.log(`Syncing ${queue.length} offline photos...`)
    
    const remainingQueue = []
    
    for (const item of queue) {
      try {
        const fileName = `${item.token}_${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('events_photos')
          .upload(fileName, item.blob)

        if (!uploadError) {
          // Add to DB
          await supabase.from('photos').insert([
            {
              event_id: item.eventId, 
              url_original: fileName,
              url_thumb: fileName,
              file_size_bytes: item.blob.size
            }
          ])
          console.log('Successfully synced offline photo:', fileName)
        } else {
          console.error('Failed to sync offline photo:', uploadError)
          remainingQueue.push(item)
        }
      } catch (err) {
        remainingQueue.push(item)
      }
    }
    
    await localforage.setItem('teutchap_offline_queue', remainingQueue)
  } catch (err) {
    console.error('Error during offline sync:', err)
  }
}

window.addEventListener('online', syncOfflinePhotos)
// Try syncing on startup just in case
syncOfflinePhotos()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
