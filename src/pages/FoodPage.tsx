import { EntityPageShell } from '../components/EntityPageShell'
import { entityConfigs } from '../data/entities'

export function FoodPage() {
  return <EntityPageShell config={entityConfigs.food} />
}
