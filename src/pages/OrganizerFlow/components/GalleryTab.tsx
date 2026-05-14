import { Cloud, Trash2, Eye } from 'lucide-react'

export const GalleryTab = ({ photos, isAdminUploading, adminFileInputRef, handleAdminUploadChange, handleDeletePhoto }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">Galerie Temps Réel</h2>
        <div className="flex items-center space-x-3">
          <input type="file" multiple accept="image/*" className="hidden" ref={adminFileInputRef} onChange={handleAdminUploadChange} />
          <button 
            disabled={isAdminUploading}
            onClick={() => adminFileInputRef.current?.click()}
            className="flex-1 md:flex-none glass border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center justify-center space-x-2"
          >
            <Cloud size={16} />
            <span>{isAdminUploading ? 'Téléversement...' : 'Ajouter des photos'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {photos.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-40 italic">Aucune photo pour le moment</div>
        ) : (
          photos.map((photo: any) => (
            <div key={photo.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden glass border border-white/5 shadow-xl group">
              <img 
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><Eye size={20} /></button>
                <button onClick={(e) => handleDeletePhoto(photo, e)} className="p-3 bg-red-500/20 text-red-500 rounded-2xl hover:bg-red-500/30 transition-all"><Trash2 size={20} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
