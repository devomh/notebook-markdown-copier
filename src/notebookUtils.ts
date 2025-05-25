import * as vscode from 'vscode';

export async function copyAsMarkdownHandler() {
    const editor = vscode.window.activeNotebookEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active Notebook Editor found.');
        return;
    }

    const selectedRanges = editor.selections;
    if (!selectedRanges || selectedRanges.length === 0 || (selectedRanges.length === 1 && selectedRanges[0].isEmpty && selectedRanges[0].start === selectedRanges[0].end) ) {
        vscode.window.showInformationMessage('No cells selected to copy.');
        return;
    }

    const allCells = editor.notebook.getCells();
    const selectedCellIndices = new Set<number>();

    selectedRanges.forEach(range => {
        for (let i = range.start; i < range.end; i++) {
            selectedCellIndices.add(i);
        }
    });

    if (selectedCellIndices.size === 0) {
        vscode.window.showInformationMessage('No cells effectively selected.');
        return;
    }

    const selectedCells: vscode.NotebookCell[] = [];
    selectedCellIndices.forEach(index => {
        if (index < allCells.length) { // Ensure index is within bounds
            selectedCells.push(allCells[index]);
        }
    });

    // Sort selectedCells by their actual index in the notebook
    selectedCells.sort((a, b) => a.index - b.index);

    if (selectedCells.length === 0) { // Double check after filtering and sorting
        vscode.window.showInformationMessage('No valid cells found in selection.');
        return;
    }

    const markdownParts: string[] = [];

    for (const cell of selectedCells) {
        if (cell.kind === vscode.NotebookCellKind.Markup) {
            markdownParts.push(cell.document.getText());
        } else if (cell.kind === vscode.NotebookCellKind.Code) {
            const languageId = cell.document.languageId || 'plaintext';
            markdownParts.push(`\`\`\`${languageId}
${cell.document.getText()}
\`\`\``);
        }
    }

    if (markdownParts.length > 0) {
        const finalMarkdownString = markdownParts.join('\n\n');
        try {
            await vscode.env.clipboard.writeText(finalMarkdownString);
            vscode.window.showInformationMessage('Selected cells copied as Markdown.');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            vscode.window.showErrorMessage('Failed to copy selected cells to clipboard.');
        }
    } else {
        vscode.window.showInformationMessage('No copyable content found in selected cells.');
    }
}

export async function pasteFromMarkdownHandler() {
    const editor = vscode.window.activeNotebookEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active Notebook Editor found.');
        return;
    }

    let clipboardText;
    try {
        clipboardText = await vscode.env.clipboard.readText();
    } catch (error) {
        console.error('Failed to read from clipboard:', error);
        vscode.window.showErrorMessage('Failed to read from clipboard.');
        return;
    }

    if (!clipboardText.trim()) {
        vscode.window.showInformationMessage('Clipboard is empty.');
        return;
    }

    const newCellsArray: vscode.NotebookCellData[] = [];
    const codeBlockRegex = /^```([a-zA-Z0-9_\-]+)?\n([\s\S]+?)^```$/gm;
    let lastIndex = 0;
    let match;
    const recognizedLanguages = getRecognizedLanguages();

    try {
        while ((match = codeBlockRegex.exec(clipboardText)) !== null) {
            // Add preceding markdown content if any
            if (match.index > lastIndex) {
                const markdownContent = clipboardText.substring(lastIndex, match.index).trim();
                if (markdownContent) {
                    newCellsArray.push(new vscode.NotebookCellData(vscode.NotebookCellKind.Markup, markdownContent, 'markdown'));
                }
            }

            // Add code cell
            const language = match[1] || 'plaintext'; // Default to 'plaintext' if language is not specified
            const codeContent = match[2].trim(); // Trim to remove leading/trailing newlines within the block
            if (codeContent) { // Ensure code content is not just whitespace
                if (recognizedLanguages.includes(language)) {
                    newCellsArray.push(new vscode.NotebookCellData(vscode.NotebookCellKind.Code, codeContent, language));
                } else {
                    const markdownCellContent = `\`\`\`${language}\n${codeContent}\n\`\`\``;
                    newCellsArray.push(new vscode.NotebookCellData(vscode.NotebookCellKind.Markup, markdownCellContent, 'markdown'));
                }
            }
            lastIndex = codeBlockRegex.lastIndex;
        }

        // Add any remaining markdown content after the last code block
        if (lastIndex < clipboardText.length) {
            const markdownContent = clipboardText.substring(lastIndex).trim();
            if (markdownContent) {
                newCellsArray.push(new vscode.NotebookCellData(vscode.NotebookCellKind.Markup, markdownContent, 'markdown'));
            }
        }

        if (newCellsArray.length === 0) {
            vscode.window.showInformationMessage('Could not parse any cells from clipboard content.');
            return;
        }

        let insertionIndex: number;
        if (editor.selections && editor.selections.length > 0 && editor.selections[0].end !== undefined) {
            insertionIndex = editor.selections[0].end;
        } else {
            insertionIndex = editor.notebook.cellCount;
        }

        const notebookEdit = vscode.NotebookEdit.insertCells(insertionIndex, newCellsArray);
        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.set(editor.notebook.uri, [notebookEdit]);

        await vscode.workspace.applyEdit(workspaceEdit);
        vscode.window.showInformationMessage('Cells pasted from Markdown.');

    } catch (error) {
        console.error('Failed to parse or paste Markdown:', error);
        vscode.window.showErrorMessage('Failed to parse or paste cells from Markdown. Check console for details.');
    }
}

function getRecognizedLanguages(): string[] {
  const cfg = vscode.workspace.getConfiguration('notebookMarkdownCopier');
  // The VS Code API might type this as any[] or T[] | undefined,
  // so ensure to handle the undefined case and provide a default.
  const languages = cfg.get<string[]>('recognizedLanguages');
  return languages === undefined ? ['python'] : languages;
}
