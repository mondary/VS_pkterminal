# VS_pkterminal

![Project icon](icon.png)

✨ Extension VS Code simple et efficace pour ouvrir des terminaux **dans l’éditeur** (pas en bas), avec des boutons LLM prêts à l’emploi.

## ✅ Fonctionnalités

- 🧭 Boutons dans la title bar pour ouvrir un terminal en **nouvel onglet** dans l’éditeur.
- 🤖 Launchers LLM (Codex, Gemini, OpenCode, OpenSpec, Qwen, Claude) avec icônes dédiées.
- 🧰 Bouton Terminal classique pour ouvrir un terminal neutre.
- 🎛️ Panneau **LLMs** avec logos, toggles et commandes d’installation cliquables.
- 🧩 Launchers custom (nom, commande, icône URL/codicon).
- 🪟 Split gauche/droite/haut/bas via clic droit dans l’éditeur terminal.

## 🧠 Utilisation

- Clique un bouton LLM → nouveau terminal dans l’éditeur avec la commande correspondante.
- Clique le bouton terminal → nouveau terminal standard.
- OpenSpec lance `openspec init` quand le bouton est cliqué.

## ⚙️ Réglages

- Paramètres : `openTerminalEditor.show*` pour afficher/masquer chaque bouton.
- Launchers custom : `openTerminalEditor.customLaunchers`.

## 🧾 Commandes

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

Le .vsix est généré dans `release/`.

## 🧪 Installation (Antigravity)

```bash
"/Applications/Vibe/vibe Antigravity.app/Contents/Resources/app/bin/antigravity" --install-extension "./release/VS_pkterminal-1.0.15.vsix"
```

## 🧾 Changelog

- 1.0.15 : README mis à jour, packaging release.

## 🔗 Liens

- VS Code Marketplace : https://marketplace.visualstudio.com/publishers/Cmondary
- Open VSX : https://open-vsx.org/namespace/Cmondary
- GitHub : https://github.com/mondary?tab=repositories&q=vs_
- EN README : README_en.md
