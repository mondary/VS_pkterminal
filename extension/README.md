# VS_pkterminal

![VS_pkterminal icon](icon.png)

VS_pkterminal adds editor title-bar buttons to open new terminals in the editor area (not the bottom panel).

## Build

```bash
cd extension
npm install
npm run build
```

## Package (VSIX)

```bash
cd extension
npm run release
```

VSIX output is written to `release/`.

## Install (Vibe Antigravity)

Use a single-line command (no line breaks):

```bash
"/Applications/Vibe/vibe Antigravity.app/Contents/Resources/app/bin/antigravity" --install-extension "/Users/clm/Documents/GitHub/EXTENSIONS/VS_pkterminal/release/vs_pkterminal-1.0.0.vsix"
```

## Commands Used (Build + Package + Install)

```bash
cd extension
npm install
npm run build
npm run release
"/Applications/Vibe/vibe Antigravity.app/Contents/Resources/app/bin/antigravity" --install-extension "/Users/clm/Documents/GitHub/EXTENSIONS/VS_pkterminal/release/vs_pkterminal-1.0.0.vsix"
```

## Reload Window

- Command Palette: `Reload Window`
- Shortcut: Cmd+Shift+P then type `Reload Window`

## Sidebar Panel and Settings

- Open the **LLMs** view in the Activity Bar to toggle each button, see logos, and open install links.
- Click any install command to open a new terminal tab with the command pre-filled.
- Settings: search for `openTerminalEditor.show*` in Settings to show/hide each LLM button.
- The LLM launcher UI uses logo cards, toggle switches, and clickable install commands.
- Custom launchers: add name, command, and icon (URL or codicon) and use Save/Delete.
- Settings: `openTerminalEditor.customLaunchers` stores custom entries.

## Terminal Split Actions

- Right-click a terminal editor tab or terminal editor area to split left/right/up/down.
- Splits create a new editor group and automatically open a new terminal tab.

## LLM Launcher Logos

- If logos do not appear, ensure the extension version is `0.1.5` and reload the window.

## Usage

- In the editor title bar, click any of the AI buttons (Codex, Gemini, OpenCode, OpenSpec, Qwen, Claude) to open a new editor-area terminal running the matching command, with the matching icon on the terminal tab.
- Use the terminal icon to open a plain terminal in a new editor tab.
- Commands are named:
  - "Open Codex Terminal in New Editor Tab"
  - "Open Gemini Terminal in New Editor Tab"
  - "Open OpenCode Terminal in New Editor Tab"
  - "Open OpenSpec Terminal in New Editor Tab"
  - "Open Qwen Terminal in New Editor Tab"
  - "Open Claude Terminal in New Editor Tab"
  - "Open Terminal in New Editor Tab"

OpenSpec runs `openspec init` when its button is clicked.
