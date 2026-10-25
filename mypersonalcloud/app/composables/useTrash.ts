
export interface TrashItem {
  id: string
  name: string
  type: 'file' | 'folder'
  deletedAt: string
  deletedAtTimestamp: number
  size: number | null

  // Informations nécessaires pour la restauration et la suppression définitive.
  storagePath: string | null
  folderId: string | null
  parentId: string | null
}

export function useTrash() {
  const supabase = useSupabaseClient()

  async function getTrashItems(): Promise<TrashItem[]> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      throw new Error(
        'Vous devez être connecté pour consulter la corbeille.',
      )
    }

    const userId = authData.user.id

    // Récupérer les fichiers supprimés.
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)

    if (filesError) {
      throw new Error(
        `Impossible de récupérer les fichiers supprimés : ${filesError.message}`,
      )
    }

    // Récupérer les dossiers supprimés.
    const { data: folders, error: foldersError } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)

    if (foldersError) {
      throw new Error(
        `Impossible de récupérer les dossiers supprimés : ${foldersError.message}`,
      )
    }

    const trashFiles: TrashItem[] = (files ?? []).map(file => ({
      id: file.id,
      name: file.name,
      type: 'file',
      deletedAt: file.deleted_at!,
      deletedAtTimestamp: new Date(file.deleted_at!).getTime(),
      size: file.size_bytes,
      storagePath: file.storage_path,
      folderId: file.folder_id,
      parentId: null,
    }))

    const trashFolders: TrashItem[] = (folders ?? []).map(folder => ({
      id: folder.id,
      name: folder.name,
      type: 'folder',
      deletedAt: folder.deleted_at!,
      deletedAtTimestamp: new Date(folder.deleted_at!).getTime(),
      size: null,
      storagePath: null,
      folderId: null,
      parentId: folder.parent_id,
    }))

    return [...trashFiles, ...trashFolders].sort(
      (a, b) => b.deletedAtTimestamp - a.deletedAtTimestamp,
    )
  }

  async function moveToTrash(
    id: string,
    type: 'file' | 'folder',
  ): Promise<void> {
    const table = type === 'file' ? 'files' : 'folders'
  
    const { data: authData, error: authError } =
      await supabase.auth.getUser()
  
    if (authError || !authData.user) {
      throw new Error(
        'Vous devez être connecté pour déplacer cet élément vers la corbeille.',
      )
    }
  
    const { data, error } = await supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', authData.user.id)
      .select('id')
  
    if (error) {
      throw new Error(
        `Impossible de déplacer l'élément vers la corbeille : ${error.message}`,
      )
    }
  
    if (!data || data.length === 0) {
      throw new Error(
        "L'élément est introuvable ou vous ne pouvez pas le supprimer.",
      )
    }
  }

  return {
    getTrashItems,
    moveToTrash
  }
}
