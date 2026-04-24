/**
 * WebviewProvider - Manages Claude Code Webview Panels and Views
 * 
 * Deconstructed from kT class in original extension
 */

import * as vscode from 'vscode';
import { AuthManager } from './authManager.js';
import { SettingsManager } from './settingsManager.js';
import { FileSystemProvider, ReadOnlyFileProvider } from './fileProviders.js';
import { generateNonce, escapeHtml } from './utils.js';

export class WebviewProvider implements vscode.WebviewViewProvider {
  private extensionUri: vscode.Uri;
  private context: vscode.ExtensionContext;
  private output: vscode.LogOutputChannel;
  private settings: SettingsManager;
  private leftProvider: FileSystemProvider;
  private rightProvider: FileSystemProvider;
  private readOnlyProvider: ReadOnlyFileProvider;
  private acceptOrRejectDiffs: any;
  private atMentionEvents: vscode.Event<string>;
  private selectionChangedEvents: vscode.EventEmitter<void>;
  private getSelection: () => any;
  
  private webviews = new Set<vscode.Webview>();
  private sessionPanels = new Map<string, vscode.WebviewPanel>();
  private activeSessionId?: string;
  private authManager: AuthManager;
  private disposables: vscode.Disposable[] = [];

  constructor(
    extensionUri: vscode.Uri,
    context: vscode.ExtensionContext,
    output: vscode.LogOutputChannel,
    settings: SettingsManager,
    leftProvider: FileSystemProvider,
    rightProvider: FileSystemProvider,
    readOnlyProvider: ReadOnlyFileProvider,
    acceptOrRejectDiffs: any,
    atMentionEvents: vscode.Event<string>,
    selectionChangedEvents: vscode.EventEmitter<void>,
    getSelection: () => any
  ) {
    this.extensionUri = extensionUri;
    this.context = context;
    this.output = output;
    this.settings = settings;
    this.leftProvider = leftProvider;
    this.rightProvider = rightProvider;
    this.readOnlyProvider = readOnlyProvider;
    this.acceptOrRejectDiffs = acceptOrRejectDiffs;
    this.atMentionEvents = atMentionEvents;
    this.selectionChangedEvents = selectionChangedEvents;
    this.getSelection = getSelection;
    this.authManager = new AuthManager(output, settings);
  }

  /**
   * Check if any webview is currently visible
   */
  hasVisibleWebview(): boolean {
    for (const webview of this.webviews) {
      if ((webview as any).visible) return true;
    }
    return false;
  }

