import { EntityPageShell } from '../components/EntityPageShell'
import { entityConfigs } from '../data/entities'

export function WorkersPage() {
  return <EntityPageShell config={entityConfigs.workers} />
}
