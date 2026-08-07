import type { BootstrapState } from '../types'
import { pb } from '../lib/pocketbase'

type Props = { state: BootstrapState; onRefresh: () => void }

export function SetupScreen({ state, onRefresh }: Props) {
  async function openDashboard() {
    try {
      const data = await pb.send<{ installerHash: string }>('/api/app/installer', {})
      if (data.installerHash) {
        window.location.assign(`${window.location.origin}/_/${data.installerHash}`)
        return
      }
    } catch {
      // Fall back to the regular dashboard once initialization has completed.
    }
    window.location.assign('/_/')
  }

  return (
    <main className="center-stage">
      <section className="setup-panel">
        <p className="eyebrow">CURATOR HUB / SETUP</p>
        <h1>Make the workspace yours.</h1>
        <p className="muted">Create your users auth collection and at least one content collection in PocketBase.</p>
        <div className="status-grid">
          <div className={state.hasUsersAuthCollection ? 'status ready' : 'status'}>{state.hasUsersAuthCollection ? 'Users auth collection ready' : 'Users auth collection missing'}</div>
          <div className={state.collections.length ? 'status ready' : 'status'}>{state.collections.length ? `${state.collections.length} content collection${state.collections.length === 1 ? '' : 's'} found` : 'No content collections yet'}</div>
        </div>
        <ol className="setup-list">
          <li>Create the first PocketBase superuser.</li>
          <li>Create an auth collection named <code>users</code>.</li>
          <li>Create any base collection for your content.</li>
          <li>Allow authenticated users to list and view records.</li>
        </ol>
        <div className="button-row"><button className="primary-button" onClick={openDashboard}>Open PocketBase Dashboard</button><button className="secondary-button" onClick={onRefresh}>Refresh status</button></div>
      </section>
    </main>
  )
}
