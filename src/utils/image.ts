/**
 * Compresse une image côté client à l'aide d'un Canvas HTML5.
 * @param file Le fichier image d'origine
 * @param maxDim La dimension maximale (largeur ou hauteur)
 * @param quality La qualité de compression JPEG (entre 0.0 et 1.0)
 */
export function compressImageUtil(file: File, maxDim = 1920, quality = 0.75): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Conservation de l'aspect ratio
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => {
        resolve(file)
      }
    }
    reader.onerror = () => {
      resolve(file)
    }
  })
}
