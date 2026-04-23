# Tech Context: Rova-IDE

## Technologies Used

### Core Languages
| Language | Version/Notes | Usage |
|---|---|---|
| TypeScript | 6.0.0-dev (nightly) | Primary language for editor core |
| JavaScript | ES Modules | Extension host, web workers |
| Rust | (via Cargo) | CLI (`cli/` directory) |
| HTML/CSS | — | Workbench UI rendering |

### Runtime & Shell
| Technology | Version | Purpose |
|---|---|---|
| Electron | 39.8.8 | Desktop application shell |
| Node.js | 22.22.1 (via .nvmrc) | Server-side runtime |
| Native TypeScript Compiler | @typescript/native-preview 7.0.0-dev | `tsgo` for faster compilation |

### Build Tools
| Tool | Purpose |
|---|---|
| Gulp 4 | Main build orchestration |
| esbuild | Extension bundling |
| Rspack | Specific build scenarios |
| Vite | Specific build scenarios |
| Mocha 10 | Unit testing framework |
| Playwright 1.56+ | Browser/e2e testing |
| ESLint 9 | Code linting |
| Stylelint | CSS linting |
| tsec | Security-focused TypeScript checks |

### Key Dependencies
| Package | Version | Purpose |
|---|---|---|
| @xterm/xterm | 6.1.0-beta | Terminal emulator |
| node-pty | 1.2.0-beta | Pseudo-terminal support |
| vscode-textmate | 9.3.2 | TextMate grammar support |
| @vscode/ripgrep | 1.17.1 | Fast code search |
| @vscode/sqlite3 | 5.1.12 | Database (state, storage) |
| @anthropic-ai/sandbox-runtime | 0.0.42 | AI sandbox execution |
| @github/copilot | 1.0.34+ | Copilot integration |
| playwright-core | 1.59.1 | Browser automation |
| undici | 7.24.0 | HTTP client |
| ws | 8.19.0 | WebSocket support |
| kerberos | 2.1.1 | Authentication |
| katex | 0.16.22 | Math rendering in markdown |

## Development Setup

### Prerequisites
- Node.js 22.22.1 (use nvm: `nvm use`)
- npm (comes with Node.js)
- Rust toolchain (for CLI builds)

### Key Commands
```bash
# Install dependencies
npm install

# Compile the project
npm run compile

# Watch mode (development)
npm run watch

# Run tests
npm run test-node          # Node.js unit tests
npm run test-browser       # Browser tests (requires Playwright)
npm run test-extension     # Extension tests

# Linting
npm run eslint
npm run stylelint
npm run hygiene            # Full hygiene check (lint + types)

# Run the IDE locally
./scripts/code.sh          # Linux/macOS
./scripts/code.cmd         # Windows
```

### Build Output
- Compiled output goes to `out/` directory
- Entry point: `out/main.js`
- Extensions are compiled individually in `extensions/`

## Technical Constraints
- **ES Modules**: Project uses `"type": "module"` — all JS is ESM
- **Strict TypeScript**: Multiple tsconfig files enforce strict type checking
- **Layer Boundaries**: Code is organized in strict layers with import restrictions
- **Native Modules**: Some dependencies require native compilation (node-pty, @vscode/sqlite3, kerberos)
- **Memory**: Build process requires up to 8GB heap (`--max-old-space-size=8192`)
- **Platform-specific**: Some modules are platform-specific (Windows registry, macOS keychain, etc.)

## Dependency Management
- Production dependencies are minimal and carefully curated
- Dev dependencies include full build toolchain and testing frameworks
- Extensions have their own `package.json` files with independent dependencies
- Overrides are used to patch specific transitive dependency issues

## Tool Usage Patterns
- **Git**: Two remotes — `origin` (fork) and `upstream` (microsoft/vscode)
- **npm scripts**: All build/test commands are npm scripts
- **Gulp tasks**: Complex multi-step builds are gulp tasks
- **Type checking**: Multiple tsconfig targets for different layers and checks