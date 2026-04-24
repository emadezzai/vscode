/**
 * Utility functions for the extension
 */

import * as vscode from 'vscode';
import { createHash } from 'crypto';

/**
 * Generate a nonce for Content Security Policy
 */
export function generateNonce(): string {
  const hash = createHash('sha256');
  hash.update(Math.random().toString());
  return hash.digest('base64').substring(0, 32);
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Create a logger wrapper for output channel
 */
export function createLogger(output: vscode.LogOutputChannel): {
  log: (message: string) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
} {
  return {
    log: (message: string) => {
      output.info(message);
      console.log(message);
    },
    info: (message: string, ...args: any[]) => output.info(message, ...args),
    warn: (message: string, ...args: any[]) => output.warn(message, ...args),
    error: (message: string, ...args: any[]) => output.error(message, ...args)
  };
}

/**
 * Convert Windows path to Unix-style path
 */
export function toUnixPath(filePath: string): string {
  if (!filePath.includes('\\')) return filePath;
  
  if (filePath.startsWith('\\\\')) {
    return '/' + filePath.substring(2).replace(/\\/g, '/');
  }
  
  if (/^[a-zA-Z]:/.test(filePath)) {
    filePath = filePath.replace(/^([a-zA-Z]):/, (_, letter) => '/' + letter.toLowerCase() + ':');
  }
  
  return filePath.replace(/\\/g, '/');
}

/**
 * Parse environment variables from string
 */
export function parseEnvVars(input: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = input.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmed.split('=');
    if (key) {
      result[key] = valueParts.join('=').trim();
    }
  }
  
  return result;
}

/**
 * Check if value is truthy (handles "1", "true", "yes", "on")
 */
export function isTruthy(value: unknown): boolean {
  if (!value) return false;
  if (typeof value === 'boolean') return value;
  
  const normalized = String(value).toLowerCase().trim();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

/**
 * Get the shell PATH environment variable name
 * Handles Windows "Path" vs POSIX "PATH"
 */
export function getPathEnvName(env: NodeJS.ProcessEnv = process.env): string {
  if (process.platform !== 'win32') return 'PATH';
  
  return Object.keys(env).reverse().find(
    key => key.toUpperCase() === 'PATH'
  ) || 'Path';
}
