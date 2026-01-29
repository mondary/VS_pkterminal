# VS_pkterminal

![Project icon](icon.png)

🇬🇧 EN — [README_en.md](README_en.md)  
🇫🇷 FR — [README.md](README.md)

✨ A simple and efficient VS Code extension to open terminals **inside the editor** (not the bottom panel), with ready-to-use LLM buttons.

## ✅ Features

- 🧭 Title bar buttons to open a terminal as a **new editor tab**.
- 🤖 LLM launchers (Codex, Gemini, OpenCode, OpenSpec, Qwen, Claude) with dedicated icons.
- 🧰 Classic Terminal button for a neutral terminal.
- 🎛️ **LLMs** panel with logos, toggles, and clickable install commands.
- 🧩 Custom launchers (name, command, icon URL/codicon).
- 🪟 Split left/right/up/down via right‑click in the terminal editor.

## 🧠 Usage

- Click an LLM button → new editor terminal with the matching command.
- Click the terminal button → new standard terminal.
- OpenSpec runs `openspec init` when clicked.

## ⚙️ Settings

- Settings: `openTerminalEditor.show*` to show/hide each button.
- Custom launchers: `openTerminalEditor.customLaunchers`.

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

## 🧪 Install (Antigravity)

```bash
"/Applications/Vibe/vibe Antigravity.app/Contents/Resources/app/bin/antigravity" --install-extension "./release/VS_pkterminal-1.0.15.vsix"
```

## 🧾 Changelog

- 1.0.15: README refresh, release packaging updates.

## 🔗 Links

- VS Code Marketplace: https://marketplace.visualstudio.com/publishers/Cmondary
- Open VSX: https://open-vsx.org/namespace/Cmondary
- GitHub: https://github.com/mondary?tab=repositories&q=vs_
