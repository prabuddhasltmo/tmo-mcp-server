# Your Company — Claude Plugins

Internal Claude Code plugin marketplace.

## Plugins

| Plugin | Description |
|--------|-------------|
| `tmo-mcp` | The Mortgage Office API connector |

## Setup (one-time, per employee)

Add the following to `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "yourcompany-plugins": {
      "source": {
        "source": "github",
        "repo": "YourCompany/claude-plugins"
      }
    }
  }
}
```

Then in Claude Code, run `/plugin` → **Discover** → search **TMO**.

## Installation

```
/plugin install tmo-mcp@yourcompany-plugins
```
