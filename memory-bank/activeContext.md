# Active Context: Rova-IDE

## Current Work Focus
- Initial memory bank setup and project onboarding
- Understanding the fork's current state relative to upstream VS Code

## Recent Changes
- Memory bank initialized (2026-04-23)
- Project is on branch `Rova-IDE` at version 1.118.0
- Latest commit: `e2accb2b0784d8af4664e83cf39e2aa5f7e3d05e`

## Next Steps
- [ ] Verify the project builds successfully
- [ ] Identify custom modifications beyond branding (product.json)
- [ ] Document any custom extensions or features added
- [ ] Set up development workflow documentation

## Active Decisions & Considerations
- **Build System**: The project uses gulp-based build system inherited from VS Code
- **Branding Strategy**: All branding is centralized in `product.json`
- **Extension Strategy**: Using built-in extensions from VS Code plus Copilot integration
- **Upstream Sync**: Need to establish a regular cadence for merging upstream changes

## Important Patterns & Preferences
- TypeScript is the primary language (strict type checking)
- The project follows VS Code's layered architecture (`base` → `platform` → `workbench`/`editor`)
- Extensions live in the `extensions/` directory
- Build configuration is in `build/` directory
- CLI is Rust-based (`cli/` directory with Cargo.toml)

## Learnings & Project Insights
- This is a massive codebase — care must be taken when exploring to understand scope
- The `product.json` file is the primary customization point for branding
- Node.js version pinned to 22.22.1 (via `.nvmrc`)
- The project uses ES modules (`"type": "module"` in package.json)