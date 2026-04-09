import { EntityPageShell } from '../components/EntityPageShell'
import { energiesConfig } from '../data/entityConfigs'

export function EnergyPage() {
  return <EntityPageShell config={energiesConfig} />
}
