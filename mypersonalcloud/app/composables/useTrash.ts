
export interface TrashChild {
  id: string
  name: string
  type: 'file' | 'folder'
  size: number | null
  children: TrashChild[]
}

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

  // Contenu des dossiers supprimés.
  children: TrashChild[]
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

    // Récupérer tous les fichiers de l'utilisateur.
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)

    if (filesError) {
      throw new Error(
        `Impossible de récupérer les fichiers : ${filesError.message}`,
      )
    }

    // Récupérer tous les dossiers de l'utilisateur.
    const { data: folders, error: foldersError } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)

    if (foldersError) {
      throw new Error(
        `Impossible de récupérer les dossiers : ${foldersError.message}`,
      )
    }

    const allFiles = files ?? []
    const allFolders = folders ?? []

    // Construire les éléments enfants d'un dossier.
    function getFolderChildren(folderId: string, visited = new Set<string>()): TrashChild[] {
      if (visited.has(folderId)) return []

      const nextVisited = new Set(visited)
      nextVisited.add(folderId)

      const childFiles: TrashChild[] = allFiles
        .filter(file => file.folder_id === folderId)
        .map(file => ({
          id: file.id,
          name: file.name,
          type: 'file',
          size: Number(file.size_bytes),
          children: [],
        }))

      const childFolders: TrashChild[] = allFolders
        .filter(folder => folder.parent_id === folderId)
        .map(folder => ({
          id: folder.id,
          name: folder.name,
          type: 'folder',
          size: null,
          children: getFolderChildren(folder.id, nextVisited),
        }))

      return [...childFolders, ...childFiles]
    }

    // Vérifier si un élément possède déjà un dossier supprimé parmi ses ancêtres.
    function hasDeletedAncestor(
      parentId: string | null,
      visited = new Set<string>(),
    ): boolean {
      if (!parentId || visited.has(parentId)) return false

      visited.add(parentId)

      const parent = allFolders.find(folder => folder.id === parentId)

      if (!parent) return false
      if (parent.deleted_at !== null) return true

      return hasDeletedAncestor(parent.parent_id, visited)
    }

    // Les fichiers supprimés qui ne sont pas déjà contenus
    // dans un dossier supprimé restent des entrées principales.
    const trashFiles: TrashItem[] = allFiles
      .filter(file =>
        file.deleted_at !== null
        && !hasDeletedAncestor(file.folder_id),
      )
      .map(file => ({
        id: file.id,
        name: file.name,
        type: 'file',
        deletedAt: file.deleted_at!,
        deletedAtTimestamp: new Date(file.deleted_at!).getTime(),
        size: Number(file.size_bytes),
        storagePath: file.storage_path,
        folderId: file.folder_id,
        parentId: null,
        children: [],
      }))

    // Même principe pour les dossiers supprimés.
    const trashFolders: TrashItem[] = allFolders
      .filter(folder =>
        folder.deleted_at !== null
        && !hasDeletedAncestor(folder.parent_id),
      )
      .map(folder => ({
        id: folder.id,
        name: folder.name,
        type: 'folder',
        deletedAt: folder.deleted_at!,
        deletedAtTimestamp: new Date(folder.deleted_at!).getTime(),
        size: null,
        storagePath: null,
        folderId: null,
        parentId: folder.parent_id,
        children: getFolderChildren(folder.id),
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

  async function restoreItem(
    id: string,
    type: 'file' | 'folder',
  ): Promise<void> {
    const table = type === 'file' ? 'files' : 'folders'

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      throw new Error(
        'Vous devez être connecté pour restaurer cet élément.',
      )
    }

    const { data, error } = await supabase
      .from(table)
      .update({ deleted_at: null })
      .eq('id', id)
      .eq('user_id', authData.user.id)
      .select('id')

    if (error) {
      throw new Error(
        `Impossible de restaurer l'élément : ${error.message}`,
      )
    }

    if (!data || data.length === 0) {
      throw new Error(
        "L'élément est introuvable ou vous ne pouvez pas le restaurer.",
      )
    }
  }


  async function permanentlyDeleteItem(
    id: string,
    type: 'file' | 'folder',
  ): Promise<void> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      throw new Error(
        'Vous devez être connecté pour supprimer définitivement cet élément.',
      )
    }

    const userId = authData.user.id
    const { deleteFile } = useFileStorage()

    // Suppression définitive d'un fichier.
    if (type === 'file') {
      const { data: file, error } = await supabase
        .from('files')
        .select('storage_path')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error || !file) {
        throw new Error('Impossible de retrouver le fichier.')
      }

      await deleteFile(file.storage_path)

      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (deleteError) {
        throw new Error(
          `Impossible de supprimer le fichier : ${deleteError.message}`,
        )
      }

      return
    }

    // Récupérer tous les dossiers de l'utilisateur.
    const { data: folders, error: foldersError } = await supabase
      .from('folders')
      .select('id, parent_id')
      .eq('user_id', userId)

    if (foldersError) {
      throw new Error(
        `Impossible de récupérer les dossiers : ${foldersError.message}`,
      )
    }

    // Récupérer tous les fichiers de l'utilisateur.
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('id, folder_id, storage_path')
      .eq('user_id', userId)

    if (filesError) {
      throw new Error(
        `Impossible de récupérer les fichiers : ${filesError.message}`,
      )
    }

    // Construire récursivement la liste des dossiers à supprimer.
    const folderIds = new Set<string>()

    function collectFolderIds(parentId: string) {
      if (folderIds.has(parentId)) return

      folderIds.add(parentId)

      for (const folder of folders ?? []) {
        if (folder.parent_id === parentId) {
          collectFolderIds(folder.id)
        }
      }
    }

    const targetFolder = folders?.find(folder => folder.id === id)

    if (!targetFolder) {
      throw new Error('Impossible de retrouver le dossier.')
    }

    collectFolderIds(id)

    // Récupérer les fichiers contenus dans ces dossiers.
    const filesToDelete = (files ?? []).filter(file =>
      file.folder_id !== null && folderIds.has(file.folder_id),
    )

    // Supprimer les fichiers du stockage.
    for (const file of filesToDelete) {
      await deleteFile(file.storage_path)
    }

    // Supprimer les lignes des fichiers.
    const fileIds = filesToDelete.map(file => file.id)

    if (fileIds.length > 0) {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('user_id', userId)
        .in('id', fileIds)

      if (error) {
        throw new Error(
          `Impossible de supprimer les fichiers : ${error.message}`,
        )
      }
    }

    // Supprimer les dossiers du plus profond au plus haut.
    const remainingFolders = [...(folders ?? [])]
      .filter(folder => folderIds.has(folder.id))

    function getDepth(folderId: string): number {
      const folder = remainingFolders.find(item => item.id === folderId)

      if (!folder || !folder.parent_id || !folderIds.has(folder.parent_id)) {
        return 0
      }

      return 1 + getDepth(folder.parent_id)
    }

    remainingFolders.sort(
      (a, b) => getDepth(b.id) - getDepth(a.id),
    )

    for (const folder of remainingFolders) {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folder.id)
        .eq('user_id', userId)

      if (error) {
        throw new Error(
          `Impossible de supprimer le dossier ${folder.id} : ${error.message}`,
        )
      }
    }
  }


  return {
    getTrashItems,
    moveToTrash,
    restoreItem,
    permanentlyDeleteItem
  }
}
