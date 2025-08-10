import { tmpdir } from 'node:os'
import { z } from 'zod'

const booleanSchema = z.string().transform((v) => v.toLowerCase() === 'true')
const portSchema = z.coerce.number().int().min(1).max(65_535)

const envSchema = z.object({
  // Legacy support for API_BASE_URL
  API_BASE_URL: z.string().url().optional(),
  DAR_ACT_BASE_URL: z.string().url().optional(),
  
  // Cache settings
  DAR_ACT_CACHE_CLEANUP_OLDER_THAN_DAYS: z.coerce.number().int().min(0).default(90),
  DAR_ACT_CACHE_CLEANUP_CRON: z.string().default('0 0 * * *'),
  DAR_ACT_UPLOAD_CLEANUP_CRON: z.string().default('*/10 * * * *'),
  ENABLE_DIRECT_DOWNLOADS: booleanSchema.default('false'),
  
  // Storage settings
  DAR_ACT_STORAGE_BACKEND: z.string().toLowerCase().default('filesystem'),
  STORAGE_DRIVER: z.string().toLowerCase().optional(), // Legacy support
  
  // Database settings
  DAR_ACT_DB_TYPE: z.string().toLowerCase().default('sqlite'),
  DB_DRIVER: z.string().toLowerCase().optional(), // Legacy support
  
  // Server settings
  DAR_ACT_PORT: portSchema.optional(),
  NITRO_PORT: portSchema.default(3000),
  DAR_ACT_HOST: z.string().default('0.0.0.0'),
  
  // Performance settings
  DAR_ACT_CLUSTER_MODE: booleanSchema.default('false'),
  DAR_ACT_WORKERS: z.coerce.number().int().min(1).default(4),
  DAR_ACT_MAX_CACHE_SIZE: z.string().default('10GB'),
  
  // Security settings
  DAR_ACT_AUTH_ENABLED: booleanSchema.default('false'),
  DAR_ACT_AUTH_TOKEN: z.string().optional(),
  
  // Logging
  DAR_ACT_LOG_LEVEL: z.string().default('info'),
  DAR_ACT_LOG_FORMAT: z.string().default('json'),
  
  DEBUG: booleanSchema.default('false'),
  TEMP_DIR: z.string().default(tmpdir()),
})

const parsedEnv = envSchema.safeParse(process.env)
if (!parsedEnv.success) {
  console.error(`Invalid environment variables:\n${formatZodError(parsedEnv.error)}`)
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
}

// Create normalized ENV object with legacy support
export const ENV = {
  ...parsedEnv.data,
  // Normalize base URL with fallback support
  BASE_URL: parsedEnv.data.DAR_ACT_BASE_URL || parsedEnv.data.API_BASE_URL,
  // Normalize storage driver with fallback support
  STORAGE_DRIVER: parsedEnv.data.DAR_ACT_STORAGE_BACKEND || parsedEnv.data.STORAGE_DRIVER,
  // Normalize database driver with fallback support
  DB_DRIVER: parsedEnv.data.DAR_ACT_DB_TYPE || parsedEnv.data.DB_DRIVER,
  // Use DAR_ACT_PORT if set, otherwise fall back to NITRO_PORT
  PORT: parsedEnv.data.DAR_ACT_PORT || parsedEnv.data.NITRO_PORT,
  // Cleanup cron schedules
  CACHE_CLEANUP_CRON: parsedEnv.data.DAR_ACT_CACHE_CLEANUP_CRON,
  UPLOAD_CLEANUP_CRON: parsedEnv.data.DAR_ACT_UPLOAD_CLEANUP_CRON,
  CACHE_CLEANUP_OLDER_THAN_DAYS: parsedEnv.data.DAR_ACT_CACHE_CLEANUP_OLDER_THAN_DAYS,
}

export function formatZodError(error: z.ZodError<any>) {
  return error.errors.map((e) => ` - ${e.path.join('.')}: ${e.message}`).join('\n')
}
