# TMO MCP Server

MCP server for [The Mortgage Office](https://www.themortgageoffice.com) API.
Exposes 150+ tools across Loan Origination (LOS), Loan Servicing (LSS), Shares, and Capital modules so you can query and manage TMO data directly from Claude.

---

## Adding it to Claude locally

### Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- A TMO API token and database name (get these from your TMO account manager)

---

### 1. Clone and build

```bash
git clone https://github.com/prabuddhasltmo/tmo-mcp-server.git
cd tmo-mcp-server
npm install
npm run build
```

---

### 2. Add to Claude Desktop

Open (or create) `~/Library/Application Support/Claude/claude_desktop_config.json` and add the `mcpServers` block:

```json
{
  "mcpServers": {
    "tmo-api": {
      "command": "node",
      "args": ["/absolute/path/to/tmo-mcp-server/dist/index.js"],
      "env": {
        "TMO_TOKEN": "your_api_token",
        "TMO_DATABASE": "your_database_name",
        "TMO_REGION": "us"
      }
    }
  }
}
```

Replace `/absolute/path/to/tmo-mcp-server` with the actual path where you cloned the repo.

**Then quit and reopen Claude Desktop.** The `tmo-api` connector will appear in your connectors list.

> **Sandbox access** — if you just want to test, use `TMO_TOKEN: "TMO"` and `TMO_DATABASE: "API Sandbox"`.

---

### 3. Add to Claude Code

Create (or update) a `.mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "tmo-api": {
      "command": "node",
      "args": ["/absolute/path/to/tmo-mcp-server/dist/index.js"],
      "env": {
        "TMO_TOKEN": "your_api_token",
        "TMO_DATABASE": "your_database_name",
        "TMO_REGION": "us"
      }
    }
  }
}
```

Claude Code picks this up automatically when you open that project folder. Run `/mcp` in the chat to confirm it connected.

---

### 4. Verify it's working

Ask Claude:
> *"Get all active loans from TMO"*

or

> *"Show me lenders modified in the last 30 days"*

---

## Switching databases at runtime

Once connected, you can switch between databases without restarting:

| What you want | What to say to Claude |
|---|---|
| See active credentials | `tmo_get_credentials` |
| Switch to a named profile | `tmo_switch_profile profile="prod"` |
| One-off override | `tmo_set_credentials token="..." database="..."` |
| List available profiles | `tmo_list_profiles` |

### Setting up named profiles

Add extra `TMO_TOKEN_<NAME>` / `TMO_DATABASE_<NAME>` pairs to your env block:

```json
"env": {
  "TMO_TOKEN":           "TMO",
  "TMO_DATABASE":        "API Sandbox",
  "TMO_TOKEN_PROD":      "your_prod_token",
  "TMO_DATABASE_PROD":   "001-5533-000-AM Team"
}
```

Then `tmo_switch_profile profile="prod"` to flip to production, or `tmo_switch_profile profile="sandbox"` to go back.

---

## What's available

| Group | Example tools |
|---|---|
| **Loans (LSS)** | `lss_get_loans`, `lss_get_loan`, `lss_patch_loan`, `lss_get_payoff_quote` |
| **Payments** | `lss_create_payment`, `lss_create_payoff_payment`, `lss_get_borrower_payment_register` |
| **Lenders** | `lss_get_lenders`, `lss_get_lender_portfolio`, `lss_new_lender`, `lss_update_lender` |
| **Properties** | `lss_get_loan_properties`, `lss_new_property`, `lss_search_properties` |
| **Insurance** | `lss_get_insurances`, `lss_new_insurance`, `lss_update_insurance` |
| **Escrow** | `lss_get_escrow_vouchers`, `lss_new_escrow_voucher` |
| **Trust** | `lss_get_loan_trust_ledger`, `lss_new_trust_ledger_deposit` |
| **Charges** | `lss_get_loan_charges`, `lss_new_loan_charge` |
| **History & Events** | `lss_get_all_loan_history`, `lss_get_events_journal` |
| **ARM** | `lss_get_arm_indexes`, `lss_new_arm_index` |
| **Funding** | `lss_get_loan_funding`, `lss_add_funding` |
| **Loan Origination** | `los_get_loans`, `los_new_loan`, `los_get_loan_application` |
| **Shares** | `shares_get_pools`, `shares_get_distributions`, `shares_get_history` |
| **Capital** | `capital_get_pools`, `capital_get_partners`, `capital_get_distributions` |

---

## Remote deployment (company-wide)

See [`src/http-server-oauth.ts`](src/http-server-oauth.ts) for the Microsoft 365 OAuth version that can be deployed once and shared across your whole company via Claude's Admin Settings → Connectors.
