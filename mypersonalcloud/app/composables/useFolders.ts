export interface StoredFolder {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  created_at: string
}

export function useFolders() {
  const supabase = useSupabaseClient()

  async function getFolders(): Promise<StoredFolder[]> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      throw new Error('Vous devez être connecté pour consulter vos dossiers.')
    }

    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(
        `Impossible de récupérer les dossiers : ${error.message}`,
      )
    }

    return (data ?? []) as StoredFolder[]
  }


  async function createFolder(
    name: string,
    parentId: string | null = null,
  ): Promise<StoredFolder> {
    const trimmedName = name.trim()

    if (!trimmedName) {
      throw new Error('Le nom du dossier ne peut pas être vide.')
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      throw new Error(
        'Vous devez être connecté pour créer un dossier.',
      )
    }

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: authData.user.id,
        name: trimmedName,
        parent_id: parentId,
      })
      .select()
      .single()
      

    if (error) {
      throw new Error(
        `Impossible de créer le dossier : ${error.message}`
      )
    }

    if (!data) {
      throw new Error('Le dossier a été créé sans retourner de données.')
    }

    return data as StoredFolder
  }


  return {
    getFolders,
    createFolder,
  }
}