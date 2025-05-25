## 🧪 Testing & Debugging "Notebook Markdown Copier"

This guide assumes you have your extension's source code open in your main VS Code window.

### Step 1: Ensure Prerequisites

1.  **Open Project:** Make sure you have the `notebook-markdown-copier` project folder open in VS Code.
2.  **Install Dependencies:** If you haven't already, open the integrated terminal (`Ctrl+` or `Cmd+`) and run:
    ```bash
    npm install
    ```
3.  **Compile (Optional but good practice):** While F5 usually handles this, you can manually compile to catch errors early:
    ```bash
    npm run compile
    ```
    Or, for continuous compilation during changes:
    ```bash
    npm run watch
    ```
4.  **Jupyter Support:** Ensure your *main* VS Code instance (not the one you'll launch for testing) has the official Jupyter extension installed. This allows you to easily create and manage notebook files for testing.

### Step 2: Set Breakpoints (Optional but Recommended)

Before launching, it's helpful to set breakpoints in your code to pause execution and inspect variables.

1.  Navigate to `src/extension.ts` and/or `src/notebookUtils.ts`.
2.  Click in the gutter to the left of the line numbers where you want to pause. Key areas include:
    * Inside the command registration in `activate`.
    * At the beginning of your `copyAsMarkdownHandler` and `pasteFromMarkdownHandler` functions.
    * Within your markdown parsing logic.
    * Before `vscode.env.clipboard.writeText` and `vscode.env.clipboard.readText`.
    * Before `vscode.workspace.applyEdit`.

### Step 3: Launch the Extension Development Host

1.  **Go to Run and Debug:** Click the "Run and Debug" icon in the Activity Bar on the left (it looks like a play button with a bug).
2.  **Select Configuration:** At the top, you should see a dropdown menu. Ensure **"Run Extension"** is selected (this is the default created by `yo code`).
3.  **Start Debugging:** Press the **F5** key or click the green "Start Debugging" play button.

    * **What happens?** VS Code will compile your TypeScript (if needed) and launch a *new* VS Code window. This new window is called the **"Extension Development Host"**. It runs a standard VS Code instance but with *your* extension (Notebook Markdown Copier) loaded and active.
    * **Debugger:** Your original VS Code window now switches to a debugging view, and the status bar usually turns orange, indicating it's in a debugging session.

### Step 4: Prepare the Test Environment (in the Host Window)

1.  **Open/Create a Notebook:** In the **Extension Development Host** window (the *new* one), open an existing `.ipynb` file or create a new one.
2.  **Add Cells:** Populate the notebook with a mix of cells to test various scenarios:
    * A markdown cell with some text.
    * A code cell (e.g., Python) with some code.
    * Multiple cells in sequence (markdown, code, markdown).
    * An empty cell.

### Step 5: Test the "Copy as Markdown" Feature

1.  **Select Cells:** In the notebook (in the Host window), select one or more cells using `Shift+Click` or by clicking in the cell margins.
2.  **Invoke Command:**
    * **Context Menu:** Right-click on one of the selected cells (or its margin). You should see **"Notebook: Copy Selected Cells as Markdown"** in the menu. Click it.
    * **Command Palette:** Press `Ctrl+Shift+P` (or `Cmd+Shift+P`), type "Copy Cells as Markdown", and select your command.
3.  **Check Breakpoints:** If you set breakpoints, execution should pause in your *original* VS Code window. You can now:
    * **Inspect Variables:** Hover over variables or use the "Variables" panel in the Debug view to check `activeNotebookEditor`, `selections`, the content being processed, etc.
    * **Step Through:** Use `F10` (Step Over), `F11` (Step Into), or `Shift+F11` (Step Out) to walk through your code.
    * **Continue:** Press `F5` to resume execution.
4.  **Verify Output:**
    * Open a simple text editor (like Notepad, TextEdit, or even a new VS Code text file) and paste (`Ctrl+V` or `Cmd+V`).
    * Check if the pasted content is correctly formatted markdown, with code blocks and markdown text as expected.
    * Test different selections (single cell, multiple cells, etc.).

### Step 6: Test the "Paste as Markdown" Feature

1.  **Prepare Clipboard:** Copy a valid markdown string (like the one you generated, or manually create one with ```python ... ``` blocks) to your clipboard.
2.  **Position Cursor:** In the notebook (in the Host window), click in a cell or between cells to set the insertion point.
3.  **Invoke Command:**
    * **Context Menu:** Right-click where you want to paste and select **"Notebook: Paste Markdown as Cells"**.
    * **Command Palette:** Press `Ctrl+Shift+P` (or `Cmd+Shift+P`), type "Paste Markdown as Cells", and select your command.
4.  **Check Breakpoints:** Again, if breakpoints are set, execution will pause. Inspect the clipboard content being read and how it's parsed into `NotebookCellData`.
5.  **Verify Output:**
    * Check if new cells have been inserted at the correct position in the notebook.
    * Verify that code blocks became code cells (with the correct language if possible) and markdown text became markdown cells.
    * Test pasting with invalid or plain text to see how your error handling works.

### Step 7: Use the Debug Console

In your *original* VS Code window (the one running the debugger):

1.  **View Output:** Look at the "Debug Console" tab. Any `console.log()` statements you added to your extension code will appear here. This is invaluable for tracing execution and checking values without pausing.
2.  **Evaluate Expressions:** You can type expressions in the Debug Console input to evaluate variables in the current scope when execution is paused.

### Step 8: Iterate and Refine

1.  If you find bugs or want to make changes:
    * **Stop Debugging:** Click the red square "Stop" button in the Debug toolbar (or press `Shift+F5`) in the original window. This closes the Extension Development Host.
    * **Edit Code:** Make your changes in the original window.
    * **Re-launch:** Press `F5` again to launch a new Host window with your updated extension.
2.  Repeat steps 4-7 until you are satisfied with the extension's behavior.


---

# Installing via `.vsix` File

This process involves two main steps: packaging your extension into a `.vsix` file and then installing that file.

### Step 1: Install `vsce` (Visual Studio Code Extensions Tool)

If you don't have it installed already, you need `vsce`, the official command-line tool for managing VS Code extensions.

1.  Open your terminal or command prompt.
2.  Run the following command to install it globally:
    ```bash
    npm install -g vsce
    ```

### Step 2: Package Your Extension

1.  Navigate to your extension's root directory (the one with `package.json`) in your terminal.
2.  Make sure your code is compiled (run `npm run compile` or ensure `out/` is up-to-date).
3.  Run the packaging command:
    ```bash
    vsce package
    ```
4.  If successful, this will create a file named something like `notebook-markdown-copier-X.Y.Z.vsix` in your project folder (where X.Y.Z is the version number from your `package.json`).

    * **Note:** `vsce` might prompt for a publisher name if you haven't set one in your `package.json`. For local installation, you can add a temporary one (e.g., `"publisher": "local-dev"`) or create one for free via the Azure DevOps portal if you plan to publish later. For *just* local packaging, `vsce package` often works without one, but it's good practice to add it.

### Step 3: Install the `.vsix` File

You have two options here: using the command line or using the VS Code UI.

#### Option A: Installing via Command Line

1.  Open your terminal.
2.  Run the following command, replacing `<path-to-your-vsix-file>` with the actual path to the `.vsix` file you just created:
    ```bash
    code --install-extension <path-to-your-vsix-file>
    ```
    * **Example:** `code --install-extension notebook-markdown-copier-0.0.1.vsix` (if you run it from the project root).
    * **Note:** This requires that you have the `code` command installed in your system's PATH. If you don't, open VS Code, press `Ctrl+Shift+P` (or `Cmd+Shift+P`), type "Shell Command", and select **"Shell Command: Install 'code' command in PATH"**.

#### Option B: Installing via VS Code UI

1.  Open your regular VS Code instance (not the Extension Development Host).
2.  Go to the **Extensions** view (click the square icon in the Activity Bar or press `Ctrl+Shift+X` / `Cmd+Shift+X`).
3.  Click the **three dots (`...`)** at the top-right corner of the Extensions panel.
4.  Select **"Install from VSIX..."**.
5.  In the file browser that opens, navigate to your project folder and select the `.vsix` file you created.
6.  Click **"Install"**.

### Step 4: Reload VS Code

After installing (using either method), VS Code will likely prompt you to reload the window. Click **"Reload Now"** to activate your newly installed extension.

---

### Important Considerations

* **Updates:** If you make changes to your extension's code, you need to repeat the **packaging** (Step 2) and **installation** (Step 3) steps. Installing a new version will overwrite the old one.
* **Uninstallation:** You can uninstall your locally installed extension just like any other extension: go to the Extensions view, find "Notebook Markdown Copier", and click the "Uninstall" button.
* **F5 vs. Install:** Remember, pressing `F5` is for *temporary testing and debugging* in a separate window. Installing the `.vsix` makes it available in your *main* VS Code instance until you uninstall it.

You have now successfully installed your custom extension and can use it in your day-to-day workflow within VS Code!