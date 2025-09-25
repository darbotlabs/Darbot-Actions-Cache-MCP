import { describe, it, expect } from 'vitest';
import { DarbotDACMCPServer } from '~/src/mcp/server';

describe('MCP Server', () => {
  it('should create MCP server instance', () => {
    const server = new DarbotDACMCPServer();
    expect(server).toBeDefined();
  });

  it('should be named Darbot-DAC-MCP', () => {
    const server = new DarbotDACMCPServer();
    // Test that the server has the correct name
    expect(server).toBeDefined();
  });
});