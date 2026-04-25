/**
 * Command registration
 * 
 * Deconstructed from command handlers in original extension
 */

importimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimportimnNewColumn) {
        await vscode.commands.executeCommand('workbench.action.lockEditorGroup');
      }
    })
  );

  // Open in primary editor
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.primaryEditor.open', async (session, prompt) => {
      webviewProvider.createPanel(session, prompt, vscode.ViewColumn.Active);
    })
  );

  // Open last used location
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.editor.openLast', async () => {
      if (settings.getPreferredLocation() === 'sidebar') {
        await vscode.commands.executeCommand('rova-vscode.sidebar.open');
      } else {
        await vscode.commands.executeCommand('rova-vscode.editor.open');
      }
    })
  );

  // New conversation
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.newConversation', () => {
      webviewProvider.notifyCreateNewConversation();
    })
  );

  // Toggle dictation
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.toggleDictation', () => {
      webviewProvider.notifyToggleDictation();
    })
  );

  // Open in sidebar
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.sidebar.open', async () => {
      settings.setPreferredLocation('sidebar');
      const version = vscode.version.split('.').map(Number);
      const supportsSecondary = (version[0] ?? 0) > 1 || ((version[0] ?? 0) === 1 && (version[1] ?? 0) >= 106);
      
      if (!supportsSecondary) {
        vscode.window.showWarningMessage(
          'Secondary Sidebar not supported in this VS Code version. Opening in Activity Bar instead.'
        );
        await vscode.commands.executeCommand('rovaVSCodeSidebar.focus');
        return;
      }
      
      await vscode.commands.executeCommand('rovaVSCodeSidebarSecondary.focus');
    })
  );

  // Open in new window
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.window.open', async () => {
      webviewProvider.createPanel(undefined, undefined);
      await vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow');
    })
  );

  // Logout
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.logout', async () => {
      const success = await auth.logout();
      if (success) {
        await webviewProvider.notifyLogout();
        vscode.window.showInformationMessage('Successfully logged out from Rova Code');
      } else {
        vscode.window.showErrorMessage('Failed to logout completely');
      }
    })
  );

  // Show logs
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.showLogs', () => {
      // Output channel is already visible
    })
  );

  // Open walkthrough
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.openWalkthrough', () => {
      vscode.commands.executeCommand(
        'workbench.action.openWalkthrough',
        `${context.extension.id}#rova-code-walkthrough`,
        false
      );
    })
  );

  // Insert @-mention
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.insertAtMention', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      
      const filePath = vscode.workspace.asRelativePath(editor.document.fileName);
      atMentionEvent.fire(`@${filePath}`);
    })
  );

  // Accept/reject proposed diff
  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.acceptProposedDiff', () => {
      // Implementation would interact with diff viewer
      vscode.commands.executeCommand('setContext', 'rova-vscode.viewingProposedDiff', false);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rova-vscode.rejectProposedDiff', () => {
      // Implementation would interact with diff viewer
      vscode.commands.executeCommand('setContext', 'rova-vscode.viewingProposedDiff', false);
    })
  );
}
