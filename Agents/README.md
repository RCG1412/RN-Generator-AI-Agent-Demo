# AI Documentation Demo - Agents & MCP Servers

This folder contains MCP servers, configuration templates, and setup scripts. AI skills (slash commands) are located in `.claude/commands/` at the repository root.

## Folder Structure

RN-Generator-AI-Agent-Demo/
├── .claude/commands/
│ ├── doc-writer.md
│ └── doc-reviewer.md
├── Agents/
│ ├── mcp-servers/
│ │ ├── quality-metric-mcp/
│ │ └── writing-rules-mcp/
│ ├── configs/
│ ├── setup/
│ └── README.md


## Component Reference
| Component | Name | Location |
|---|---|---|
| Doc Writer | `doc-writer` | `.claude/commands/doc-writer.md` |
| Doc Reviewer | `doc-reviewer` | `.claude/commands/doc-reviewer.md` |
| Quality Metric MCP | `quality-metric-mcp` | `Agents/mcp-servers/` |
| Writing Rules MCP | `writing-rules-mcp` | `Agents/mcp-servers/` |

## Restore After Disk Format

```bash
cd ~/Documents
mkdir RN-Generator
cd RN-Generator
git clone https://github.com/YOUR_USERNAME/RN-Generator-AI-Agent-Demo.git
cd RN-Generator-AI-Agent-Demo
chmod +x Agents/setup/setup-mac-linux.sh
./Agents/setup/setup-mac-linux.sh


---

## 15. Push Everything to GitHub

### 15.1 Create .gitignore

Create `.gitignore` in project root:

```gitignore
node_modules/
Agents/mcp-servers/quality-metric-mcp/node_modules/
Agents/mcp-servers/writing-rules-mcp/node_modules/
build/
Agents/mcp-servers/quality-metric-mcp/dist/
Agents/mcp-servers/writing-rules-mcp/dist/
.env
.env.local
.env.production
.DS_Store
Thumbs.db
.cursor/
.vscode/
.idea/
.claude/settings.json
.claude/settings.local.json
.claude/*.log
Agents/configs/mcp-config.json
Agents/configs/jira-credentials.json
*-credentials.txt
*.token
*.secret