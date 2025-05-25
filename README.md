# Notebook Markdown Copier for VS Code

**A Visual Studio Code extension to easily copy selected Jupyter Notebook cells as a single markdown block and paste markdown back into a notebook as distinct cells.**

This extension is designed to streamline the process of sharing notebook content with AI chatbots, documentation platforms, or any markdown-based system. It also helps in quickly bringing structured markdown back into your notebooks.

## Features

*   **Copy Selected Cells as Markdown**: Select one or more cells (Code or Markdown) in your Jupyter Notebook. The extension will convert them into a single, well-formatted markdown string and copy it to your clipboard.
    *   Markdown cells are copied as is.
    *   Code cells are wrapped in markdown code blocks, preserving their language identifier (e.g., ` ```python ... ``` `).
*   **Paste Markdown as Cells**: Take a markdown string (formatted with text and code blocks as produced by the copy feature) from your clipboard and paste it into your active Jupyter Notebook. The extension will parse the markdown and create new cells accordingly:
    *   Plain text becomes Markdown cells.
    *   Markdown code blocks become Code cells with the appropriate language.

## How to Use

### 1. Copy Selected Cells as Markdown

1.  Open a Jupyter Notebook (`.ipynb` file) in VS Code.
2.  Select one or more cells you wish to copy.
3.  Right-click on one of the selected cells to open the context menu.
4.  Choose "**Notebook: Copy Selected Cells as Markdown**".
    *   Alternatively, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and search for "Notebook: Copy Selected Cells as Markdown".
5.  The formatted markdown will be copied to your clipboard. A notification will confirm the action.

### 2. Paste Markdown as Cells

1.  Ensure you have markdown text (formatted as described above, typically from this extension's copy command or a similar structure) on your clipboard.
2.  Open a Jupyter Notebook (`.ipynb` file) in VS Code.
3.  Click on a cell to select it. The new cells will be pasted *below* this cell. If no cell is selected, they will be pasted at the end of the notebook.
4.  Right-click in the notebook area (e.g., on a cell or between cells) to open the context menu.
5.  Choose "**Notebook: Paste Markdown as Cells**".
    *   Alternatively, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and search for "Notebook: Paste Markdown as Cells".
6.  The markdown from your clipboard will be parsed and inserted as new cells. A notification will confirm if successful, or show an error if the content is not parsable.

## Settings

### recognizedLanguages
A list of language identifiers (e.g. `python`, `javascript`, `r`) that will be turned into Code cells when pasting markdown. Code fences with other languages are pasted as plain Markdown.
**Default**: `["python"]`

## Requirements

*   Visual Studio Code version `^1.76.0` or higher.
*   A working Jupyter Notebook environment if you intend to run the notebooks (the extension itself operates on the `.ipynb` file structure).

## Known Issues

*   Currently, the parsing for "Paste Markdown as Cells" expects markdown primarily structured by this extension's copy command. Complex or unusually formatted markdown might not parse as expected.
*   Error handling for extremely large clipboard content could be improved.

## Release Notes

See the [CHANGELOG.md](CHANGELOG.md) for details on each release.

---

**Enjoy using Notebook Markdown Copier!**
