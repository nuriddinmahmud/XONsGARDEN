import { EntityPageShell } from '../components/EntityPageShell'
import { taxesConfig } from '../data/entityConfigs'

export function TaxPage() {
  return <EntityPageShell config={taxesConfig} />
}
