import { EntityPageShell } from '../components/EntityPageShell'
import { transportsConfig } from '../data/entityConfigs'

export function TransportPage() {
  return <EntityPageShell config={transportsConfig} />
}