  /**
   * Resolve webview view (sidebar)
   */
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.webviews.add(webviewView.webview);
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'webview'),
        vscode.Uri.joinPath(this.extensionUri, 'resources')
      ]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview, undefined, undefined, true);
    webviewView.show(true);
  }

  /**
   * Resolve session list view
   */
  resolveSessionListView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'webview'),
        vscode.Uri.joinPath(this.extensionUri, 'resources')
      ]
    };
    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview, undefined, undefined, false, false, true);
  }

  /**
   * Setup existing panel
   */
  setupPanel(
    panel: vscode.WebviewPanel,
    initialSession?: string,
    initialPrompt?: string,
    isFullEditor?: boolean
  ): void {
    panel.webview.html = this.getHtmlForWebview(
      panel.webview,
      initialSession,
      initialPrompt,
      false,
      isFullEditor
    );
  }

  /**
   * Create new panel
   */
  createPanel(
    initialSession?: string,
    initialPrompt?: string,
    viewColumn?: vscode.ViewColumn
  ): { panel: vscode.WebviewPanel; startedInNewColumn: boolean } {
    const panel = vscode.window.createWebviewPanel(
      'rovaVSCodePanel',
      'Rova Code',
      viewColumn ?? vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.extensionUri, 'webview'),
          vscode.Uri.joinPath(this.extensionUri, 'resources')
        ]
      }
    );

    panel.webview.html = this.getHtmlForWebview(
      panel.webview,
      initialSession,
      initialPrompt,
      false,
      true
    );

    return { panel, startedInNewColumn: true };
  }

  /**
   * Generate HTML for webview
   */
  private getHtmlForWebview(
    webview: vscode.Webview,
    initialSession?: string,
    initialPrompt?: string,
    isSidebar: boolean = false,
    isFullEditor: boolean = false,
    isSessionListOnly: boolean = false
  ): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'webview', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'webview', 'index.css')
    );

    const nonce = generateNonce();
    const authStatus = this.authManager.getAuthStatus();
    const cspSource = webview.cspSource;

    // Get font configuration
    const chatEditorConfig = vscode.workspace.getConfiguration('chat.editor');
    const chatConfig = vscode.workspace.getConfiguration('chat');
    
    const editorFontFamily = chatEditorConfig.get<string>('fontFamily') ?? 'monospace';
    const editorFontSize = chatEditorConfig.get<number>('fontSize') ?? 12;
    const editorFontWeight = chatEditorConfig.get<string>('fontWeight') ?? 'normal';
    const chatFontSize = chatConfig.get<number>('fontSize') ?? 13;
    const chatFontFamily = chatConfig.get<string>('fontFamily') ?? "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";

    return `<!DOCTYPE html>
<html lang="en" dir="auto">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'none'; 
                 style-src ${cspSource} 'unsafe-inline'; 
                 font-src ${cspSource}; 
                 img-src ${cspSource} data:; 
                 script-src 'nonce-${nonce}'; 
                 worker-src ${cspSource};">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri}" rel="stylesheet">
  <style>
    :root {
      --vscode-editor-font-family: ${editorFontFamily} !important;
      --vscode-editor-font-size: ${editorFontSize}px !important;
      --vscode-editor-font-weight: ${editorFontWeight} !important;
      --vscode-chat-font-size: ${chatFontSize}px;
      --vscode-chat-font-family: ${chatFontFamily};
    }
    #rova-error {
      max-height: 30vh;
      overflow: auto;
    }
    #rova-error:empty {
      min-width: 1px;
      min-height: 1px;
      opacity: 0;
      margin: 0;
      overflow: hidden;
    }
    input,
    textarea,
    [contenteditable="true"],
    [role="textbox"],
    [data-testid="assistant-message"],
    [data-testid="user-message"],
    .messageInput_cKsPxg,
    .mentionMirror_cKsPxg,
    .root_-a7MRw,
    .userMessage_07S1Yg,
    .pluginDescription_yumWmQ,
    .pluginName_yumWmQ {
      unicode-bidi: plaintext;
    }
    .messageInput_cKsPxg,
    .mentionMirror_cKsPxg {
      text-align: start;
    }
    .messageInput_cKsPxg[dir="rtl"],
    .mentionMirror_cKsPxg[dir="rtl"] {
      direction: rtl;
      text-align: right;
    }
    .messageInput_cKsPxg[dir="ltr"],
    .mentionMirror_cKsPxg[dir="ltr"] {
      direction: ltr;
      text-align: left;
    }
  </style>
</head>
<body dir="auto">
  <pre id="rova-error"></pre>
  <div id="root" dir="auto"
    ${initialPrompt ? `data-initial-prompt="${escapeHtml(initialPrompt)}"` : ''}
    ${initialSession ? `data-initial-session="${escapeHtml(initialSession)}"` : ''}
    ${authStatus ? `data-initial-auth-status="${escapeHtml(JSON.stringify(authStatus))}"` : ''}>
  </div>
  <script nonce="${nonce}">
    window.IS_SIDEBAR = ${isSidebar ? 'true' : 'false'}
    window.IS_FULL_EDITOR = ${isFullEditor ? 'true' : 'false'}
    window.IS_SESSION_LIST_ONLY = ${isSessionListOnly ? 'true' : 'false'}
  </script>
  <script nonce="${nonce}">
    (() => {
      const selector = [
        'input[type="text"]',
        'input:not([type])',
        'textarea',
        '[contenteditable="true"]',
        '[role="textbox"]',
        '[data-testid="assistant-message"]',
        '[data-testid="user-message"]',
        '.messageInput_cKsPxg',
        '.mentionMirror_cKsPxg',
        'p',
        'li',
        'pre',
        'code',
        'blockquote',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6'
      ].join(',');
      const rtlSensitiveSelector = [
        '.messageInput_cKsPxg',
        '.mentionMirror_cKsPxg',
        '[contenteditable="true"][role="textbox"]'
      ].join(',');
      const rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
      const syncDirection = (node) => {
        if (!(node instanceof Element)) return;
        const text = ((node.value ?? node.textContent) || '').trim();
        if (!text) {
          node.setAttribute('dir', 'auto');
          return;
        }
        node.setAttribute('dir', rtlPattern.test(text) ? 'rtl' : 'ltr');
      };
      const applyAutoDir = (root = document) => {
        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
        const element = root.nodeType === Node.ELEMENT_NODE ? root : null;
        if (element?.matches?.(selector)) element.setAttribute('dir', 'auto');
        root.querySelectorAll?.(selector).forEach((node) => node.setAttribute('dir', 'auto'));
        if (element?.matches?.(rtlSensitiveSelector)) syncDirection(element);
        root.querySelectorAll?.(rtlSensitiveSelector).forEach(syncDirection);
      };
      applyAutoDir();
      document.addEventListener('input', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.matches?.(rtlSensitiveSelector)) syncDirection(target);
        const container = target.closest?.('.messageInputContainer_cKsPxg, .inputContainer_cKsPxg, .inputWrapper_cKsPxg');
        container?.querySelectorAll?.(rtlSensitiveSelector).forEach(syncDirection);
      }, true);
      new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) applyAutoDir(node);
        }
      }).observe(document.documentElement, { childList: true, subtree: true });
    })();
  </script>
  <script nonce="${nonce}" src="${scriptUri}" type="module"></script>
</body>
</html>`;
  }

  /**
   * Notify font configuration changes
   */
  notifyFontConfigurationChange(): void {
    for (const webview of this.webviews) {
      // Reload HTML to apply new font settings
      // In practice, the webview handles this via postMessage
    }
  }

  /**
   * Notify create new conversation
   */
  notifyCreateNewConversation(): void {
    // Broadcast to all webviews
    for (const webview of this.webviews) {
      webview.postMessage({ type: 'newConversation' });
    }
  }

  /**
   * Notify toggle dictation
   */
  notifyToggleDictation(): void {
    for (const webview of this.webviews) {
      webview.postMessage({ type: 'toggleDictation' });
    }
  }

  /**
   * Logout and clear auth
   */
  async logout(): Promise<boolean> {
    return this.authManager.logout();
  }

  /**
   * Notify logout to webviews
   */
  async notifyLogout(): Promise<void> {
    for (const webview of this.webviews) {
      webview.postMessage({ type: 'logout' });
    }
  }

  dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.webviews.clear();
    this.sessionPanels.clear();
  }
}
