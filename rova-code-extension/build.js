#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT_DIR = path.join(__dirname, 'out');

// AI-Agent CLI path
const AI_AGENT_CLI = '/Users/emad/Documents/AI-Agent/dist/cli.js';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function patchBundledCliFlush(cliPath) {
  let content = fs.readFileSync(cliPath, 'utf8');
  const original = `function cliOk(msg) {
  if (msg) process.stdout.write(msg + "\\n");
  process.exit(0);
  return void 0;
}`;
  const patched = `function cliOk(msg) {
  if (!msg) {
    process.exit(0);
    return void 0;
  }
  process.stdout.write(msg + "\\n", () => process.exit(0));
  return void 0;
}`;

  if (content.includes(original)) {
    content = content.replace(original, patched);
    fs.writeFileSync(cliPath, content);
  } else if (!content.includes('process.stdout.write(msg + "\\n", () => process.exit(0))')) {
    throw new Error(`Could not patch CLI stdout flush in: ${cliPath}`);
  }
}

function patchWebviewSlashCommands(webviewIndex) {
  let content = fs.readFileSync(webviewIndex, 'utf8');

  const loginAlias =
    'Z.commandRegistry.registerAction({id:"login-alias",label:"/login",description:"Log in with a different account",filterOnly:!0},"Settings",()=>{Z.showLogin()})';
  const accountAlias =
    'Z.commandRegistry.registerAction({id:"account-alias",label:"/account",description:"Switch account / provider",filterOnly:!0},"Settings",()=>{let x=$.activeSession.value?.sessionId.value,$1=[];if(x)$1.push("--resume",x);Z.openClaudeInTerminal("/account",$1,"bottom")})';

  if (!content.includes(loginAlias)) {
    throw new Error('Could not find /login command registration in webview bundle');
  }

  if (!content.includes('id:"account-alias"')) {
    content = content.replace(loginAlias, `${loginAlias},${accountAlias}`);
    fs.writeFileSync(webviewIndex, content);
  }

  const patched = fs.readFileSync(webviewIndex, 'utf8');
  if (!patched.includes('id:"account-alias"') || !patched.includes('openClaudeInTerminal("/account"')) {
    throw new Error('Webview bundle does not include the /account slash command');
  }
}

function patchWelcomeProviderLogin(webviewIndex) {
  let content = fs.readFileSync(webviewIndex, 'utf8');

  const original =
    'return B7.useEffect(()=>{if(X){let Q=Math.floor(Math.random()*Z.length);Y(Z[Q])}else Y(Ho1)},[Z,X]),B7.default.createElement("div",{className:r$.container},B7.default.createElement(Uz,{width:46,height:45}),B7.default.createElement("div",{className:r$.messageContainer},B7.default.createElement("div",{className:r$.message},J.text)))}';
  const patched =
    'let Q=[["Claude.ai","--claudeai"],["Console","--console"],["Cline","--cline"],["OpenCode","--opencode"],["KiloCode","--kilocode"],["ChatGPT","--chatgpt"],["MiniMax","--minimax"]],G=(q)=>{$.openClaudeInTerminal(void 0,["auth","login",q],"bottom")};return B7.useEffect(()=>{if(X){let q=Math.floor(Math.random()*Z.length);Y(Z[q])}else Y(Ho1)},[Z,X]),B7.default.createElement("div",{className:r$.container},B7.default.createElement(Uz,{width:46,height:45}),B7.default.createElement("div",{className:r$.messageContainer},B7.default.createElement("div",{className:r$.message},J.text),B7.default.createElement("div",{style:{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"6px",marginTop:"12px",maxWidth:"520px"}},Q.map(([q,z])=>B7.default.createElement("button",{key:z,type:"button",onClick:()=>G(z),title:`Run claude auth login ${z}`,style:{font:"inherit",fontSize:"11px",lineHeight:"16px",color:"var(--app-primary-foreground)",background:"var(--app-input-background)",border:"1px solid var(--app-input-border)",borderRadius:"4px",padding:"3px 7px",cursor:"pointer"}},q))))) }';

  if (!content.includes(original)) {
    if (!content.includes('Run claude auth login')) {
      throw new Error('Could not find welcome message render block in webview bundle');
    }
    return;
  }

  content = content.replace(original, patched);
  fs.writeFileSync(webviewIndex, content);
}

