# 🚀 Darbot Actions Cache (DAC)

A high-performance, self-hosted cache server for GitHub Actions runners with integrated MCP (Model Context Protocol) support. DAC is a drop-in replacement for the official GitHub hosted cache server, fully compatible with the official `actions/cache` action.

## Features

- 🔥 **100% Compatible** - Works seamlessly with the official `actions/cache` action
- 📦 **Multiple Storage Backends** - Support for filesystem, S3, GCS, and more
- 🔒 **Secure & Self-Hosted** - Complete control over your cache data
- ⚡ **High Performance** - Optimized for speed with clustering support
- 🛠️ **Easy Management** - Simple CLI tools via `darbot-dac` commands
- 🔗 **MCP Integration** - Full Model Context Protocol server for AI/LLM integrations
- 🏗️ **Production Ready** - Comprehensive monitoring, logging, and health checks

## Quick Start

### Using Docker Compose

```yaml
services:
  darbot-dac:
    image: ghcr.io/darbotlabs/darbot-actions-cache-mcp:latest
    ports:
      - '3000:3000'
    environment:
      DAC_BASE_URL: http://localhost:3000
    volumes:
      - dac-cache-data:/app/.data

volumes:
  dac-cache-data:
```

## Configuration

Configure your GitHub Actions runners to use DAC by setting the `ACTIONS_CACHE_URL` environment variable:

```yaml
ACTIONS_CACHE_URL=http://your-darbot-host:3000/
```

## MCP Server (Darbot-DAC-MCP)

DAC includes a complete Model Context Protocol server for AI/LLM integrations:

### Available MCP Tools

- `dac_list_caches` - List cache entries with filtering
- `dac_get_cache` - Get detailed cache information  
- `dac_delete_cache` - Delete specific cache entries
- `dac_prune_caches` - Remove old caches with dry-run support
- `dac_get_stats` - Get usage statistics and metrics
- `dac_search_caches` - Advanced cache search functionality
- `dac_health_check` - System health monitoring

### Starting MCP Server

```bash
# Via CLI
darbot-dac mcp

# Direct binary
darbot-dac-mcp
```

## CLI Commands

```bash
# Cache management
darbot-dac cache --start
darbot-dac cache --prune 30
darbot-dac cache --status

# Statistics and monitoring
darbot-dac stats --live
darbot-dac health --verbose

# Configuration
darbot-dac config --show
darbot-dac config --validate

# Storage management
darbot-dac storage --list
darbot-dac storage --test filesystem

# Start MCP server
darbot-dac mcp
```

## Documentation

📚 Full documentation available at: <https://github.com/darbotlabs/Darbot-Actions-Cache-MCP>
