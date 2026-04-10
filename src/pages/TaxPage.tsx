import { EntityPageShell } from '../components/EntityPageShell'
import { entityConfigs } from '../data/entities'

export function TaxPage() {
  return <EntityPageShell config={entityConfigs.tax} />
}
