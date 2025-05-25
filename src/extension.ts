import * as vscode from 'vscode';
import { copyAsMarkdownHandler, pasteFromMarkdownHandler } from './notebookUtils'; // These will be created later

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "notebook-markdown-copier" is now active!');

    let copyDisposable = vscode.commands.registerCommand('notebook-markdown-copier.copyAsMarkdown', () => {
        copyAsMarkdownHandler();
    });

    let pasteDisposable = vscode.commands.registerCommand('notebook-markdown-copier.pasteFromMarkdown', () => {
        pasteFromMarkdownHandler();
    });

    context.subscriptions.push(copyDisposable);
    context.subscriptions.push(pasteDisposable);

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('notebookMarkdownCopier.recognizedLanguages')) {
                console.log('Notebook Markdown Copier: recognizedLanguages setting has changed. It will be applied on the next paste.');
                // Optionally, inform the user via a more visible notification:
                // vscode.window.showInformationMessage('Notebook Markdown Copier: Recognized languages setting updated. Changes will apply on next paste.');
            }
        })
    );
}

export function deactivate() {}
