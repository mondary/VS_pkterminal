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
const VISIBILITY_KEYS = {
    codex: "openTerminalEditor.showCodex",
    gemini: "openTerminalEditor.showGemini",
    openCode: "openTerminalEditor.showOpenCode",
    openSpec: "openTerminalEditor.showOpenSpec",
    qwen: "openTerminalEditor.showQwen",
    claude: "openTerminalEditor.showClaude",
};
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
class LlmPanelProvider {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
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
            },
            {
                key: "gemini",
                name: "Gemini",
                url: "https://github.com/google-gemini/gemini-cli",
                installs: [
                    "npm install -g @google/gemini-cli",
                    "brew install gemini-cli",
                ],
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
            },
        ];
        const entryHtml = entries
            .map((entry) => {
            const installs = entry.installs
                .map((install) => `<code>${escapeHtml(install)}</code>`)
                .join("");
            const notes = entry.notes
                ? entry.notes
                    .map((note) => {
                    if (note.url) {
                        const label = note.label ?? note.text ?? "";
                        const text = note.text ?? "";
                        return `<a href="#" data-url="${note.url}">${escapeHtml(label)}</a><span>${escapeHtml(text)}</span>`;
                    }
                    return `<span>${escapeHtml(note.text ?? "")}</span>`;
                })
                    .join("")
                : "";
            return `
        <section class="card">
          <div class="header">
            <label>
              <input type="checkbox" data-key="${entry.key}" ${state[entry.key] ? "checked" : ""} />
              <span>${entry.name}</span>
            </label>
            <a href="#" data-url="${entry.url}">Install</a>
          </div>
          <div class="installs">${installs}</div>
          ${notes ? `<div class="notes">${notes}</div>` : ""}
        </section>
      `;
        })
            .join("");
        return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: var(--vscode-font-family);
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
        background: var(--vscode-sideBar-background);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }
      .header label {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .header a {
        color: var(--vscode-textLink-foreground);
        text-decoration: none;
        font-size: 12px;
      }
      .installs {
        display: grid;
        gap: 6px;
      }
      code {
        display: block;
        background: var(--vscode-textBlockQuote-background);
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 11px;
        overflow-x: auto;
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
    </style>
  </head>
  <body>
    <h1>LLM Launcher</h1>
    ${entryHtml}
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      document.querySelectorAll('input[data-key]').forEach((input) => {
        input.addEventListener('change', (event) => {
          vscode.postMessage({
            type: 'toggle',
            key: event.target.dataset.key,
            value: event.target.checked,
          });
        });
      });
      document.querySelectorAll('a[data-url]').forEach((link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          vscode.postMessage({
            type: 'openLink',
            url: event.target.dataset.url,
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
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
function activate(context) {
    const codexIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "codex.svg");
    const geminiIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "gemini.svg");
    const openCodeIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "opencode.svg");
    const openSpecIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "openspec.svg");
    const qwenIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "qwen.svg");
    const claudeIcon = vscode.Uri.joinPath(context.extensionUri, "resources", "claude.svg");
    const llmPanelProvider = new LlmPanelProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("openTerminalEditor.llmPanel", llmPanelProvider));
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
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("openTerminalEditor")) {
            updateVisibilityContexts();
            llmPanelProvider.render();
        }
    }));
    updateVisibilityContexts();
}
function deactivate() { }
//# sourceMappingURL=extension.js.map