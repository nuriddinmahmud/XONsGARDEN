import { EntityPageShell } from '../components/EntityPageShell'
import { entityConfigs } from '../data/entities'

export function DrainagePage() {
  return <EntityPageShell config={entityConfigs.drainage} />
}
