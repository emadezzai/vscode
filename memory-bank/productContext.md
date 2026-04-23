# Product Context: Rova-IDE

## Why This Project Exists
Rova-IDE exists to provide a customized, branded IDE experience based on the battle-tested VS Code (Code - OSS) foundation. The project allows for tailored modifications, custom branding, and potentially unique features while leveraging the massive VS Code ecosystem.

## Problems It Solves
1. **Custom Branding**: Organizations or individuals who want their own branded IDE without building from scratch
2. **Tailored Experience**: Ability to customize defaults, themes, extensions, and behaviors beyond what standard VS Code allows
3. **Full Control**: Access to modify core editor behavior, not just through extensions but at the source level
4. **Copilot-First**: GitHub Copilot is configured as the default chat agent out of the box

## How It Should Work
- Identical core editing experience to VS Code (edit, build, debug cycle)
- Full extension compatibility with the VS Code ecosystem
- Custom product name, icons, and branding throughout the UI
- Default configuration optimized for the target audience
- Built-in extensions include: JS debug companion, JS debug, and JS profile table
- Custom themes bundled: Vesper Extended (dark), Light 2026, plus standard VS Code themes
- GitHub Copilot integration for AI-assisted coding

## User Experience Goals
- Seamless transition for existing VS Code users — familiar keybindings, settings, and workflows
- Fast startup and responsive editing experience
- Reliable debugging and terminal integration
- AI-powered assistance via Copilot (completions, chat, edit suggestions)
- Support for multiple keyboard mapping presets (VS Code, Sublime, IntelliJ, Vim, Eclipse, Notepad++)

## Target Users
- Developers who want a customized IDE experience
- Teams needing a branded development environment
- Contributors to the Rova-IDE project itself

## Upstream Relationship
- Forked from `microsoft/vscode` (upstream)
- Maintains ability to merge upstream changes
- Custom changes are primarily in branding (`product.json`) and potentially in extensions or UI customizations