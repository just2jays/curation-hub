import PocketBase from 'pocketbase'
import type { BootstrapState, RecordItem } from '../types'

export const AUTH_COLLECTION = 'users'
export const pb = new PocketBase(window.location.origin)

export async function getBootstrapState(): Promise<BootstrapState> {
  return pb.send('/api/app/collections', {})
}

export function normalizeRecord(record: Record<string, unknown>, collectionName: string): RecordItem {
  const read = (...names: string[]) => {
    const key = Object.keys(record).find((candidate) => names.some((name) => candidate.toLowerCase() === name.toLowerCase()))
    return key ? record[key] : undefined
  }
  const parseList = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String)
    if (!value) return []
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) return parsed.map(String)
      } catch {
        return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)
      }
    }
    return [String(value)]
  }

  return {
    ...record,
    id: String(record.id),
    collectionName,
    name: String(read('Name', 'Title', 'title') ?? ''),
    notes: String(read('Notes', 'Description', 'description') ?? ''),
    location: String(read('Location', 'location') ?? ''),
    season: parseList(read('Season', 'season')),
    tags: parseList(read('Tags', 'tags')),
    pros: read('Pros', 'pros'),
    cons: read('Cons', 'cons'),
    created: String(record.created ?? ''),
    updated: String(record.updated ?? ''),
  }
}

export function isAuthError(error: unknown) {
  const candidate = error as { status?: number; response?: { status?: number } }
  return candidate?.status === 401 || candidate?.response?.status === 401
}
