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


  async function renameFolder(
    folderId: string,
    newName: string,
  ): Promise<StoredFolder> {
    const trimmedName = newName.trim()

    if (!trimmedName) {
      throw new Error('Le nom du dossier ne peut pas être vide.')
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      throw new Error(
        'Vous devez être connecté pour renommer un dossier.',
      )
    }

    const { data, error } = await supabase
      .from('folders')
      .update({ name: trimmedName })
      .eq('id', folderId)
      .eq('user_id', authData.user.id)
      .select()
      .single()

    if (error) {
      throw new Error(
        `Impossible de renommer le dossier : ${error.message}`,
      )
    }

    return data as StoredFolder
  }

  async function deleteFolder(
    folderId: string,
  ): Promise<void> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      throw new Error(
        'Vous devez être connecté pour supprimer un dossier.',
      )
    }

    // Vérifier que le dossier ne contient aucun sous-dossier.
    const { data: subfolders, error: subfoldersError } =
      await supabase
        .from('folders')
        .select('id')
        .eq('parent_id', folderId)
        .eq('user_id', authData.user.id)
        .limit(1)

    if (subfoldersError) {
      throw new Error(
        `Impossible de vérifier les sous-dossiers : ${subfoldersError.message}`,
      )
    }

    if (subfolders && subfolders.length > 0) {
      throw new Error(
        'Ce dossier contient encore des sous-dossiers.',
      )
    }

    // Vérifier que le dossier ne contient aucun fichier.
    const { data: files, error: filesError } =
      await supabase
        .from('files')
        .select('id')
        .eq('folder_id', folderId)
        .eq('user_id', authData.user.id)
        .limit(1)

    if (filesError) {
      throw new Error(
        `Impossible de vérifier les fichiers : ${filesError.message}`,
      )
    }

    if (files && files.length > 0) {
      throw new Error(
        'Ce dossier contient encore des fichiers.',
      )
    }

    const { data: deletedFolders, error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', authData.user.id)
      .select('id')

    if (error) {
      throw new Error(
        `Impossible de supprimer le dossier : ${error.message}`,
      )
    }

    if (!deletedFolders || deletedFolders.length === 0) {
      throw new Error(
        'Le dossier est introuvable ou vous ne pouvez pas le supprimer.',
      )
    }
  }



  return {
    getFolders,
    createFolder,
    renameFolder,
    deleteFolder,
  }
}