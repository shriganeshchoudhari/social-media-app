import client from './client.js'

export const uploadMedia = (file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/media/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
}
