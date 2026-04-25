/**
 * Settings Manager - Handles extension configuration
 * 
 * Deconstructed from lY class in original extension
 */

import * as vscode from 'vscode';

interface EnvironmentVariable {
  name: string;
  value: string;
}

export class SettingsManager {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Get preferred location (sidebar or panel)
   */
  getPreferredLocation(): 'sidebar' | 'panel' {
    return vscode.workspace.getConfiguration('rovaCode').get('preferredLocation') ?? 'panel';
  }

  /**
   * Set preferred location
   */
  async setPreferredLocation(location: 'sidebar' | 'panel'): Promise<void> {
    await vscode.workspace.getConfiguration('rovaCode').update('preferredLocation', location, true);
  }

  /**
   * Get environment variables configuration
   */
  getEnvironmentVariables(): EnvironmentVariable[] {
    return vscode.workspace.getConfiguration('rovaCode').get('environmentVariables') ?? [];
  }

  /**
   * Check if using terminal mode instead of native UI
   */
  isUseTerminal(): boolean {
    return vscode.workspace.getConfiguration('rovaCode').get('useTerminal') ?? false;
  }

  /**
   * Check if dangerously skip permissions mode is allowed
   */
  isAllowDangerouslySkipPermissions(): boolean {
    return vscode.workspace.getConfiguration('rovaCode').get('allowDangerouslySkipPermissions') ?? false;
  }

  /**
   * Get custom Claude process wrapper path
   */
  getClaudeProcessWrapper(): string | undefined {
    return vscode.workspace.getConfiguration('rovaCode').get('claudeProcessWrapper');
  }

  /**
   * Check if respecting .gitignore
   */
  isRespectGitIgnore(): boolean {
    return vscode.workspace.getConfiguration('rovaCode').get('respectGitIgnore') ?? true;
  }

  /**
   * Get initial permission mode
   */
  getInitialPermissionMode(): string {
    return vscode.workspace.getConfiguration('rovaCode').get('initialPermissionMode') ?? 'default';
  }

  /**
   * Check if login prompt is disabled
   */
  isDisableLoginPrompt(): boolean {
    return vscode.workspace.getConfiguration('rovaCode').get('disableLoginPrompt') ?? false;
  }

  /**
   * Check if autosave is enabled
   */
  isAutosave(): boolean {
    return vscode.workspace.getConfiguration('rovaCode').get('autosave') ?? true;
  }

  /**
   * Check if using Ctrl+Enter to send
   */
  isUseCtrlEnterToSend(): boolean {
    return vscode.workspace.getConfiguration('rovaCode').get('useCtrlEnterToSend') ?? false;
  }

  /**
   * Check if new conversation shortcut is enabled
   */
  isEnableNewConversationShortcut(): boolean {
    return vscode.workspace.getConfiguration('rovaCode').get('enableNewConversationShortcut') ?? false;
  }

  /**
   * Check if onboarding is hidden
   */
  isHideOnboarding(): boolean {
    return vscode.workspace.getConfiguration('rovaCode').get('hideOnboarding') ?? false;
  }

  /**
   * Check if Python environment should be used
   */
  isUsePythonEnvironment(): boolean {
    return vscode.workspace.getConfiguration('rovaCode').get('usePythonEnvironment') ?? true;
  }

  /**
   * Migrate all settings (handles version migrations)
   */
  migrateAllSettings(): void {
    // Migration logic for settings across versions
    // Currently no migrations needed for initial version
  }
}
