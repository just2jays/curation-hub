import { useState } from 'react'
import type { FormEvent } from 'react'
import type { BootstrapState, RecordItem } from '../types'
import { normalizeRecord, pb } from '../lib/pocketbase'
import { TagInput } from './TagInput'

type Props = { state: BootstrapState; item?: RecordItem; allTags?: string[]; onSaved: (item: RecordItem) => void; onCancel: () => void }

function parseJson(value: string) {
  if (!value.trim()) return undefined
  try { return JSON.parse(value) } catch { return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) }
}

function formatValue(value: unknown) {
  if (!value) return ''
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
}

export function RecordForm({ state, item, allTags = [], onSaved, onCancel }: Props) {
  const collection = item?.collectionName ?? state.collections[0] ?? ''
  const fields = state.fields[collection] ?? []
  const names = fields.map((field) => field.name)
  const find = (...aliases: string[]) => names.find((name) => aliases.some((alias) => name.toLowerCase() === alias.toLowerCase()))
  const tagsField = fields.find((field) => field.name.toLowerCase() === 'tags')
  const seasonField = fields.find((field) => field.name.toLowerCase() === 'season')
  const [name, setName] = useState(item?.name ?? '')
  const [notes, setNotes] = useState(item?.notes ?? '')
  const [location, setLocation] = useState(item?.location ?? '')
  const [pros, setPros] = useState(formatValue(item?.pros))
  const [cons, setCons] = useState(formatValue(item?.cons))
  const [tags, setTags] = useState<string[]>(item?.tags ?? [])
  const [season, setSeason] = useState<string[]>(item?.season ?? [])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const payload: Record<string, unknown> = {}
    const set = (aliases: string[], value: unknown) => { const key = find(...aliases); if (key && value !== undefined) payload[key] = value }
    set(['Name', 'Title', 'title'], name)
    set(['Notes', 'Description', 'description'], notes || undefined)
    set(['Location', 'location'], location || undefined)
    set(['Pros', 'pros'], parseJson(pros))
    set(['Cons', 'cons'], parseJson(cons))
    set(['Tags', 'tags'], tagsField?.selectOptions?.length ? tags[0] : tags)
    set(['Season', 'season'], season.length ? season : undefined)

    try {
      const saved = item ? await pb.collection(collection).update(item.id, payload) : await pb.collection(collection).create(payload)
      onSaved(normalizeRecord(saved as unknown as Record<string, unknown>, collection))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save record. Check field types and API rules.')
    } finally { setBusy(false) }
  }

  return <form className="record-form" onSubmit={submit}>
    <div className="form-heading"><div><p className="eyebrow">{item ? 'EDIT RECORD' : 'NEW RECORD'}</p><h2>{item ? 'Refine the entry' : 'Add to the collection'}</h2></div><button type="button" className="icon-button" onClick={onCancel} aria-label="Close">×</button></div>
    <label>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
    <label>Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} /></label>
    <div className="form-grid"><label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} /></label><label>Tags<TagInput value={tags} onChange={setTags} suggestions={allTags} /></label></div>
    <div className="form-grid"><label>Pros<textarea value={pros} onChange={(event) => setPros(event.target.value)} rows={3} placeholder="One item per line or JSON" /></label><label>Cons<textarea value={cons} onChange={(event) => setCons(event.target.value)} rows={3} placeholder="One item per line or JSON" /></label></div>
    {seasonField && <label>Season<select multiple value={season} onChange={(event) => setSeason([...event.target.selectedOptions].map((option) => option.value))}>{seasonField.selectOptions.map((option) => <option key={option}>{option}</option>)}</select></label>}
    {error && <p className="error-text">{error}</p>}
    <div className="button-row"><button className="primary-button" disabled={busy}>{busy ? 'Saving...' : 'Save record'}</button><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button></div>
  </form>
}
