/**
 * TMO MCP — Remote HTTP Server with Microsoft 365 OAuth
 *
 * Users click "Connect" in Claude → Microsoft login → authenticated.
 * The server uses company-wide TMO credentials; Microsoft identity
 * just gates who is allowed in (optionally restricted to one domain).
 *
 * Environment variables required:
 *   AZURE_TENANT_ID      – Azure AD tenant ID (from App Registration)
 *   AZURE_CLIENT_ID      – Azure AD app client ID
 *   AZURE_CLIENT_SECRET  – Azure AD app client secret
 *   BASE_URL             – Public URL of this server (e.g. https://tmo-mcp.up.railway.app)
 *   TMO_TOKEN            – Company TMO API token
 *   TMO_DATABASE         – Company TMO database name
 *   ALLOWED_DOMAIN       – (optional) restrict to one email domain, e.g. yourcompany.com
 *   PORT                 – (optional) port, defaults to 3000
 *
 * Azure App Registration:
 *   1. portal.azure.com → App registrations → New registration
 *   2. Supported account types: "Accounts in this organizational directory only"
 *   3. Redirect URI → Web → https://YOUR_BASE_URL/oauth/callback
 *   4. Certificates & secrets → New client secret → copy value → AZURE_CLIENT_SECRET
 *   5. Copy Application (client) ID → AZURE_CLIENT_ID
 *   6. Copy Directory (tenant) ID → AZURE_TENANT_ID
 *   7. API permissions → Add → Microsoft Graph → Delegated → openid, email, profile, User.Read
 */

