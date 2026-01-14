"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const COMMAND_ID = "openTerminalEditor.openInEditorTab";
const CODEX_COMMAND_ID = "openTerminalEditor.openCodex";
const GEMINI_COMMAND_ID = "openTerminalEditor.openGemini";
const OPENCODE_COMMAND_ID = "openTerminalEditor.openOpenCode";
const OPENSPEC_COMMAND_ID = "openTerminalEditor.openOpenSpec";
const QWEN_COMMAND_ID = "openTerminalEditor.openQwen";
const CLAUDE_COMMAND_ID = "openTerminalEditor.openClaude";
const SPLIT_LEFT_COMMAND_ID = "openTerminalEditor.splitLeft";
const SPLIT_RIGHT_COMMAND_ID = "openTerminalEditor.splitRight";
const SPLIT_UP_COMMAND_ID = "openTerminalEditor.splitUp";
const SPLIT_DOWN_COMMAND_ID = "openTerminalEditor.splitDown";
const VISIBILITY_KEYS = {
    codex: "openTerminalEditor.showCodex",
    gemini: "openTerminalEditor.showGemini",
    openCode: "openTerminalEditor.showOpenCode",
    openSpec: "openTerminalEditor.showOpenSpec",
    qwen: "openTerminalEditor.showQwen",
    claude: "openTerminalEditor.showClaude",
};
function isEditorLocation(location) {
    if (location === vscode.TerminalLocation.Editor) {
        return true;
    }
    if (!location || typeof location !== "object") {
        return false;
    }
    if ("viewColumn" in location) {
        return true;
    }
    if ("parentTerminal" in location) {
        const parentLocation = location.parentTerminal.creationOptions.location;
        return isEditorLocation(parentLocation);
    }
    return false;
}
async function updateTerminalEditorContext() {
    const activeTerminal = vscode.window.activeTerminal;
    const isEditorTerminal = activeTerminal
        ? isEditorLocation(activeTerminal.creationOptions.location)
        : false;
    await vscode.commands.executeCommand("setContext", "openTerminalEditor.terminalEditorActive", isEditorTerminal);
}
function createEditorTerminal(command, name, iconPath) {
    const terminal = vscode.window.createTerminal({
        name,
        location: vscode.TerminalLocation.Editor,
        iconPath,
    });
    terminal.show(true);
    if (command) {
        terminal.sendText(command, true);
    }
}
function getVisibilityState() {
    const config = vscode.workspace.getConfiguration("openTerminalEditor");
    return {
        codex: config.get("showCodex", true),
        gemini: config.get("showGemini", true),
        openCode: config.get("showOpenCode", true),
        openSpec: config.get("showOpenSpec", true),
        qwen: config.get("showQwen", true),
        claude: config.get("showClaude", true),
    };
}
async function updateVisibilityContexts() {
    const state = getVisibilityState();
    await Promise.all(Object.keys(VISIBILITY_KEYS).map((key) => vscode.commands.executeCommand("setContext", VISIBILITY_KEYS[key], state[key])));
}
function getCustomLaunchers() {
    const config = vscode.workspace.getConfiguration("openTerminalEditor");
    const entries = config.get("customLaunchers", []);
    return Array.isArray(entries) ? entries : [];
}
async function saveCustomLaunchers(entries) {
    const config = vscode.workspace.getConfiguration("openTerminalEditor");
    await config.update("customLaunchers", entries, vscode.ConfigurationTarget.Global);
}
function resolveCustomIcon(icon) {
    const trimmed = icon.trim();
    if (!trimmed) {
        return null;
    }
    if (trimmed.startsWith("$(") && trimmed.endsWith(")")) {
        return { type: "codicon", value: trimmed.slice(2, -1) };
    }
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return { type: "url", value: trimmed };
    }
    return null;
}
class LlmPanelProvider {
    constructor(extensionUri, iconMap) {
        this.extensionUri = extensionUri;
        this.iconMap = iconMap;
    }
    resolveWebviewView(view) {
        this.view = view;
        view.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };
        view.webview.onDidReceiveMessage(async (message) => {
            if (message?.type === "toggle") {
                const config = vscode.workspace.getConfiguration("openTerminalEditor");
                const key = message.key;
                if (key && Object.prototype.hasOwnProperty.call(VISIBILITY_KEYS, key)) {
                    await config.update(VISIBILITY_KEYS[key].replace("openTerminalEditor.", ""), Boolean(message.value), vscode.ConfigurationTarget.Global);
                }
                return;
            }
            if (message?.type === "openLink" && typeof message.url === "string") {
                await vscode.env.openExternal(vscode.Uri.parse(message.url));
                return;
            }
            if (message?.type === "runCommand" &&
                typeof message.command === "string" &&
                typeof message.name === "string") {
                const icon = message.key ? this.iconMap[message.key] : undefined;
                createEditorTerminal(message.command, message.name, icon);
                return;
            }
            if (message?.type === "runCustom") {
                const icon = resolveCustomIcon(message.icon ?? "");
                const iconPath = icon?.type === "url"
                    ? vscode.Uri.parse(icon.value)
                    : icon?.type === "codicon"
                        ? new vscode.ThemeIcon(icon.value)
                        : undefined;
                createEditorTerminal(message.command, message.name, iconPath);
                return;
            }
            if (message?.type === "saveCustom") {
                const current = getCustomLaunchers();
                const id = message.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                const entry = {
                    id,
                    name: String(message.name ?? "").trim(),
                    command: String(message.command ?? "").trim(),
                    icon: String(message.icon ?? "").trim(),
                };
                if (!entry.name || !entry.command) {
                    return;
                }
                const next = current.filter((item) => item.id !== id).concat(entry);
                await saveCustomLaunchers(next);
                this.render();
                return;
            }
            if (message?.type === "deleteCustom" && typeof message.id === "string") {
                const current = getCustomLaunchers();
                const next = current.filter((item) => item.id !== message.id);
                await saveCustomLaunchers(next);
                this.render();
            }
        });
        this.render();
    }
    render() {
        if (!this.view) {
            return;
        }
        this.view.webview.html = this.getHtml(this.view.webview);
    }
    getHtml(webview) {
        const nonce = getNonce();
        const state = getVisibilityState();
        const entries = [
            {
                key: "codex",
                name: "Codex",
                url: "https://developers.openai.com/codex/cli/",
                installs: ["npm i -g @openai/codex", "brew install codex"],
                icon: "codex.svg",
            },
            {
                key: "gemini",
                name: "Gemini",
                url: "https://github.com/google-gemini/gemini-cli",
                installs: [
                    "npm install -g @google/gemini-cli",
                    "brew install gemini-cli",
                ],
                icon: "gemini.svg",
            },
            {
                key: "openCode",
                name: "OpenCode",
                url: "https://opencode.ai/",
                installs: [
                    "curl -fsSL https://opencode.ai/install | bash",
                    "npm i -g opencode-ai",
                    "brew install opencode",
                    "bun add -g opencode-ai",
                ],
                icon: "opencode.svg",
                notes: [
                    {
                        label: "oh-my-opencode",
                        url: "https://github.com/code-yeongyu/oh-my-opencode",
                        text: "Let an LLM Agent do it",
                    },
                    {
                        label: "Paste this in opencode",
                        url: "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/refs/heads/master/README.md",
                        text: "Install and configure by following instructions",
                    },
                ],
            },
            {
                key: "openSpec",
                name: "OpenSpec",
                url: "https://github.com/Fission-AI/OpenSpec",
                installs: ["npm install -g @fission-ai/openspec@latest"],
                icon: "openspec.svg",
            },
            {
                key: "qwen",
                name: "Qwen",
                url: "https://github.com/QwenLM/qwen-code",
                installs: [
                    "curl -qL https://www.npmjs.com/install.sh | sh",
                    "npm install -g @qwen-code/qwen-code@latest",
                    "brew install qwen-code",
                ],
                icon: "qwen.svg",
                notes: [{ text: "Requires Node.js 20+" }],
            },
            {
                key: "claude",
                name: "Claude",
                url: "https://claude.com/fr-fr/product/claude-code",
                installs: [
                    "curl -fsSL https://claude.ai/install.sh | bash",
                    "npm install -g @anthropic-ai/claude-code",
                ],
                icon: "claude.svg",
            },
        ];
        const customLaunchers = getCustomLaunchers();
        const entryHtml = entries
            .map((entry) => {
            const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "resources", entry.icon));
            const installs = entry.installs
                .map((install) => {
                const escaped = escapeHtml(install);
                return `<button class="command" data-command="${escapeAttribute(install)}" type="button"><span class="cmd">${escaped}</span><span class="run">Run</span></button>`;
            })
                .join("");
            const notes = entry.notes
                ? entry.notes
                    .map((note) => {
                    if (note.url) {
                        const label = note.label ?? note.text ?? "";
                        const text = note.text ?? "";
                        return `<a class="note-link" href="#" data-url="${note.url}">${escapeHtml(label)}</a><span>${escapeHtml(text)}</span>`;
                    }
                    return `<span>${escapeHtml(note.text ?? "")}</span>`;
                })
                    .join("")
                : "";
            return `
        <section class="card">
          <div class="header">
            <div class="title">
              <img class="logo" src="${iconUri}" alt="${entry.name} logo" />
              <div class="name">${entry.name}</div>
            </div>
            <label class="toggle">
              <input type="checkbox" data-key="${entry.key}" ${state[entry.key] ? "checked" : ""} />
              <span class="switch"></span>
            </label>
            <button class="link-button" data-url="${entry.url}" type="button">
              Website
            </button>
          </div>
          <div class="installs" data-key="${entry.key}" data-name="${entry.name}">${installs}</div>
          ${notes ? `<div class="notes">${notes}</div>` : ""}
        </section>
      `;
        })
            .join("");
        const customHtml = customLaunchers
            .map((entry) => {
            const icon = resolveCustomIcon(entry.icon);
            const iconTag = icon?.type === "url"
                ? `<img class="logo" src="${escapeAttribute(icon.value)}" alt="${escapeHtml(entry.name)} logo" />`
                : icon?.type === "codicon"
                    ? `<span class="codicon">$(${escapeHtml(icon.value)})</span>`
                    : `<span class="codicon">$(terminal)</span>`;
            return `
        <section class="card custom">
          <div class="header">
            <div class="title">
              ${iconTag}
              <div class="name">${escapeHtml(entry.name)}</div>
            </div>
            <button class="link-button" data-custom-run="true" data-name="${escapeAttribute(entry.name)}" data-command="${escapeAttribute(entry.command)}" data-icon="${escapeAttribute(entry.icon)}" type="button">Run</button>
            <button class="danger-button" data-custom-delete="true" data-id="${escapeAttribute(entry.id)}" type="button">Delete</button>
          </div>
          <div class="installs">
            <div class="command">
              <span class="cmd">${escapeHtml(entry.command)}</span>
              <span class="run">Terminal</span>
            </div>
          </div>
        </section>
      `;
        })
            .join("");
        return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      :root {
        --accent: var(--vscode-textLink-foreground);
        --card-bg: color-mix(in srgb, var(--vscode-sideBar-background) 92%, var(--accent) 8%);
        --chip-bg: color-mix(in srgb, var(--vscode-textBlockQuote-background) 90%, var(--accent) 10%);
        --shadow: 0 6px 20px color-mix(in srgb, #000 20%, transparent);
      }
      body {
        font-family: "Space Grotesk", var(--vscode-font-family);
        color: var(--vscode-foreground);
        padding: 12px;
      }
      h1 {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin: 0 0 12px;
      }
      .card {
        border: 1px solid var(--vscode-panel-border);
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 10px;
        background: var(--card-bg);
        box-shadow: var(--shadow);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }
      .title {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .logo {
        width: 18px;
        height: 18px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
      }
      .name {
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .toggle {
        display: inline-flex;
        align-items: center;
      }
      .toggle input {
        position: absolute;
        opacity: 0;
      }
      .switch {
        width: 34px;
        height: 18px;
        background: color-mix(in srgb, var(--vscode-input-background) 70%, #000 30%);
        border-radius: 999px;
        position: relative;
        border: 1px solid var(--vscode-panel-border);
        transition: background 0.2s ease;
      }
      .switch::after {
        content: "";
        position: absolute;
        top: 1px;
        left: 1px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.2s ease;
      }
      .toggle input:checked + .switch {
        background: var(--accent);
      }
      .toggle input:checked + .switch::after {
        transform: translateX(16px);
      }
      .link-button {
        color: var(--vscode-textLink-foreground);
        background: transparent;
        border: 1px solid color-mix(in srgb, var(--accent) 70%, #fff 30%);
        border-radius: 6px;
        padding: 2px 8px;
        cursor: pointer;
        font-size: 12px;
      }
      .installs {
        display: grid;
        gap: 6px;
      }
      .command {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: center;
        background: var(--chip-bg);
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid var(--vscode-panel-border);
        font-size: 11px;
        color: inherit;
        cursor: pointer;
      }
      .cmd {
        font-family: "JetBrains Mono", var(--vscode-editor-font-family);
        overflow-x: auto;
        white-space: nowrap;
      }
      .run {
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
      }
      .notes {
        display: grid;
        gap: 4px;
        margin-top: 8px;
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
      }
      .notes a {
        color: var(--vscode-textLink-foreground);
        text-decoration: none;
      }
      .codicon {
        font-family: var(--vscode-icon-font-family);
        font-size: 18px;
        line-height: 1;
        color: var(--vscode-foreground);
      }
      .custom-form {
        border: 1px dashed var(--vscode-panel-border);
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 12px;
      }
      .custom-form label {
        display: grid;
        gap: 6px;
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        margin-bottom: 8px;
      }
      .custom-form input {
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
        border-radius: 6px;
        padding: 6px 8px;
      }
      .custom-actions {
        display: flex;
        gap: 8px;
      }
      .primary-button {
        background: var(--accent);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 12px;
      }
      .secondary-button {
        background: transparent;
        border: 1px solid var(--vscode-panel-border);
        color: inherit;
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 12px;
      }
      .danger-button {
        background: transparent;
        border: 1px solid color-mix(in srgb, #ff5a5a 70%, #fff 30%);
        color: #ff6b6b;
        border-radius: 6px;
        padding: 2px 8px;
        cursor: pointer;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <h1>LLM Launcher</h1>
    <section class="custom-form">
      <label>
        Name
        <input id="custom-name" type="text" placeholder="My LLM" />
      </label>
      <label>
        Command
        <input id="custom-command" type="text" placeholder="my-llm --help" />
      </label>
      <label>
        Icon URL or codicon (e.g. $(rocket))
        <input id="custom-icon" type="text" placeholder="https://... or $(rocket)" />
      </label>
      <div class="custom-actions">
        <button class="primary-button" id="custom-save" type="button">Save</button>
        <button class="secondary-button" id="custom-clear" type="button">Clear</button>
      </div>
    </section>
    ${entryHtml}
    ${customHtml}
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      const nameInput = document.getElementById('custom-name');
      const commandInput = document.getElementById('custom-command');
      const iconInput = document.getElementById('custom-icon');
      const saveButton = document.getElementById('custom-save');
      const clearButton = document.getElementById('custom-clear');
      saveButton.addEventListener('click', () => {
        vscode.postMessage({
          type: 'saveCustom',
          name: nameInput.value,
          command: commandInput.value,
          icon: iconInput.value,
        });
      });
      clearButton.addEventListener('click', () => {
        nameInput.value = '';
        commandInput.value = '';
        iconInput.value = '';
      });
      document.querySelectorAll('input[data-key]').forEach((input) => {
        input.addEventListener('change', (event) => {
          vscode.postMessage({
            type: 'toggle',
            key: event.target.dataset.key,
            value: event.target.checked,
          });
        });
      });
      document.querySelectorAll('[data-url]').forEach((link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          vscode.postMessage({
            type: 'openLink',
            url: event.target.dataset.url,
          });
        });
      });
      document.querySelectorAll('.installs').forEach((list) => {
        list.querySelectorAll('.command').forEach((button) => {
          button.addEventListener('click', () => {
            vscode.postMessage({
              type: 'runCommand',
              key: list.dataset.key,
              name: list.dataset.name,
              command: button.dataset.command,
            });
          });
        });
      });
      document.querySelectorAll('[data-custom-run]').forEach((button) => {
        button.addEventListener('click', () => {
          vscode.postMessage({
            type: 'runCustom',
            name: button.dataset.name,
            command: button.dataset.command,
            icon: button.dataset.icon,
          });
        });
      });
      document.querySelectorAll('[data-custom-delete]').forEach((button) => {
        button.addEventListener('click', () => {
          vscode.postMessage({
            type: 'deleteCustom',
            id: button.dataset.id,
          });
        });
      });
    </script>
  </body>
</html>`;
    }
}
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function escapeAttribute(value) {
    return escapeHtml(value);
}
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
async function splitEditorAndOpenTerminal(command) {
    await vscode.commands.executeCommand(command);
    await vscode.commands.executeCommand("workbench.action.createTerminalEditor");
}
function activate(context) {
    const codexIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "codex.svg");
    const geminiIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "gemini.svg");
    const openCodeIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "opencode.svg");
    const openSpecIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "openspec.svg");
    const qwenIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "qwen.svg");
    const claudeIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "claude.svg");
    const llmPanelProvider = new LlmPanelProvider(context.extensionUri, {
        codex: codexIcon,
        gemini: geminiIcon,
        openCode: openCodeIcon,
        openSpec: openSpecIcon,
        qwen: qwenIcon,
        claude: claudeIcon,
    });
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("openTerminalEditor.llmPanelView", llmPanelProvider));
    const openTerminal = vscode.commands.registerCommand(COMMAND_ID, async () => {
        try {
            createEditorTerminal(undefined, "Terminal");
        }
        catch (error) {
            console.error("Failed to open terminal editor tab", error);
            vscode.window.showErrorMessage("Unable to open a terminal in the editor area.");
        }
    });
    const openCodex = vscode.commands.registerCommand(CODEX_COMMAND_ID, async () => {
        try {
            createEditorTerminal("codex", "Codex", codexIcon);
        }
        catch (error) {
            console.error("Failed to open Codex terminal", error);
            vscode.window.showErrorMessage("Unable to open Codex in the editor.");
        }
    });
    const openGemini = vscode.commands.registerCommand(GEMINI_COMMAND_ID, async () => {
        try {
            createEditorTerminal("gemini", "Gemini", geminiIcon);
        }
        catch (error) {
            console.error("Failed to open Gemini terminal", error);
            vscode.window.showErrorMessage("Unable to open Gemini in the editor.");
        }
    });
    const openOpenCode = vscode.commands.registerCommand(OPENCODE_COMMAND_ID, async () => {
        try {
            createEditorTerminal("opencode", "OpenCode", openCodeIcon);
        }
        catch (error) {
            console.error("Failed to open OpenCode terminal", error);
            vscode.window.showErrorMessage("Unable to open OpenCode in the editor.");
        }
    });
    const openOpenSpec = vscode.commands.registerCommand(OPENSPEC_COMMAND_ID, async () => {
        try {
            createEditorTerminal("openspec init", "OpenSpec", openSpecIcon);
        }
        catch (error) {
            console.error("Failed to open OpenSpec terminal", error);
            vscode.window.showErrorMessage("Unable to open OpenSpec in the editor.");
        }
    });
    const openQwen = vscode.commands.registerCommand(QWEN_COMMAND_ID, async () => {
        try {
            createEditorTerminal("qwen", "Qwen", qwenIcon);
        }
        catch (error) {
            console.error("Failed to open Qwen terminal", error);
            vscode.window.showErrorMessage("Unable to open Qwen in the editor.");
        }
    });
    const openClaude = vscode.commands.registerCommand(CLAUDE_COMMAND_ID, async () => {
        try {
            createEditorTerminal("claude", "Claude", claudeIcon);
        }
        catch (error) {
            console.error("Failed to open Claude terminal", error);
            vscode.window.showErrorMessage("Unable to open Claude in the editor.");
        }
    });
    context.subscriptions.push(openTerminal, openCodex, openGemini, openOpenCode, openOpenSpec, openQwen, openClaude);
    const splitLeft = vscode.commands.registerCommand(SPLIT_LEFT_COMMAND_ID, async () => {
        await splitEditorAndOpenTerminal("workbench.action.splitEditorLeft");
    });
    const splitRight = vscode.commands.registerCommand(SPLIT_RIGHT_COMMAND_ID, async () => {
        await splitEditorAndOpenTerminal("workbench.action.splitEditorRight");
    });
    const splitUp = vscode.commands.registerCommand(SPLIT_UP_COMMAND_ID, async () => {
        await splitEditorAndOpenTerminal("workbench.action.splitEditorUp");
    });
    const splitDown = vscode.commands.registerCommand(SPLIT_DOWN_COMMAND_ID, async () => {
        await splitEditorAndOpenTerminal("workbench.action.splitEditorDown");
    });
    context.subscriptions.push(splitLeft, splitRight, splitUp, splitDown);
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("openTerminalEditor")) {
            updateVisibilityContexts();
            llmPanelProvider.render();
        }
    }));
    updateVisibilityContexts();
    updateTerminalEditorContext();
    context.subscriptions.push(vscode.window.onDidChangeActiveTerminal(() => {
        updateTerminalEditorContext();
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map