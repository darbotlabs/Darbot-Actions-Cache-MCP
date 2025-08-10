import cluster from 'node:cluster'

import { createConsola, LogLevels } from 'consola'
import { ENV } from '~/lib/env'

export const logger = createConsola({
  defaults: {
    tag: cluster.isPrimary ? 'dar-act-cache' : `dar-act-cache-node-${cluster.worker?.id}`,
  },
  level: ENV.DEBUG ? LogLevels.debug : LogLevels.info,
})