function patchPluginDialogOrdering(webviewIndex) {
  let content = fs.readFileSync(webviewIndex, 'utf8');

  const tabBadgeOriginal =
    ',"Plugins",W.length>0&&l1.default.createElement("span",{className:E0.tabBadge},W.length))';
  const tabBadgePatched =
    ',"Plugins",(W.length+H.length)>0&&l1.default.createElement("span",{className:E0.tabBadge},W.length+H.length))';
  if (content.includes(tabBadgeOriginal)) {
    content = content.replace(tabBadgeOriginal, tabBadgePatched);
  } else if (!content.includes('W.length+H.length')) {
    throw new Error('Could not find plugin tab badge in webview bundle');
  }

  content = content.replace(
    'placeholder:"Search plugins…"',
    'placeholder:"Search available plugins…"'
  );

  const installedAnchor =
    'z0&&l1.default.createElement(l1.default.Fragment,null,l1.default.createElement("div",{className:E0.sectionHeader},"Installed")';
  const availableAnchor =
    'W5&&l1.default.createElement(l1.default.Fragment,null,l1.default.createElement("div",{className:E0.sectionHeader},"Available")';
  const installedStart = content.indexOf(installedAnchor);
  const availableStart = installedStart === -1 ? -1 : content.indexOf(availableAnchor, installedStart);
  const sectionEnd = availableStart === -1 ? -1 : content.indexOf('},Q8=async()=>', availableStart);
  if (installedStart !== -1 && availableStart !== -1 && sectionEnd !== -1) {
    const installedBlock = content.slice(installedStart, availableStart);
    const availableBlock = content.slice(availableStart, sectionEnd);
    content =
      content.slice(0, installedStart) +
      availableBlock +
      installedBlock +
      content.slice(sectionEnd);
  } else if (!content.includes('},"Available"),l1.default.createElement("ul",{className:E0.pluginList},L7.map')) {
    throw new Error('Could not reorder plugin dialog sections in webview bundle');
  }

  // Keep comma separation between adjacent conditional JSX expressions after reordering.
  content = content.replaceAll(')}))))z0&&', ')})))),z0&&');
  // Fix malformed delimiter introduced by block swap near plugin operations.
  content = content.replaceAll('))),},Q8=async()=>', '))),Q8=async()=>');
  // Ensure minified function boundary remains valid after in-place section rewrites.
  content = content.replaceAll('I9())))}var ', 'I9())))};var ');

  fs.writeFileSync(webviewIndex, content);
}

function patchExtensionAutoDir(extensionIndex) {
  let content = fs.readFileSync(extensionIndex, 'utf8');

  content = content.replaceAll('<html lang="en">', '<html lang="en" dir="auto">');
  content = content.replaceAll('<body>', '<body dir="auto">');
  content = content.replaceAll('<div id="root"${', '<div id="root" dir="auto"${');

  const cssAnchor = `          #claude-error:empty {
            min-width: 1px;
            min-height: 1px;
            opacity: 0;
            margin: 0;
            overflow: hidden;
          }`;
  const cssPatch = `${cssAnchor}
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
          [data-testid="assistant-message"],
          [data-testid="user-message"] {
            text-align: start;
          }
          [data-testid="assistant-message"][dir="rtl"],
          [data-testid="user-message"][dir="rtl"] {
            direction: rtl;
            text-align: right;
          }
          [data-testid="assistant-message"][dir="ltr"],
          [data-testid="user-message"][dir="ltr"] {
            direction: ltr;
            text-align: left;
          }
          .placeholder_q4zSJA {
            text-align: start;
            left: 8px;
            right: auto;
          }
          .placeholder_q4zSJA[dir="rtl"] {
            direction: rtl;
            text-align: right;
            right: 8px;
            left: auto;
          }
          .placeholder_q4zSJA[dir="ltr"] {
            direction: ltr;
            text-align: left;
            left: 8px;
            right: auto;
          }`;
  if (content.includes(cssAnchor) && !content.includes('messageInput_cKsPxg[dir="rtl"]')) {
    content = content.replace(cssAnchor, cssPatch);
  }

  const scriptAnchor = `          window.IS_SESSION_LIST_ONLY = \${H ? "true" : "false"}
        </script>`;
  const scriptPatch = `          window.IS_SESSION_LIST_ONLY = \${H ? "true" : "false"}
        </script>
        <script nonce="\${U}">
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
            const inputContainerSelector = '.messageInputContainer_cKsPxg, .inputContainer_cKsPxg, .inputWrapper_cKsPxg';
            const rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
            const syncInputChrome = (node, dir) => {
              if (!(node instanceof Element)) return;
              const container = node.closest?.(inputContainerSelector);
              if (!container) return;
              const normalizedDir = dir === 'rtl' || dir === 'ltr' ? dir : 'auto';
              container.querySelectorAll?.('.messageInput_cKsPxg, .mentionMirror_cKsPxg, .placeholder_q4zSJA')
                .forEach((element) => element.setAttribute('dir', normalizedDir));
            };
            const syncDirection = (node) => {
              if (!(node instanceof Element)) return;
              const source = node.matches?.('.mentionMirror_cKsPxg')
                ? (node.closest?.(inputContainerSelector)?.querySelector('.messageInput_cKsPxg') ?? node)
                : node;
              const text = ((source.value ?? source.textContent) || '').trim();
              if (!text) {
                node.setAttribute('dir', 'auto');
                syncInputChrome(node, 'auto');
                return;
              }
              const dir = rtlPattern.test(text) ? 'rtl' : 'ltr';
              node.setAttribute('dir', dir);
              syncInputChrome(node, dir);
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
              const container = target.closest?.(inputContainerSelector);
              if (!container) return;
              const primaryInput = container.querySelector?.('.messageInput_cKsPxg, [contenteditable="true"][role="textbox"]');
              if (primaryInput) syncDirection(primaryInput);
              else container.querySelectorAll?.(rtlSensitiveSelector).forEach(syncDirection);
            }, true);
            new MutationObserver((mutations) => {
              for (const mutation of mutations) {
                for (const node of mutation.addedNodes) applyAutoDir(node);
              }
            }).observe(document.documentElement, { childList: true, subtree: true });
          })();
        </script>`;
  if (content.includes(scriptAnchor) && !content.includes('applyAutoDir')) {
    content = content.replace(scriptAnchor, scriptPatch);
  }

  if (!content.includes('<html lang="en" dir="auto">') || !content.includes('<body dir="auto">') || !content.includes('applyAutoDir')) {
    throw new Error('Could not apply automatic RTL/LTR direction patch to extension HTML');
  }

  fs.writeFileSync(extensionIndex, content);
}

