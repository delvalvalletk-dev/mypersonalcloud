export function useFilePreview() {
  const { getSignedUrl } = useFileStorage()

  const supportedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'application/pdf',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
  ]

  function canPreview(mimeType: string | null): boolean {
    return mimeType !== null && supportedTypes.includes(mimeType)
  }

  async function getPreviewUrl(storagePath: string): Promise<string> {
    return getSignedUrl(storagePath, 300)
  }

  return {
    canPreview,
    getPreviewUrl,
  }
}