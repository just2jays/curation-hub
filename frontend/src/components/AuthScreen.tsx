import { useState } from 'react'
import type { FormEvent } from 'react'
import { AUTH_COLLECTION, pb } from '../lib/pocketbase'

type Props = { onSignedIn: () => void }

export function AuthScreen({ onSignedIn }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await pb.collection(AUTH_COLLECTION).authWithPassword(email.trim(), password)
      onSignedIn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="center-stage">
      <section className="auth-panel">
        <p className="eyebrow">CURATOR HUB</p>
        <h1>Welcome back.</h1>
        <p className="muted">Sign in with an account from the PocketBase users collection.</p>
        <form onSubmit={submit} className="stack-form">
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
          {error && <p className="error-text">{error}</p>}
          <button className="primary-button" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  )
}
