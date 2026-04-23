# Project Brief: Rova-IDE

## Overview
Rova-IDE is a customized fork of Microsoft's Visual Studio Code (Code - OSS). It rebrands and extends the VS Code open-source editor to create a distinct IDE product called "Rova-IDE".

## Core Requirements & Goals
- Maintain a fully functional code editor based on VS Code's architecture
- Custom branding: product name, application identifiers, data folders, and URLs are all customized to "Rova-IDE"
- Preserve upstream compatibility with VS Code extensions and the VS Code extension marketplace
- Integrate GitHub Copilot as the default chat agent
- Support all major platforms: Windows (x64, ARM64), macOS (Darwin), and Linux

## Project Scope
- **In Scope**: Editor core, extensions system, terminal, debugging, Git integration, Copilot integration, custom branding
- **Out of Scope**: Proprietary VS Code features that require Microsoft's closed-source additions

## Key Product Identifiers
| Property | Value |
|---|---|
| Short Name | Rova-IDE |
| Application Name | rova-ide |
| Data Folder | .rova-ide |
| Darwin Bundle ID | com.rova.ide |
| URL Protocol | rova-ide |
| Win32 AppUserModelId | Microsoft.RovaIDE |
| License | MIT |

## Source Repository
- **Origin (fork)**: https://github.com/emadezzai/vscode.git
- **Upstream**: https://github.com/microsoft/vscode.git
- **Current Branch**: Rova-IDE
- **Version**: 1.118.0

## Stakeholders
- Developer/Owner: Emad (@emadezzai)

## Success Metrics
- Successfully builds and runs on all target platforms
- Extensions from the VS Code marketplace remain compatible
- Copilot integration works as expected