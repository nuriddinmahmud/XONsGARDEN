import { EntityPageShell } from '../components/EntityPageShell'
import { workersConfig } from '../data/entityConfigs'

export function WorkersPage() {
  return <EntityPageShell config={workersConfig} />
}
