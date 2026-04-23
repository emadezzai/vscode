# System Patterns: Rova-IDE

## System Architecture
Rova-IDE inherits VS Code's multi-process architecture:

```
┌─────────────────────────────────────────────┐
│                  Main Process                │
│  (Electron main / Node.js)                   │
│  - Window management                         │
│  - File system access                        │
│  - Extension host lifecycle                  │
├─────────────────────────────────────────────┤
│              Renderer Process                │
│  (Electron renderer / Browser)               │
│  - Workbench UI                              │
│  - Editor (Monaco)                           │
│  - Terminal                                  │
├─────────────────────────────────────────────┤
│            Extension Host Process            │
│  (Separate Node.js process)                  │
│  - Extension lifecycle                       │
│  - Language servers                          │
│  - Debug adapters                            │
├─────────────────────────────────────────────┤
│              Server (Remote)                 │
│  (Node.js server for remote scenarios)       │
│  - Remote file system                        │
│  - Remote terminal                           │
└─────────────────────────────────────────────┘
```

## Layered Code Architecture
Source code in `src/vs/` follows strict layering:

1. **`base/`** — Foundational utilities, UI primitives, common types
2. **`platform/`** — Platform services (instantiation, lifecycle, registry, configuration)
3. **`editor/`** — Monaco editor core (standalone, can run without workbench)
4. **`workbench/`** — Full IDE shell (explorer, SCM, debug, terminal, extensions)
5. **`code/`** — Electron-specific glue (main window, menus, update)

**Dependency rule**: Lower layers cannot import from higher layers.

## Key Technical Decisions

### Build System
- **Gulp** orchestrates the build pipeline (`gulpfile.mjs`, `build/gulpfile.*.ts`)
- **TypeScript** compiled via `tsgo` (native TypeScript compiler preview)
- **Electron** v39.8.8 as the desktop shell
- **esbuild** for extension bundling (`extensions/esbuild-extension-common.mts`)
- **Rspack** and **Vite** used for specific build scenarios (`build/rspack/`, `build/vite/`)

### Extension System
- Built-in extensions in `extensions/` directory
- Each extension has its own `package.json` following the VS Code extension manifest
- Language support split into two extension types:
  - Basic: syntax highlighting, snippets (e.g., `extensions/json/`)
  - Language Features: IntelliSense, go-to-def (e.g., `extensions/json-language-features/`)

### Dependency Injection
- VS Code uses a service-based DI pattern via `createDecorator()`
- Services registered with instantiation service
- Constructor injection through `_serviceBrand` pattern

### IPC Communication
- Main ↔ Renderer: Electron IPC (`ipcMain`/`ipcRenderer`)
- Renderer ↔ Extension Host: JSON-RPC over MessagePort
- Remote scenarios: VS Code Server protocol

## Design Patterns in Use
- **Service Locator**: Services accessed via `@IService` decorator pattern
- **Event Bus**: `Event<T>` and `Emitter<T>` for pub/sub
- **Command Pattern**: Actions registered via `CommandsRegistry`
- **Provider Pattern**: Content providers for editors, trees, etc.
- **Factory Pattern**: For creating complex objects (editors, terminals)
- **Disposable Pattern**: `IDisposable` for resource lifecycle management

## Critical Implementation Paths
- **Startup**: `src/main.ts` → `src/vs/code/electron-main/main.ts` → workbench instantiation
- **Extension Loading**: `src/vs/workbench/api/` — bridges extension API to workbench services
- **Editor**: `src/vs/editor/` — standalone Monaco editor
- **Terminal**: `src/vs/workbench/contrib/terminal/` — integrated terminal
- **Debug**: `src/vs/workbench/contrib/debug/` — debug adapter protocol integration
- **SCM/Git**: `src/vs/workbench/contrib/scm/` — source control management
- **Copilot/AI**: `extensions/copilot/` + `src/vs/workbench/contrib/chat/`

## Component Relationships
```
Workbench
├── Editor Groups (contain editors)
├── Panel (terminal, problems, output, debug console)
├── Sidebar (explorer, search, SCM, debug, extensions)
├── Activity Bar
├── Status Bar
├── Title Bar
└── Quick Pick / Command Palette overlay