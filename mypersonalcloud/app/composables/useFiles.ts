import type { Database } from "#build/types/supabase-database"

export interface StoredFile {
  id: string
  user_id: string
  folder_id: string | null
  name: string
  storage_path: string
  size_bytes: number
  mime_type: string | null
  created_at: string
}

export function useFiles() {
  const supabase = useSupabaseClient<Database>()
  const { uploadFile, deleteFile } = useFileStorage()

	async function getFiles(): Promise<StoredFile[]> {
		const { data: authData, error: authError } =
			await supabase.auth.getUser()
	
		if (authError || !authData.user) {
			throw new Error('Vous devez être connecté pour consulter vos fichiers.')
		}

		const { data, error } = await supabase
			.from('files')
			.select('*')
			.eq('user_id', authData.user.id)
			.order('created_at', { ascending: false })

		if (error) {
			throw new Error(`Impossible de récupérer les fichiers : ${error.message}`)
		}

		return (data ?? []) as StoredFile[]
	}

  async function uploadAndRegister(file: File): Promise<StoredFile> {
    // 1. Vérifier l'utilisateur connecté.
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      throw new Error('Vous devez être connecté pour envoyer un fichier.')
    }

    const userId = authData.user.id

    // 2. Envoyer le fichier physique dans Supabase Storage.
    const uploadedFile = await uploadFile(file)

    // 3. Enregistrer ses métadonnées en base.
    const { data, error } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        folder_id: null,
        name: uploadedFile.name,
        storage_path: uploadedFile.path,
        size_bytes: uploadedFile.size,
        mime_type: uploadedFile.mimeType,
      })
      .select()
      .single()

    if (error) {
      // 4. Si l'insertion échoue, essayer de supprimer le fichier physique.
      try {
        await deleteFile(uploadedFile.path)
      } catch (cleanupError) {
        console.error(
          'Impossible de supprimer le fichier après l’échec en base :',
          cleanupError,
        )
      }

      throw new Error(
        `Le fichier a été envoyé, mais son enregistrement a échoué : ${error.message}`,
      )
    }

    return data as StoredFile
  }

  return {
    uploadAndRegister,
		getFiles
  }
}
