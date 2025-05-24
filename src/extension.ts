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
}

export function deactivate() {}