function build() {
  console.log('Building Rova Code Extension...');

  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true });
  ensureDir(OUT_DIR);

  copyDir(path.join(__dirname, 'webview'), path.join(OUT_DIR, 'webview'));
  copyDir(path.join(__dirname, 'resources'), path.join(OUT_DIR, 'resources'));

  // Force the extension to use the bundled AI-Agent CLI JS entrypoint.
  const bundledCliDirs = [
    path.join(__dirname, 'resources', 'claude-code'),
    path.join(OUT_DIR, 'resources', 'claude-code'),
  ];
  if (!fs.existsSync(AI_AGENT_CLI)) {
    throw new Error(`AI-Agent CLI not found at: ${AI_AGENT_CLI}`);
  }
  for (const dir of bundledCliDirs) {
    ensureDir(dir);
    fs.copyFileSync(AI_AGENT_CLI, path.join(dir, 'cli.js'));
    patchBundledCliFlush(path.join(dir, 'cli.js'));
  }

  // Safety check: ensure bundled CLI contains the /account command.
  const bundledCliContent = fs.readFileSync(path.join(__dirname, 'resources', 'claude-code', 'cli.js'), 'utf8');
  if (!bundledCliContent.includes('/account')) {
    throw new Error(`Bundled AI-Agent CLI does not include /account: ${AI_AGENT_CLI}`);
  }

  // Remove native binaries so runtime always falls back to resources/claude-code/cli.js.
  const nativeBinaryDirs = [
    path.join(__dirname, 'resources', 'native-binary'),
    path.join(__dirname, 'resources', 'native-binaries'),
    path.join(OUT_DIR, 'resources', 'native-binary'),
    path.join(OUT_DIR, 'resources', 'native-binaries'),
  ];
  for (const nativeBinaryDir of nativeBinaryDirs) {
    if (fs.existsSync(nativeBinaryDir)) {
      fs.rmSync(nativeBinaryDir, { recursive: true, force: true });
    }
  }

  fs.copyFileSync(path.join(__dirname, 'extension.js'), path.join(OUT_DIR, 'extension.js'));
  
  fs.copyFileSync(path.join(__dirname, 'package.json'), path.join(OUT_DIR, 'package.json'));

  // NOTE: Webview minified bundle patches are disabled because they are brittle
  // and can corrupt the bundle syntax during rebuilds.
  patchExtensionAutoDir(path.join(__dirname, 'extension.js'));
  patchExtensionAutoDir(path.join(OUT_DIR, 'extension.js'));
  
  console.log('Build complete. Output in out/');
  console.log('Package: npm run package');
}

build();
