# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Rova-IDE**, a fork of Visual Studio Code (Code - OSS). It's built with TypeScript, web APIs and Electron, combining web technologies with native app capabilities.

## Common Commands

### Building
```bash
# Full compile (creates output in out/)
npm run compile

# Watch mode for development
npm run watch

# Build specific components
npm run gulp compile-extensions      # Built-in extensions only
npm run gulp compile-cli             # CLI tools
npm run gulp compile-web             # Web version
```

### Type Checking
```bash
# Check main VS Code sources
npm run compile-check-ts-native

# Check extensions
npm run gulp compile-extensions

# Check layering issues
npm run valid-layers-check
```

### Testing
```bash
# Unit tests (Node.js)
npm run test-node

# Browser tests
npm run test-browser

# Extension tests
npm run test-extension

# Integration tests
./scripts/test-integration.sh

# Single test with grep filter
./scripts/test.sh --grep "pattern"
```

### Running
```bash
# Run compiled code
./scripts/code.sh

# Run web version
./scripts/code-web.sh

# Run CLI
./scripts/code-cli.sh
```

### Code Quality
```bash
# ESLint
npm run eslint

# Hygiene check
npm run hygiene
```

## Architecture

### Root Folders
- `src/` - Main TypeScript source code
- `build/` - Build scripts and CI/CD tools
- `extensions/` - Built-in extensions (language servers, themes, features)
- `test/` - Integration tests and test infrastructure
- `scripts/` - Development and build scripts
- `resources/` - Static resources (icons, themes)
- `out/` - Compiled JavaScript output

### Core Architecture (`src/vs/`)
- `base/` - Foundation utilities and cross-platform abstractions
- `platform/` - Platform services and dependency injection infrastructure
- `editor/` - Text editor implementation with language services, syntax highlighting
- `workbench/` - Main application workbench for web and desktop
  - `browser/` - Core workbench UI components
  - `services/` - Service implementations
  - `contrib/` - Feature contributions (git, debug, search, terminal)
  - `api/` - Extension host and VS Code API
- `code/` - Electron main process specific code
- `server/` - Server specific implementation
- `sessions/` - Agent sessions window for agentic workflows

### Layered Architecture
The codebase follows a layered architecture from `base` → `platform` → `editor` → `workbench`. Dependencies should only flow downward in this hierarchy.

### Built-in Extensions (`extensions/`)
- Language support: `typescript-language-features/`, `html-language-features/`, `css-language-features/`, etc.
- Core features: `git/`, `debug-auto-launch/`, `emmet/`, `markdown-language-features/`
- Themes: `theme-*` folders
- **Rova-specific**: `extensions/claude/` - Claude Code integration

## Key Conventions

### Dependencies
- Services use **dependency injection** - injected through constructor parameters
- Non-service parameters must come **after** service parameters in constructors
- Use `IEditorService` to open editors (not `IEditorGroupsService`)

### Code Style
- **Tabs** for indentation (not spaces)
- **PascalCase** for types, enums, classes
- **camelCase** for functions, methods, variables
- Use **arrow functions** `=>` over anonymous functions
- Open curly braces on the **same line**
- Top-level exports use `export function` over `export const`

### Localization
- User-visible strings use **double quotes** and must be externalized via `vs/nls`
- Use placeholders `{0}` instead of string concatenation

### Disposables
- Register disposables immediately after creation using `DisposableStore`, `MutableDisposable`, or `DisposableMap`
- Do NOT register disposables to containing class if object is created within a repeatedly-called method (return `IDisposable` instead)

## Important Notes

- All files must include Microsoft copyright header
- Run type checking before declaring work complete
- Never use `any` or `unknown` unless absolutely necessary
- Don't duplicate code - always look for existing utilities first
- Check `.github/copilot-instructions.md` for detailed coding guidelines
