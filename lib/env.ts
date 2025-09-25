import { tmpdir } from 'node:os'
import { z } from 'zod'

const booleanSchema = z.string().transform((v) => v.toLowerCase() === 'true')
const portSchema = z.coerce.number().int().min(1).max(65_535)

const envSchema = z.object({
  // Legacy support for API_BASE_URL and DAR_ACT_BASE_URL
  API_BASE_URL: z.string().url().optional(),
  DAR_ACT_BASE_URL: z.string().url().optional(),
  DAC_BASE_URL: z.string().url().optional(),
  
  // Cache settings
  DAC_CACHE_CLEANUP_OLDER_THAN_DAYS: z.coerce.number().int().min(0).default(90),
  DAC_CACHE_CLEANUP_CRON: z.string().default('0 0 * * *'),
  DAC_UPLOAD_CLEANUP_CRON: z.string().default('*/10 * * * *'),
  // Legacy support
  DAR_ACT_CACHE_CLEANUP_OLDER_THAN_DAYS: z.coerce.number().int().min(0).optional(),
  DAR_ACT_CACHE_CLEANUP_CRON: z.string().optional(),
  DAR_ACT_UPLOAD_CLEANUP_CRON: z.string().optional(),
  ENABLE_DIRECT_DOWNLOADS: booleanSchema.default('false'),
  
  // Storage settings
  DAC_STORAGE_BACKEND: z.string().toLowerCase().default('filesystem'),
  STORAGE_DRIVER: z.string().toLowerCase().optional(), // Legacy support
  DAR_ACT_STORAGE_BACKEND: z.string().toLowerCase().optional(), // Legacy support
  
  // Database settings
  DAC_DB_TYPE: z.string().toLowerCase().default('sqlite'),
  DB_DRIVER: z.string().toLowerCase().optional(), // Legacy support
  DAR_ACT_DB_TYPE: z.string().toLowerCase().optional(), // Legacy support
  
  // Server settings
  DAC_PORT: portSchema.optional(),
  NITRO_PORT: portSchema.default(3000),
  DAR_ACT_PORT: portSchema.optional(), // Legacy support
  DAC_HOST: z.string().default('0.0.0.0'),
  DAR_ACT_HOST: z.string().optional(), // Legacy support
  
  // Performance settings
  DAC_CLUSTER_MODE: booleanSchema.default('false'),
  DAC_WORKERS: z.coerce.number().int().min(1).default(4),
  DAC_MAX_CACHE_SIZE: z.string().default('10GB'),
  // Legacy support
  DAR_ACT_CLUSTER_MODE: booleanSchema.optional(),
  DAR_ACT_WORKERS: z.coerce.number().int().min(1).optional(),
  DAR_ACT_MAX_CACHE_SIZE: z.string().optional(),
  
  // Security settings
  DAC_AUTH_ENABLED: booleanSchema.default('false'),
  DAC_AUTH_TOKEN: z.string().optional(),
  // Legacy support
  DAR_ACT_AUTH_ENABLED: booleanSchema.optional(),
  DAR_ACT_AUTH_TOKEN: z.string().optional(),
  
  // Logging
  DAC_LOG_LEVEL: z.string().default('info'),
  DAC_LOG_FORMAT: z.string().default('json'),
  // Legacy support
  DAR_ACT_LOG_LEVEL: z.string().optional(),
  DAR_ACT_LOG_FORMAT: z.string().optional(),
  
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
  BASE_URL: parsedEnv.data.DAC_BASE_URL || parsedEnv.data.DAR_ACT_BASE_URL || parsedEnv.data.API_BASE_URL,
  // Normalize storage driver with fallback support
  STORAGE_DRIVER: parsedEnv.data.DAC_STORAGE_BACKEND || parsedEnv.data.DAR_ACT_STORAGE_BACKEND || parsedEnv.data.STORAGE_DRIVER,
  // Normalize database driver with fallback support
  DB_DRIVER: parsedEnv.data.DAC_DB_TYPE || parsedEnv.data.DAR_ACT_DB_TYPE || parsedEnv.data.DB_DRIVER,
  // Use DAC_PORT if set, otherwise fall back to legacy values
  PORT: parsedEnv.data.DAC_PORT || parsedEnv.data.DAR_ACT_PORT || parsedEnv.data.NITRO_PORT,
  // Normalize host
  HOST: parsedEnv.data.DAC_HOST || parsedEnv.data.DAR_ACT_HOST,
  // Cleanup cron schedules with fallback support
  CACHE_CLEANUP_CRON: parsedEnv.data.DAC_CACHE_CLEANUP_CRON || parsedEnv.data.DAR_ACT_CACHE_CLEANUP_CRON,
  UPLOAD_CLEANUP_CRON: parsedEnv.data.DAC_UPLOAD_CLEANUP_CRON || parsedEnv.data.DAR_ACT_UPLOAD_CLEANUP_CRON,
  CACHE_CLEANUP_OLDER_THAN_DAYS: parsedEnv.data.DAC_CACHE_CLEANUP_OLDER_THAN_DAYS || parsedEnv.data.DAR_ACT_CACHE_CLEANUP_OLDER_THAN_DAYS,
  // Performance settings with fallback
  CLUSTER_MODE: parsedEnv.data.DAC_CLUSTER_MODE || parsedEnv.data.DAR_ACT_CLUSTER_MODE,
  WORKERS: parsedEnv.data.DAC_WORKERS || parsedEnv.data.DAR_ACT_WORKERS,
  MAX_CACHE_SIZE: parsedEnv.data.DAC_MAX_CACHE_SIZE || parsedEnv.data.DAR_ACT_MAX_CACHE_SIZE,
  // Security settings with fallback
  AUTH_ENABLED: parsedEnv.data.DAC_AUTH_ENABLED || parsedEnv.data.DAR_ACT_AUTH_ENABLED,
  AUTH_TOKEN: parsedEnv.data.DAC_AUTH_TOKEN || parsedEnv.data.DAR_ACT_AUTH_TOKEN,
  // Logging settings with fallback
  LOG_LEVEL: parsedEnv.data.DAC_LOG_LEVEL || parsedEnv.data.DAR_ACT_LOG_LEVEL,
  LOG_FORMAT: parsedEnv.data.DAC_LOG_FORMAT || parsedEnv.data.DAR_ACT_LOG_FORMAT,
}

export function formatZodError(error: z.ZodError<any>) {
  return error.errors.map((e) => ` - ${e.path.join('.')}: ${e.message}`).join('\n')
}
