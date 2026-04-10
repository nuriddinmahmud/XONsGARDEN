import { drainagesConfig } from './drainage.config'
import { energiesConfig } from './energy.config'
import { fertilizersConfig } from './fertilizer.config'
import { foodsConfig } from './food.config'
import { oilsConfig } from './oil.config'
import { remontsConfig } from './remont.config'
import { taxesConfig } from './tax.config'
import { transportsConfig } from './transport.config'
import { workersConfig } from './workers.config'

export { drainagesConfig } from './drainage.config'
export { energiesConfig } from './energy.config'
export { fertilizersConfig } from './fertilizer.config'
export { foodsConfig } from './food.config'
export { oilsConfig } from './oil.config'
export { remontsConfig } from './remont.config'
export { taxesConfig } from './tax.config'
export { transportsConfig } from './transport.config'
export { workersConfig } from './workers.config'

export const entityConfigs = {
  workers: workersConfig,
  food: foodsConfig,
  fertilizer: fertilizersConfig,
  transport: transportsConfig,
  energy: energiesConfig,
  oil: oilsConfig,
  remont: remontsConfig,
  tax: taxesConfig,
  drainage: drainagesConfig,
}
