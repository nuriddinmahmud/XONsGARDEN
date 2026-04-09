import { EntityPageShell } from '../components/EntityPageShell'
import { drainagesConfig } from '../data/entityConfigs'

export function DrainagePage() {
  return <EntityPageShell config={drainagesConfig} />
}