import { randomUUID } from "node:crypto";
import express, { type Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcpAuthRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import type { OAuthServerProvider, AuthorizationParams } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { OAuthRegisteredClientsStore } from "@modelcontextprotocol/sdk/server/auth/clients.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type {
  OAuthClientInformationFull,
  OAuthTokenRevocationRequest,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { TmoClient } from "./client.js";
import { registerAllTools } from "./register-tools.js";
import type { Region } from "./config.js";

// ── Config ────────────────────────────────────────────────────────────────────
const {
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
  BASE_URL,
  TMO_TOKEN,
  TMO_DATABASE,
  TMO_REGION = "us",
  ALLOWED_DOMAIN,
  PORT = "3000",
} = process.env;

for (const [k, v] of Object.entries({ AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, BASE_URL, TMO_TOKEN, TMO_DATABASE })) {
  if (!v) throw new Error(`Missing required env var: ${k}`);
}

const MS_BASE = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0`;
const CALLBACK_URL = `${BASE_URL}/oauth/callback`;
const MS_SCOPES = "openid email profile offline_access User.Read";

// ── Microsoft OAuth provider ──────────────────────────────────────────────────
class MicrosoftOAuthProvider implements OAuthServerProvider {
  /** Let Microsoft handle PKCE — skip local validation */
  skipLocalPkceValidation = true;

  /** Dynamically registered MCP clients (Claude Desktop registers on first connect) */
  private readonly clients = new Map<string, OAuthClientInformationFull>();

  /**
   * Pending authorizations: state → { claudeRedirectUri }
   * Allows us to forward back to Claude's callback after Microsoft auth.
   */
  private readonly pending = new Map<string, { redirectUri: string }>();

  /**
   * Proxy codes: our opaque code → real Microsoft authorization code
   * Prevents Claude from ever seeing Microsoft codes directly.
   */
  private readonly codes = new Map<string, string>();

  // ── OAuthServerProvider interface ──────────────────────────────────────────

  get clientsStore(): OAuthRegisteredClientsStore {
    return {
      getClient: async (id) => this.clients.get(id),
      registerClient: async (client) => {
        const registered: OAuthClientInformationFull = {
          ...client,
          client_id: randomUUID(),
          client_id_issued_at: Math.floor(Date.now() / 1000),
        };
        this.clients.set(registered.client_id, registered);
        return registered;
      },
    };
  }

  async authorize(
    _client: OAuthClientInformationFull,
    params: AuthorizationParams,
    res: Response
  ): Promise<void> {
    const state = params.state ?? randomUUID();
    this.pending.set(state, { redirectUri: params.redirectUri });

    const url = new URL(`${MS_BASE}/authorize`);
    url.searchParams.set("client_id", AZURE_CLIENT_ID!);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", CALLBACK_URL);
    url.searchParams.set("scope", MS_SCOPES);
    url.searchParams.set("state", state);
    // Forward PKCE challenge so Microsoft can validate it at token exchange
    url.searchParams.set("code_challenge", params.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");

    res.redirect(url.toString());
  }

  /** Called by our /oauth/callback route (not part of the interface) */
  async handleMicrosoftCallback(
    msCode: string,
    state: string,
    res: Response
  ): Promise<void> {
    const pend = this.pending.get(state);
    if (!pend) { res.status(400).send("Invalid or expired state"); return; }
    this.pending.delete(state);

    // Wrap the Microsoft code in our own opaque proxy code
    const proxyCode = randomUUID();
    this.codes.set(proxyCode, msCode);

    const redirect = new URL(pend.redirectUri);
    redirect.searchParams.set("code", proxyCode);
    redirect.searchParams.set("state", state);
    res.redirect(redirect.toString());
  }

  async challengeForAuthorizationCode(): Promise<string> {
    // skipLocalPkceValidation = true means this is never actually used
    return "";
  }

  async exchangeAuthorizationCode(
    _client: OAuthClientInformationFull,
    proxyCode: string,
    codeVerifier?: string
  ): Promise<OAuthTokens> {
    const msCode = this.codes.get(proxyCode);
    if (!msCode) throw new Error("Invalid or expired authorization code");
    this.codes.delete(proxyCode);

    const body = new URLSearchParams({
      client_id: AZURE_CLIENT_ID!,
      client_secret: AZURE_CLIENT_SECRET!,
      code: msCode,
      redirect_uri: CALLBACK_URL,
      grant_type: "authorization_code",
      ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
    });

    const resp = await fetch(`${MS_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Microsoft token exchange failed: ${err}`);
    }

    const t = await resp.json() as Record<string, unknown>;
    return {
      access_token: t.access_token as string,
      token_type: "Bearer",
      expires_in: t.expires_in as number,
      refresh_token: t.refresh_token as string | undefined,
      scope: t.scope as string,
    };
  }

  async exchangeRefreshToken(
    _client: OAuthClientInformationFull,
    refreshToken: string
  ): Promise<OAuthTokens> {
    const body = new URLSearchParams({
      client_id: AZURE_CLIENT_ID!,
      client_secret: AZURE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      scope: MS_SCOPES,
    });

    const resp = await fetch(`${MS_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!resp.ok) throw new Error("Token refresh failed");
    const t = await resp.json() as Record<string, unknown>;
    return {
      access_token: t.access_token as string,
      token_type: "Bearer",
      expires_in: t.expires_in as number,
      refresh_token: t.refresh_token as string | undefined,
      scope: t.scope as string,
    };
  }

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const resp = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resp.ok) throw new Error("Invalid or expired Microsoft token");

    const user = await resp.json() as Record<string, unknown>;
    const email = (user.mail ?? user.userPrincipalName ?? "") as string;

    if (ALLOWED_DOMAIN && !email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN.toLowerCase()}`)) {
      throw new Error(`Unauthorized: ${email} is not in ${ALLOWED_DOMAIN}`);
    }

    return {
      token,
      clientId: AZURE_CLIENT_ID!,
      scopes: ["openid", "email", "profile"],
      extra: { email, name: user.displayName as string },
    };
  }

  async revokeToken(
    _client: OAuthClientInformationFull,
    request: OAuthTokenRevocationRequest
  ): Promise<void> {
    // Microsoft doesn't have a dedicated revocation endpoint for access tokens;
    // logging out the session is the closest equivalent.
    await fetch(`${MS_BASE}/logout`, { method: "GET" }).catch(() => {});
    void request; // nothing more to do
  }
}

// ── Express app ───────────────────────────────────────────────────────────────
const oauthProvider = new MicrosoftOAuthProvider();
const app = express();
app.use(express.json());

// OAuth routes (/.well-known/oauth-authorization-server, /register, /authorize, /token, /revoke)
app.use(
  mcpAuthRouter({
    provider: oauthProvider,
    issuerUrl: new URL(BASE_URL!),
    baseUrl:   new URL(BASE_URL!),
    resourceName: "TMO API",
  })
);

// Microsoft redirects here after user signs in
app.get("/oauth/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query as Record<string, string>;
  if (error) {
    res.status(400).send(`Auth error: ${error} — ${error_description ?? ""}`);
    return;
  }
  if (!code || !state) {
    res.status(400).send("Missing code or state");
    return;
  }
  await oauthProvider.handleMicrosoftCallback(code, state, res);
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", server: "tmo-api", auth: "microsoft365", version: "1.0.0" });
});

// MCP endpoint — requires a valid Microsoft Bearer token
app.all(
  "/mcp",
  requireBearerAuth({ verifier: oauthProvider }),
  async (req, res) => {
    const client = new TmoClient({
      token:    TMO_TOKEN!,
      database: TMO_DATABASE!,
      region:   (TMO_REGION as Region) ?? "us",
      pageSize: 100,
    });

    const server = new McpServer({ name: "tmo-api", version: "1.0.0" });
    registerAllTools(server, client);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }
);

app.listen(Number(PORT), () => {
  console.log(`✅  TMO MCP (Microsoft 365 OAuth) listening on port ${PORT}`);
  console.log(`    Health:        ${BASE_URL}/health`);
  console.log(`    MCP:           ${BASE_URL}/mcp`);
  console.log(`    OAuth callback: ${CALLBACK_URL}`);
  if (ALLOWED_DOMAIN) console.log(`    Restricted to: @${ALLOWED_DOMAIN}`);
});
