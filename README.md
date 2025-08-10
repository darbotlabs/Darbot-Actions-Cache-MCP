# 🚀 DAR-ACT-Cache (Darbot Action Runner Cache Server)

A high-performance, self-hosted cache server for GitHub Actions runners. DAR-ACT-Cache is a drop-in replacement for the official GitHub hosted cache server, fully compatible with the official `actions/cache` action.

## Features

- 🔥 **100% Compatible** - Works seamlessly with the official `actions/cache` action
- 📦 **Multiple Storage Backends** - Support for filesystem, S3, GCS, and more
- 🔒 **Secure & Self-Hosted** - Complete control over your cache data
- ⚡ **High Performance** - Optimized for speed with clustering support
- �️ **Easy Management** - Simple CLI tools via `darbot-act` commands

## Quick Start

### Using Docker Compose

```yaml
services:
  dar-act-cache:
    image: ghcr.io/darbotlabs/dar-act-cache:latest
    ports:
      - '3000:3000'
    environment:
      DAR_ACT_BASE_URL: http://localhost:3000
    volumes:
      - dar-cache-data:/app/.data

volumes:
  dar-cache-data:
```

## Configuration

Configure your GitHub Actions runners to use DAR-ACT-Cache by setting the `ACTIONS_CACHE_URL` environment variable:

```yaml
ACTIONS_CACHE_URL=http://your-darbot-host:3000/
```

## Documentation

📚 Full documentation available at: <https://github.com/darbotlabs/darbot-actions-cache-mcp>
