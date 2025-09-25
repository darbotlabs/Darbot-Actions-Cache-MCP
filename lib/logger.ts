import cluster from 'node:cluster'

import { createConsola, LogLevels } from 'consola'
import { ENV } from '~/lib/env'

export const logger = createConsola({
  defaults: {
    tag: cluster.isPrimary ? 'darbot-dac' : `darbot-dac-node-${cluster.worker?.id}`,
  },
  level: ENV.DEBUG ? LogLevels.debug : LogLevels.info,
})
