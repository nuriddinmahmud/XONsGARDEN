import { EntityPageShell } from '../components/EntityPageShell'
import { entityConfigs } from '../data/entities'

export function TransportPage() {
  return <EntityPageShell config={entityConfigs.transport} />
}
