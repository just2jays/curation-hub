export type FieldMetadata = {
  name: string
  selectOptions: string[]
}

export type BootstrapState = {
  collections: string[]
  fields: Record<string, FieldMetadata[]>
  hasUsersAuthCollection: boolean
}

export type RecordItem = Record<string, unknown> & {
  id: string
  collectionName: string
  name: string
  notes: string
  location: string
  season: string[]
  tags: string[]
  pros: unknown
  cons: unknown
  created: string
  updated: string
}
