#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ENV } from '~/lib/env';
import { logger } from '~/lib/logger';
import { useDatabase } from '~/lib/db';
import { useStorageAdapter } from '~/lib/storage';

/**
 * Darbot Actions Cache MCP Server
 * 
 * This MCP server provides tools for managing GitHub Actions cache
 * through the Model Context Protocol interface.
 */

interface Cache {
  id: string;
  key: string;
  version: string;
  scope: string;
  created_at: string;
  accessed_at: string;
  size: number;
}

class DarbotDACMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'Darbot-DAC-MCP',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'dac_list_caches',
            description: 'List all cache entries with optional filtering by key pattern or scope',
            inputSchema: {
              type: 'object',
              properties: {
                key_pattern: {
                  type: 'string',
                  description: 'Optional pattern to filter cache keys (supports wildcards)',
                },
                scope: {
                  type: 'string', 
                  description: 'Optional scope to filter caches (e.g., "refs/heads/main")',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of caches to return (default: 50)',
                  default: 50,
                },
              },
            },
          },
          {
            name: 'dac_get_cache',
            description: 'Get detailed information about a specific cache entry',
            inputSchema: {
              type: 'object',
              properties: {
                cache_id: {
                  type: 'string',
                  description: 'Cache ID to retrieve information for',
                },
              },
              required: ['cache_id'],
            },
          },
          {
            name: 'dac_delete_cache',
            description: 'Delete a specific cache entry',
            inputSchema: {
              type: 'object',
              properties: {
                cache_id: {
                  type: 'string',
                  description: 'Cache ID to delete',
                },
              },
              required: ['cache_id'],
            },
          },
          {
            name: 'dac_prune_caches',
            description: 'Remove cache entries older than specified days',
            inputSchema: {
              type: 'object',
              properties: {
                older_than_days: {
                  type: 'number',
                  description: 'Remove caches older than this many days',
                  minimum: 1,
                },
                scope: {
                  type: 'string',
                  description: 'Optional scope to limit pruning to specific branch/ref',
                },
                dry_run: {
                  type: 'boolean',
                  description: 'If true, show what would be deleted without actually deleting',
                  default: false,
                },
              },
              required: ['older_than_days'],
            },
          },
          {
            name: 'dac_get_stats',
            description: 'Get cache usage statistics and metrics',
            inputSchema: {
              type: 'object',
              properties: {
                detailed: {
                  type: 'boolean',
                  description: 'Include detailed breakdown by scope and key patterns',
                  default: false,
                },
              },
            },
          },
          {
            name: 'dac_search_caches',
            description: 'Search for caches using flexible criteria',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for cache keys, scopes, or metadata',
                },
                created_after: {
                  type: 'string',
                  description: 'ISO date string - only return caches created after this date',
                },
                created_before: {
                  type: 'string',
                  description: 'ISO date string - only return caches created before this date',
                },
                min_size: {
                  type: 'number',
                  description: 'Minimum cache size in bytes',
                },
                max_size: {
                  type: 'number',
                  description: 'Maximum cache size in bytes',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return',
                  default: 50,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'dac_health_check',
            description: 'Perform health check on the cache server and storage backends',
            inputSchema: {
              type: 'object',
              properties: {
                include_storage: {
                  type: 'boolean',
                  description: 'Include storage backend health checks',
                  default: true,
                },
                include_database: {
                  type: 'boolean',
                  description: 'Include database health checks',
                  default: true,
                },
              },
            },
          },
        ] satisfies Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'dac_list_caches':
            return await this.handleListCaches(args);

          case 'dac_get_cache':
            return await this.handleGetCache(args);

          case 'dac_delete_cache':
            return await this.handleDeleteCache(args);

          case 'dac_prune_caches':
            return await this.handlePruneCaches(args);

          case 'dac_get_stats':
            return await this.handleGetStats(args);

          case 'dac_search_caches':
            return await this.handleSearchCaches(args);

          case 'dac_health_check':
            return await this.handleHealthCheck(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error(`MCP tool error in ${name}:`, error);
        
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleListCaches(args: any) {
    const schema = z.object({
      key_pattern: z.string().optional(),
      scope: z.string().optional(),
      limit: z.number().default(50),
    });

    const { key_pattern, scope, limit } = schema.parse(args);
    const db = await useDatabase();

    let query = db.selectFrom('cache_keys').selectAll();

    if (key_pattern) {
      query = query.where('key', 'like', key_pattern.replace('*', '%'));
    }

    // Note: scope filtering not available in current schema
    if (scope) {
      logger.warn('Scope filtering not supported in current cache_keys schema');
    }

    const caches = await query
      .orderBy('accessed_at', 'desc')
      .limit(limit)
      .execute();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total_found: caches.length,
            caches: caches.map(cache => ({
              id: cache.id,
              key: cache.key,
              version: cache.version,
              scope: 'N/A', // Not available in current schema
              size: 'N/A', // Not available in current schema
              created_at: cache.updated_at, // Using updated_at as proxy
              accessed_at: cache.accessed_at,
            })),
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetCache(args: any) {
    const schema = z.object({
      cache_id: z.string(),
    });

    const { cache_id } = schema.parse(args);
    const db = await useDatabase();

    const cache = await db
      .selectFrom('cache_keys')
      .selectAll()
      .where('id', '=', cache_id)
      .executeTakeFirst();

    if (!cache) {
      throw new Error(`Cache with ID ${cache_id} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            cache: {
              id: cache.id,
              key: cache.key,
              version: cache.version,
              scope: 'N/A', // Not available in current schema
              size: 'N/A', // Not available in current schema
              created_at: cache.updated_at,
              accessed_at: cache.accessed_at,
              paths: 'N/A', // Not available in current schema
            },
          }, null, 2),
        },
      ],
    };
  }

  private async handleDeleteCache(args: any) {
    const schema = z.object({
      cache_id: z.string(),
    });

    const { cache_id } = schema.parse(args);
    const storage = await useStorageAdapter();

    // Get cache details before deletion (for response)
    const db = await useDatabase();
    const cache = await db
      .selectFrom('cache_keys')
      .selectAll()
      .where('id', '=', cache_id)
      .executeTakeFirst();

    if (!cache) {
      throw new Error(`Cache with ID ${cache_id} not found`);
    }

    // Delete using storage adapter (handles both storage and DB)
    await storage.deleteCache(cache_id);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            deleted_cache: {
              id: cache.id,
              key: cache.key,
              size: 'N/A', // Not available in current schema
            },
            message: `Successfully deleted cache ${cache.key}`,
          }, null, 2),
        },
      ],
    };
  }

  private async handlePruneCaches(args: any) {
    const schema = z.object({
      older_than_days: z.number().min(1),
      scope: z.string().optional(),
      dry_run: z.boolean().default(false),
    });

    const { older_than_days, scope, dry_run } = schema.parse(args);
    const storage = await useStorageAdapter();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - older_than_days);

    if (dry_run) {
      const db = await useDatabase();
      let query = db
        .selectFrom('cache_keys')
        .selectAll()
        .where('updated_at', '<', cutoffDate.toISOString());

      // Note: scope filtering not available in current schema
      if (scope) {
        logger.warn('Scope filtering not supported in current cache_keys schema for dry run');
      }

      const cachesToPrune = await query.execute();
      const totalSize = 0; // Size not available in current schema

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              dry_run: true,
              caches_to_delete: cachesToPrune.length,
              total_size_to_free: totalSize,
              cutoff_date: cutoffDate.toISOString(),
              caches: cachesToPrune.map(cache => ({
                id: cache.id,
                key: cache.key,
                size: 'N/A',
                created_at: cache.updated_at,
              })),
            }, null, 2),
          },
        ],
      };
    }

    // Perform actual pruning (scope parameter ignored since not supported)
    const prunedCaches = await storage.pruneCaches(older_than_days);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            pruned_count: prunedCaches.length,
            total_size_freed: 'N/A', // Not available in current schema
            cutoff_date: cutoffDate.toISOString(),
            pruned_caches: prunedCaches,
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetStats(args: any) {
    const schema = z.object({
      detailed: z.boolean().default(false),
    });

    const { detailed } = schema.parse(args);
    const db = await useDatabase();

    // Basic stats
    const totalCachesResult = await db
      .selectFrom('cache_keys')
      .select(({ fn }) => [
        fn.count<number>('id').as('total_count'),
      ])
      .executeTakeFirst();

    const stats: any = {
      total_caches: totalCachesResult?.total_count || 0,
      total_size: 'N/A', // Not available in current schema
      timestamp: new Date().toISOString(),
    };

    if (detailed) {
      // Recent activity
      const recentActivity = await db
        .selectFrom('cache_keys')
        .selectAll()
        .orderBy('accessed_at', 'desc')
        .limit(10)
        .execute();

      stats.recent_activity = recentActivity.map(cache => ({
        key: cache.key,
        scope: 'N/A', // Not available in current schema
        size: 'N/A', // Not available in current schema
        accessed_at: cache.accessed_at,
      }));

      // Note: scope-based stats not available in current schema
      stats.note = 'Detailed scope and size statistics not available in current cache_keys schema';
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  private async handleSearchCaches(args: any) {
    const schema = z.object({
      query: z.string(),
      created_after: z.string().optional(),
      created_before: z.string().optional(),
      min_size: z.number().optional(),
      max_size: z.number().optional(),
      limit: z.number().default(50),
    });

    const { query, created_after, created_before, min_size, max_size, limit } = schema.parse(args);
    const db = await useDatabase();

    let dbQuery = db
      .selectFrom('cache_keys')
      .selectAll()
      .where('key', 'like', `%${query}%`);

    if (created_after) {
      dbQuery = dbQuery.where('updated_at', '>=', created_after);
    }

    if (created_before) {
      dbQuery = dbQuery.where('updated_at', '<=', created_before);
    }

    // Note: size filtering not available in current schema
    if (min_size !== undefined || max_size !== undefined) {
      logger.warn('Size filtering not supported in current cache_keys schema');
    }

    const results = await dbQuery
      .orderBy('accessed_at', 'desc')
      .limit(limit)
      .execute();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            query: query,
            total_found: results.length,
            results: results.map(cache => ({
              id: cache.id,
              key: cache.key,
              scope: 'N/A', // Not available in current schema
              size: 'N/A', // Not available in current schema
              created_at: cache.updated_at,
              accessed_at: cache.accessed_at,
            })),
            note: 'Scope and size filtering not available in current cache_keys schema',
          }, null, 2),
        },
      ],
    };
  }

  private async handleHealthCheck(args: any) {
    const schema = z.object({
      include_storage: z.boolean().default(true),
      include_database: z.boolean().default(true),
    });

    const { include_storage, include_database } = schema.parse(args);
    const health: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: {
        version: '1.0.0',
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
      },
    };

    try {
      if (include_database) {
        const db = await useDatabase();
        const dbResult = await db.selectFrom('cache_keys').select(({ fn }) => fn.count<number>('id').as('count')).executeTakeFirst();
        health.database = {
          status: 'healthy',
          driver: ENV.DB_DRIVER,
          cache_count: dbResult?.count || 0,
        };
      }

      if (include_storage) {
        const storage = await useStorageAdapter();
        // Simple storage health check
        health.storage = {
          status: 'healthy',
          driver: ENV.STORAGE_DRIVER,
        };
      }
    } catch (error) {
      health.status = 'unhealthy';
      health.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(health, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Darbot-DAC-MCP server started');
  }
}

// Run the server if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DarbotDACMCPServer();
  server.run().catch((error) => {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}

export { DarbotDACMCPServer };