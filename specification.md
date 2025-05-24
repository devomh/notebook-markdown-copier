# 📝 Specification: Notebook Markdown Copier VS Code Extension

This document outlines the requirements for building the **Notebook Markdown Copier** Visual Studio Code extension. The goal is to provide an AI agent with a clear set of instructions to implement this extension.

**AI Agent Instructions:** You will be working directly within the root project folder. You do *not* need to create the root folder itself. Your task is to create all the necessary files and subfolders as specified below and write the code according to these guidelines.

---

## 🎯 Extension Overview

* **Name**: Notebook Markdown Copier
* **Identifier**: `notebook-markdown-copier`
* **Description**: A VS Code extension to copy selected Jupyter Notebook cells as a single markdown block and paste markdown back into a notebook as distinct cells. This simplifies sharing notebook content with AI chatbots and other markdown-based platforms.
* **Language**: TypeScript
* **Scaffolding**: Use `yo code` (Yeoman generator for VS Code extensions) to initialize the project structure. If `yo` and `generator-code` are not installed, you'll need to install them first (`npm install -g yo generator-code`).
* **Target VS Code Version**: `^1.76.0`
* **Key APIs**: VS Code Extension API (`vscode`), specifically the Notebook API (`vscode.notebooks`, `vscode.NotebookCellKind`, etc.) and Clipboard API (`vscode.env.clipboard`).

---

## ✨ Core Features

### 1. Copy Selected Notebook Cells as Markdown

* **Trigger**: A user selects one or more cells in a Jupyter Notebook and invokes the "Copy Cells as Markdown" command.
* **Functionality**:
    * Iterate through the selected cells in their order of appearance in the notebook.
    * If a cell is a **Markdown Cell** (`vscode.NotebookCellKind.Markup`), append its content directly to the output string, followed by two newlines (`\n\n`).
    * If a cell is a **Code Cell** (`vscode.NotebookCellKind.Code`), append its content wrapped in a markdown code block. Include the cell's language ID (e.g., `python`) if available. Format:
        ```markdown
        ```<language_id>
        <code>
        ```
        Follow this with two newlines (`\n\n`).
    * Handle potential edge cases like empty selections or unsupported cell types (ignore them).
* **Output**: Place the concatenated markdown string onto the system clipboard.
* **Feedback**: (Optional but recommended) Show a brief information message (e.g., "Cells copied as Markdown.") upon successful completion.

### 2. Paste Markdown as Notebook Cells

* **Trigger**: A user has markdown content (formatted as described above) on their clipboard and invokes the "Paste Markdown as Cells" command within an active Jupyter Notebook.
* **Functionality**:
    * Read the text content from the system clipboard.
    * Parse the clipboard text. The primary parsing logic involves identifying markdown code blocks (using ```<language> ... ```) and separating them from the surrounding markdown text.
    * Create an array of `vscode.NotebookCellData` objects based on the parsed content:
        * Text outside code blocks becomes `new vscode.NotebookCellData(vscode.NotebookCellKind.Markup, text_content, 'markdown')`.
        * Text inside code blocks becomes `new vscode.NotebookCellData(vscode.NotebookCellKind.Code, code_content, language_id)`.
    * Handle potential parsing errors or non-conforming markdown (e.g., paste as a single markdown cell or show an error).
* **Insertion**: Insert the newly created cells into the active notebook *below* the currently selected cell or at the end if no cell is selected. Use `vscode.workspace.applyEdit` with `vscode.NotebookEdit.insertCells`.
* **Feedback**: (Optional but recommended) Show an error message if the clipboard content cannot be parsed.

---

## 🏗️ Project Structure (To be created by AI)

```
.
├── .vscode/
│   ├── extensions.json
│   └── launch.json
├── src/
│   ├── extension.ts  // Main extension logic
│   └── notebookUtils.ts // Helper functions for notebook/markdown conversion (Recommended)
├── .vscodeignore
├── package.json      // Extension manifest, dependencies, commands
├── tsconfig.json     // TypeScript configuration
├── README.md         // Basic README
└── CHANGELOG.md      // Basic CHANGELOG
```

---

## ⚙️ Implementation Details

### 1. `package.json` Setup

* **Activation Events**: Ensure the extension activates when a notebook is in use.
    ```json
    "activationEvents": [
        "onNotebook:jupyter-notebook",
        "onNotebook:python" // Add others if needed
    ],
    ```
* **Commands**:
    ```json
    "contributes": {
        "commands": [
            {
                "command": "notebook-markdown-copier.copyAsMarkdown",
                "title": "Notebook: Copy Selected Cells as Markdown"
            },
            {
                "command": "notebook-markdown-copier.pasteFromMarkdown",
                "title": "Notebook: Paste Markdown as Cells"
            }
        ],
        "menus": {
            "notebook/cell/context": [
                {
                    "command": "notebook-markdown-copier.copyAsMarkdown",
                    "when": "notebookEditorHasSelection", // Show only when cells are selected
                    "group": "2_copy@1"
                },
                {
                    "command": "notebook-markdown-copier.pasteFromMarkdown",
                    "group": "2_copy@2"
                }
            ]
        }
    }
    ```
    * **Note**: We've added context menu entries (`notebook/cell/context`) for easier access. The `when` clause ensures "Copy" only appears when cells are selected.

### 2. `src/extension.ts` (Activation)

* Register the two commands (`copyAsMarkdown` and `pasteFromMarkdown`).
* Import and call the main logic functions (ideally defined in `notebookUtils.ts`).
* Handle potential errors gracefully within the command handlers (e.g., no active notebook editor, no selection for copy, invalid clipboard data for paste).

### 3. `src/notebookUtils.ts` (Core Logic)

* **`copyAsMarkdownHandler()`**:
    * Get the `activeNotebookEditor`. If none, show an error and return.
    * Get `editor.selections`. If empty, show an info message and return.
    * Retrieve the *full* cell objects based on the selections (you might need to get all cells and filter/sort by index).
    * Build the markdown string as described in *Features*.
    * Use `vscode.env.clipboard.writeText()`.
* **`pasteFromMarkdownHandler()`**:
    * Get the `activeNotebookEditor`. If none, show an error and return.
    * Use `vscode.env.clipboard.readText()`. If empty or invalid, show an error/info and return.
    * Implement a robust parser. Regular expressions can be useful here, especially for finding ``` blocks. Consider using a state machine or iterating line by line if regex proves too complex. Remember to capture the language identifier.
    * Construct the `vscode.NotebookCellData` array.
    * Determine the insertion index (based on `editor.selections` or `editor.notebook.cellCount`).
    * Create a `vscode.WorkspaceEdit`.
    * Use `vscode.NotebookEdit.insertCells()` to add the cells to the edit.
    * Apply the edit using `vscode.workspace.applyEdit()`.

### 4. Parsing Markdown (Challenges)

* The most complex part is reliably parsing the markdown back into cells.
* Consider using a simple approach first: Split the text based on ```<lang>\n ... \n```. Everything *between* these blocks is markdown, and everything *inside* is code.
* Handle nested code blocks within markdown (though this might be an edge case you can initially ignore or handle simply).
* Ensure empty lines between blocks are handled correctly (usually ignored when creating cells).