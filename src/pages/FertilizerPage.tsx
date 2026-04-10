import { EntityPageShell } from '../components/EntityPageShell'
import { entityConfigs } from '../data/entities'

export function FertilizerPage() {
  return <EntityPageShell config={entityConfigs.fertilizer} />
}
