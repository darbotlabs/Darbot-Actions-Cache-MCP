#!/usr/bin/env ts-node

import { execSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('Building CLI and MCP server...');

// Ensure dist directories exist
mkdirSync('dist/cli', { recursive: true });
mkdirSync('dist/mcp', { recursive: true });

// Build TypeScript files
execSync('npx tsc --build --force', { stdio: 'inherit' });

// Copy built files to dist
const cliSource = resolve('.nitro/types/src/cli/index.js');
const mcpSource = resolve('.nitro/types/src/mcp/index.js');
const mcpServerSource = resolve('.nitro/types/src/mcp/server.js');

try {
  copyFileSync(cliSource, 'dist/cli/index.js');
  console.log('✓ CLI built successfully');
} catch (error) {
  console.warn('⚠ CLI build failed, skipping');
}

try {
  copyFileSync(mcpSource, 'dist/mcp/index.js');
  copyFileSync(mcpServerSource, 'dist/mcp/server.js');
  console.log('✓ MCP server built successfully');
} catch (error) {
  console.warn('⚠ MCP server build failed, skipping');
}

console.log('Build completed!');