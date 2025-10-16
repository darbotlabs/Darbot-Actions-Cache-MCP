# GitHub Copilot Instructions for Darbot Actions Cache (DAC)

## Project Overview

Darbot Actions Cache (DAC) is a high-performance, self-hosted cache server for GitHub Actions runners with integrated MCP (Model Context Protocol) support. It's a drop-in replacement for the official GitHub hosted cache server, fully compatible with the official `actions/cache` action.

## Architecture

- **Core Server**: Built with Nitro (H3) for high-performance HTTP handling
- **Storage Backends**: Multiple drivers (filesystem, S3, GCS)
- **Database Backends**: Multiple drivers (SQLite, MySQL, PostgreSQL)
- **MCP Server**: Model Context Protocol integration for AI/LLM interactions
- **CLI Tools**: Command-line utilities for cache and system management

## Technology Stack

- **Runtime**: Node.js 22
- **Package Manager**: pnpm 10
- **Language**: TypeScript
- **Framework**: Nitro/H3 for server
- **Testing**: Vitest
- **Linting**: ESLint with @louishaftmann/eslint-config
- **Formatting**: Prettier with @louishaftmann/prettier-config

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm run dev

# Build
pnpm run build

# Type checking
pnpm run type-check

# Linting
pnpm run lint        # Check for errors
pnpm run lint:fix    # Fix errors automatically

# Testing
pnpm run test:run    # Run tests once
pnpm run test:watch  # Watch mode with UI
```

## Code Style and Standards

### TypeScript Guidelines

- Always use TypeScript for new code
- Enable strict type checking
- Avoid using `any` type; use proper types or `unknown`
- Export types for public APIs
- Use type imports when importing only types: `import type { Type } from 'module'`

### Code Quality Rules

- Follow ESLint configuration from `@louishaftmann/eslint-config`
- Use functional programming patterns where appropriate
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for consistency
- Use template literals for string concatenation
- Prefer destructuring for objects and arrays

### Naming Conventions

- Use kebab-case for filenames (except special files like README.md)
- Use PascalCase for classes and types
- Use camelCase for functions and variables
- Use SCREAMING_SNAKE_CASE for constants
- Routes follow H3/Nitro convention in `routes/` directory

### File Organization

```
lib/          - Core library code (database, storage, utilities)
routes/       - HTTP route handlers (H3 format)
plugins/      - Nitro plugins
src/cli/      - CLI implementation
src/mcp/      - MCP server implementation
tests/        - Test files
```

### Imports

- Use named imports when possible
- Import from `lib/` for internal utilities
- Use absolute imports from project root
- Group imports: Node.js built-ins → external packages → internal modules

## Database and Storage

### Database Drivers

Located in `lib/db/drivers/`:

- `sqlite.ts` - SQLite driver (default for development)
- `mysql.ts` - MySQL driver
- `postgres.ts` - PostgreSQL driver

When adding database features:

- Use Kysely query builder for type-safe queries
- Run migrations in `lib/db/migrations.ts`
- Support all three database backends

### Storage Drivers

Located in `lib/storage/drivers/`:

- `filesystem.ts` - Local filesystem storage
- `s3.ts` - AWS S3 compatible storage
- `gcs.ts` - Google Cloud Storage

When adding storage features:

- Implement the storage driver interface
- Handle streaming for large files
- Support multipart uploads for large caches

## Environment Configuration

- Configuration via environment variables in `.env`
- Use `lib/env.ts` for environment variable validation with Zod
- Never commit secrets to source code
- Document all new environment variables in README.md

## Security Best Practices

- Validate all external input with Zod schemas
- Use prepared statements for database queries (Kysely handles this)
- Sanitize file paths to prevent directory traversal
- Implement proper error handling without exposing internal details
- Never log sensitive data (tokens, credentials)
- Use secure headers for HTTP responses

## Testing Guidelines

- Write tests for all new features in `tests/` directory
- Use Vitest for testing
- Test all database and storage drivers
- Include integration tests for API endpoints
- Use testcontainers for database testing
- Maintain test environment files in `tests/.env.*`

### Test Structure

```typescript
import { describe, expect, test } from 'vitest'

describe('Feature Name', () => {
  test('should do something specific', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = someFunction(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

## API Routes

- Follow GitHub Actions cache API specification
- Use H3 utilities for request/response handling
- Return proper HTTP status codes
- Implement error handling middleware
- Use the Twirp protocol for GitHub Actions compatibility

## MCP (Model Context Protocol) Integration

Located in `src/mcp/`:

- Implement tools following MCP SDK patterns
- Expose cache management operations
- Return structured data for AI consumption
- Include health check and statistics tools

## CLI Implementation

Located in `src/cli/`:

- Use Commander.js for CLI framework
- Implement subcommands for different operations
- Provide helpful error messages
- Include `--help` for all commands
- Use Consola for consistent logging

## Logging

- Use Consola for logging (imported from `lib/logger.ts`)
- Log levels: `debug`, `info`, `warn`, `error`
- Don't use `console.log` - use the logger instead
- Include context in log messages
- Avoid logging sensitive information

## Error Handling

- Use try-catch for async operations
- Provide meaningful error messages
- Log errors with appropriate severity
- Don't expose internal errors to API consumers
- Use custom error types when appropriate

## Docker and Deployment

- Dockerfile for containerized deployment
- Docker Compose for local development
- Kubernetes Helm charts in `charts/` directory
- Environment-based configuration
- Health check endpoints

## Documentation

- Update README.md for user-facing changes
- Document new environment variables
- Add JSDoc comments for public APIs
- Include examples for complex features
- Update CLI help text for new commands

## Common Tasks

### Adding a New Storage Driver

1. Create driver file in `lib/storage/drivers/`
2. Implement storage driver interface
3. Add driver to `lib/storage/drivers/index.ts`
4. Add tests in `tests/`
5. Document in README.md

### Adding a New MCP Tool

1. Define tool in `src/mcp/server.ts`
2. Implement tool handler
3. Add to tool list
4. Write tests in `tests/mcp.test.ts`
5. Document in README.md

### Adding a New CLI Command

1. Add command in `src/cli/index.ts`
2. Implement command handler
3. Add help text
4. Write tests
5. Update README.md

## Known Issues (Do Not Fix Unless Assigned)

- Existing linting warnings in `scripts/build-cli.ts`
- Type checking errors in `lib/db/index.ts`, `lib/storage/index.ts`, and `plugins/cleanup.ts`
- YAML linting issues in Helm charts
- Node.js version mismatch warning (wants 22, has 20)

Focus only on the task assigned to you and don't fix unrelated issues.

## Questions?

If you're unsure about implementation details:

- Check existing code for patterns
- Review tests for usage examples
- Ask for clarification rather than guessing
