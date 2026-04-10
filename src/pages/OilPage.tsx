import { EntityPageShell } from '../components/EntityPageShell'
import { entityConfigs } from '../data/entities'

export function OilPage() {
  return <EntityPageShell config={entityConfigs.oil} />
}
