import { useEffect, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { RecordForm } from './components/RecordForm'
import { SetupScreen } from './components/SetupScreen'
import { getBootstrapState, isAuthError, normalizeRecord, pb } from './lib/pocketbase'
import type { BootstrapState, RecordItem } from './types'

function App() {
  const [bootstrap, setBootstrap] = useState<BootstrapState>({ collections: [], fields: {}, hasUsersAuthCollection: false })
  const [records, setRecords] = useState<RecordItem[]>([])
  const [query, setQuery] = useState('')
  const [activeCollection, setActiveCollection] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [editing, setEditing] = useState<RecordItem>()
  const [error, setError] = useState('')
  const [bootstrapFailed, setBootstrapFailed] = useState(false)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const next = await getBootstrapState()
      setBootstrap(next)
      setBootstrapFailed(false)
      if (pb.authStore.isValid && next.hasUsersAuthCollection && next.collections.length) {
        const loaded = (await Promise.all(next.collections.map(async (collection) => {
          const data = await pb.collection(collection).getFullList({ sort: '-created' })
          return data.map((record) => normalizeRecord(record as unknown as Record<string, unknown>, collection))
        }))).flat()
        setRecords(loaded)
        setError('')
      }
    } catch (err) {
      if (isAuthError(err)) pb.authStore.clear()
      setBootstrapFailed(true)
      setError(err instanceof Error ? err.message : 'PocketBase unavailable.')
    } finally { setLoading(false) }
  }

  useEffect(() => { void refresh() }, [])

  if (loading && !bootstrap.collections.length) return <main className="center-stage"><div className="loading-mark">Loading workspace...</div></main>
  if (bootstrapFailed) return <main className="center-stage"><section className="setup-panel"><p className="eyebrow">CURATOR HUB / CONNECTION</p><h1>We could not read the workspace.</h1><p className="muted">PocketBase is running, but the public collection status endpoint did not return valid metadata.</p><p className="error-text">{error}</p><button className="primary-button" onClick={() => void refresh()}>Retry connection</button></section></main>
  if (!bootstrap.hasUsersAuthCollection || !bootstrap.collections.length) return <SetupScreen state={bootstrap} onRefresh={() => void refresh()} />
  if (!pb.authStore.isValid) return <AuthScreen onSignedIn={() => void refresh()} />

  const visible = records.filter((record) => {
    const matchesCollection = activeCollection === 'all' || record.collectionName === activeCollection
    const haystack = [record.name, record.notes, record.location, record.tags.join(' '), record.season.join(' ')].join(' ').toLowerCase()
    const matchesTags = selectedTags.every((tag) => record.tags.includes(tag))
    return matchesCollection && matchesTags && haystack.includes(query.toLowerCase())
  })

  const tagCollection = activeCollection === 'all' ? '' : activeCollection
  const collectionTags = [...new Set(records
    .filter((record) => record.collectionName === tagCollection)
    .flatMap((record) => record.tags))].sort((left, right) => left.localeCompare(right))

  function changeCollection(collection: string) {
    setActiveCollection(collection)
    setSelectedTags([])
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag])
  }

  function saveRecord(saved: RecordItem) {
    setRecords((current) => {
      const normalized = normalizeRecord(saved as unknown as Record<string, unknown>, saved.collectionName)
      const exists = current.some((record) => record.id === normalized.id)
      return exists ? current.map((record) => record.id === normalized.id ? normalized : record) : [normalized, ...current]
    })
    setEditing(undefined)
  }

  async function removeRecord(record: RecordItem) {
    if (!window.confirm(`Delete ${record.name}?`)) return
    try {
      await pb.collection(record.collectionName).delete(record.id)
      setRecords((current) => current.filter((item) => item.id !== record.id))
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete record.') }
  }

  return <div className="app-shell">
    <header className="topbar"><div><p className="eyebrow">CURATOR HUB</p><h1>A living index of good places.</h1></div><div className="topbar-actions"><span className="connection-pill">● {records.length} records</span><button className="secondary-button" onClick={() => { pb.authStore.clear(); setRecords([]) }}>Sign out</button></div></header>
    <section className="toolbar"><div className="collection-tabs"><button className={activeCollection === 'all' ? 'tab active' : 'tab'} onClick={() => changeCollection('all')}>Everything</button>{bootstrap.collections.map((collection) => <button key={collection} className={activeCollection === collection ? 'tab active' : 'tab'} onClick={() => changeCollection(collection)}>{collection}</button>)}</div><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, notes, seasons..." /></section>
    {activeCollection !== 'all' && <section className="tag-panel"><div><p className="eyebrow">FILTER BY TAG</p><p className="tag-panel-help">Show records matching every selected tag.</p></div><div className="tag-options">{collectionTags.length ? collectionTags.map((tag) => <button key={tag} className={selectedTags.includes(tag) ? 'tag-filter active' : 'tag-filter'} onClick={() => toggleTag(tag)} aria-pressed={selectedTags.includes(tag)}>#{tag}</button>) : <span className="muted">No tags in this collection yet.</span>}{selectedTags.length > 0 && <button className="clear-tags" onClick={() => setSelectedTags([])}>Clear tags</button>}</div></section>}
    {error && <div className="notice error-text">{error}</div>}
    <main className="content"><div className="section-heading"><div><p className="eyebrow">EXPLORER</p><h2>{visible.length} records in view</h2></div><button className="primary-button" onClick={() => setEditing({ collectionName: activeCollection === 'all' ? bootstrap.collections[0] : activeCollection } as RecordItem)}>＋ Add record</button></div><div className="record-grid">{visible.map((record) => <article className="record-card" key={record.id}><div className="card-top"><span className="collection-label">{record.collectionName}</span><button className="icon-button" onClick={() => setEditing(record)} aria-label={`Edit ${record.name}`}>↗</button></div><h3>{record.name || 'Untitled record'}</h3>{record.location && <p className="location">⌖ {record.location}</p>}{record.notes && <p className="notes">{record.notes}</p>}<div className="chip-row">{record.season.map((value) => <span className="chip season" key={value}>{value}</span>)}{record.tags.map((value) => <span className="chip" key={value}>#{value}</span>)}</div><button className="delete-link" onClick={() => void removeRecord(record)}>Delete</button></article>)}</div>{visible.length === 0 && <div className="empty-state">No records match this view.</div>}</main>
    {editing && <div className="modal-backdrop"><RecordForm state={bootstrap} item={editing.id ? editing : undefined} allTags={[...new Set(records.flatMap((r) => r.tags))].sort()} onSaved={saveRecord} onCancel={() => setEditing(undefined)} /></div>}
  </div>
}

export default App
