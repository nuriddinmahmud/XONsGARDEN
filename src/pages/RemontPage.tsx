import { EntityPageShell } from '../components/EntityPageShell'
import { remontsConfig } from '../data/entityConfigs'

export function RemontPage() {
  return <EntityPageShell config={remontsConfig} />
}
