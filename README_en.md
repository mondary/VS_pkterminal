# VS_pkterminal

![Project icon](icon.png)

[🇬🇧 EN](README_en.md) · [🇫🇷 FR](README.md)

✨ A simple and efficient VS Code extension to open terminals **inside the editor** (not the bottom panel), with ready-to-use LLM buttons.

## ✅ Features

- 🧭 Title bar buttons to open a terminal as a **new editor tab**.
- 🤖 LLM launchers (Codex, Gemini, OpenCode, OpenSpec, Qwen, Claude) with dedicated icons.
- 🧰 Classic Terminal button in the **status bar** for a neutral terminal.
- 🎛️ **LLMs** panel with logos, toggles, and clickable install commands.
- 🧩 Custom launchers (name, command, icon URL/codicon).
- 🪟 Split left/right/up/down via right‑click in the terminal editor.

## 🧠 Usage

- Click an LLM button → new editor terminal with the matching command.
- Click the terminal button (status bar) → new standard terminal.
- OpenSpec runs `openspec init` when clicked.

## ⚙️ Settings

- Settings: `openTerminalEditor.show*` to show/hide each button.
- Custom launchers: `openTerminalEditor.customLaunchers`.
- Launch delay: `openTerminalEditor.launchDelaySeconds` (seconds, default = 5) or `openTerminalEditor.launchDelayMs` (ms).

## 🧾 Commands

- "Open Codex Terminal in New Editor Tab"
- "Open Gemini Terminal in New Editor Tab"
- "Open OpenCode Terminal in New Editor Tab"
- "Open OpenSpec Terminal in New Editor Tab"
- "Open Qwen Terminal in New Editor Tab"
- "Open Claude Terminal in New Editor Tab"
- "Open Terminal in New Editor Tab"

## 📦 Build & Package

```bash
cd extension
npm run release
```

The .vsix is generated in `release/`.

## 🧪 Install (VSIX)

### VS Code (CLI)

```bash
code --install-extension "./release/VS_pkterminal-1.0.21.vsix"
```

### Cursor (UI)

Command Palette → “Extensions: Install from VSIX…” → select the `.vsix`.

### Antigravity (UI)

Command Palette → “Extensions: Install from VSIX…” → select the `.vsix`.

### Trae (UI)

Open the extensions store → drag & drop the `.vsix`.

## 🧾 Changelog

- 1.0.18: shared README (store = root README).
- 1.0.19: added a configurable delay before auto-running LLM commands.
- 1.0.20: delay in seconds + wait for shell before sending the command.
- 1.0.21: default delay set to 5 seconds.

## 🔗 Links

- VS Code Marketplace: https://marketplace.visualstudio.com/publishers/Cmondary
- Open VSX: https://open-vsx.org/namespace/Cmondary
- GitHub: https://github.com/mondary?tab=repositories&q=vs_
