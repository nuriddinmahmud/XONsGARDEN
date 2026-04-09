import { EntityPageShell } from '../components/EntityPageShell'
import { foodsConfig } from '../data/entityConfigs'

export function FoodPage() {
  return <EntityPageShell config={foodsConfig} />
}
