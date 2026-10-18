
const BUCKET = 'user-files'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 Mio

const ALLOWED_EXTENSIONS = new Set([
  // Documents
  'pdf', 'docx', 'odt', 'xlsx', 'pptx',

  // Images
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',

  // Archives
  'zip', '7z', 'tar', 'gz',

  // Texte et code
  'txt', 'csv', 'json', 'xml', 'md',

  // Audio
  'mp3', 'wav', 'ogg', 'flac',

  // Vidéo
  'mp4', 'webm', 'mov',
])

const ALLOWED_MIME_TYPES = new Set([
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Images
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',

  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-gzip',

  // Texte et code
  'text/plain',
  'text/csv',
  'application/json',
  'text/json',
  'application/xml',
  'text/xml',
  'text/markdown',
  'text/x-markdown',

  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/flac',
  'audio/x-flac',

  // Vidéo
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

export function useFileStorage() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  function getUserId(): string {
    if (!user.value) {
      throw new Error('Vous devez être connecté.')
    }

    return user.value.id
  }

  function validateFile(file: File): void {
    if (file.size === 0) {
      throw new Error('Le fichier est vide.')
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Le fichier dépasse la limite de 50 Mio.')
    }

    const lastDot = file.name.lastIndexOf('.')
    const extension =
      lastDot >= 0
        ? file.name.slice(lastDot + 1).toLowerCase()
        : ''

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new Error('Ce format de fichier n’est pas autorisé.')
    }

    // Certains navigateurs ne fournissent pas de type MIME.
    // Dans ce cas, l'extension reste contrôlée.
    if (
      file.type &&
      !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())
    ) {
      throw new Error('Le type MIME de ce fichier n’est pas autorisé.')
    }
  }

  function buildStoragePath(
    userId: string,
    fileName: string
  ): string {
    const safeName = fileName
      .replace(/[\\/]/g, '_')
      .replace(/[\u0000-\u001F\u007F]/g, '_')

    return `${userId}/${crypto.randomUUID()}-${safeName}`
  }

  async function uploadFile(file: File) {
    const userId = getUserId()

    validateFile(file)

    const path = buildStoragePath(userId, file.name)
    const contentType =
      file.type || 'application/octet-stream'

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType,
        upsert: false,
      })

    if (error) {
      throw error
    }

    return {
      path: data.path,
      name: file.name,
      size: file.size,
      mimeType: file.type || null,
    }
  }

  async function downloadFile(path: string) {
    getUserId()

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(path)

    if (error) {
      throw error
    }

    return data
  }

  async function getSignedUrl(
    path: string,
    expiresIn = 60
  ) {
    getUserId()

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw error
    }

    return data.signedUrl
  }

  async function deleteFile(path: string) {
    getUserId()

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([path])

    if (error) {
      throw error
    }
  }

  return {
    uploadFile,
    downloadFile,
    getSignedUrl,
    deleteFile,
    validateFile,
  }
}
