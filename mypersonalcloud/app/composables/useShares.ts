import { ref } from 'vue'

export type ShareItem = {
  id: string
  fileId: string
  name: string
  type: 'file' | 'folder'
  sharedWith: string[]
  permission: 'read' | 'write'
  shareType: 'people' | 'public-link'
  sharedAt: string
}

const items = ref<ShareItem[]>([
  {
    id: 'share-001',
    fileId: 'folder-001',
    name: 'Projets',
    type: 'folder',
    sharedWith: ['Alice Martin', 'Thomas Bernard'],
    permission: 'write',
    shareType: 'people',
    sharedAt: '2026-10-12'
  },
  {
    id: 'share-002',
    fileId: 'file-001',
    name: 'CV-2026.pdf',
    type: 'file',
    sharedWith: [],
    permission: 'read',
    shareType: 'public-link',
    sharedAt: '2026-10-10'
  },
  {
    id: 'share-003',
    fileId: 'folder-002',
    name: 'Photos',
    type: 'folder',
    sharedWith: ['Alice Martin'],
    permission: 'read',
    shareType: 'people',
    sharedAt: '2026-10-08'
  }
])

export function useShares() {
  return { items }
}
