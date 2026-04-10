import { EntityPageShell } from '../components/EntityPageShell'
import { entityConfigs } from '../data/entities'

export function EnergyPage() {
  return <EntityPageShell config={entityConfigs.energy} />
}
