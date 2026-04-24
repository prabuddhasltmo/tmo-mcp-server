import { getBaseUrl, getConfig, type TmoConfig } from "./config.js";

export interface TmoResponse<T = unknown> {
  Data: T;
  ErrorMessage: string;
  ErrorNumber: number;
  Status: number;
}

export class TmoClient {
  private config: TmoConfig;
  private baseUrl: string;

  constructor(config?: TmoConfig) {
    this.config = config ?? getConfig();
    this.baseUrl = getBaseUrl(this.config.region);
  }

  // ── Credential management ──────────────────────────────────────────────────

  /** Replace active credentials (token, database, and/or region). */
  updateConfig(patch: Partial<Pick<TmoConfig, "token" | "database" | "region">>): void {
    if (patch.token    !== undefined) this.config.token    = patch.token;
    if (patch.database !== undefined) this.config.database = patch.database;
    if (patch.region   !== undefined) {
      this.config.region  = patch.region;
      this.baseUrl        = getBaseUrl(patch.region);
    }
  }

  /**
   * Return the current config, masking most of the token for display.
   * e.g. "ABS WEB" → "AB*****"
   */
  getPublicConfig(): { token: string; database: string; region: string; baseUrl: string } {
    const t = this.config.token;
    const masked = t.length <= 3 ? "*".repeat(t.length) : t.slice(0, 2) + "*".repeat(t.length - 2);
    return {
      token:    masked,
      database: this.config.database,
      region:   this.config.region,
      baseUrl:  this.baseUrl,
    };
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Token: this.config.token,
      Database: this.config.database,
      ...extra,
    };
  }

  async get<T = unknown>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    paginationHeaders?: { pageSize?: number; offset?: number }
  ): Promise<TmoResponse<T>> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    const headers = this.buildHeaders(
      paginationHeaders
        ? {
            PageSize: String(paginationHeaders.pageSize ?? this.config.pageSize ?? 100),
            Offset: String(paginationHeaders.offset ?? 0),
          }
        : undefined
    );

    const res = await fetch(url.toString(), { method: "GET", headers });
    return res.json() as Promise<TmoResponse<T>>;
  }

  async post<T = unknown>(path: string, body: unknown): Promise<TmoResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });
    return res.json() as Promise<TmoResponse<T>>;
  }

  async patch<T = unknown>(path: string, body: unknown): Promise<TmoResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PATCH",
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });
    return res.json() as Promise<TmoResponse<T>>;
  }

  async delete<T = unknown>(path: string): Promise<TmoResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
    return res.json() as Promise<TmoResponse<T>>;
  }
}

// No module-level singleton — callers create TmoClient instances explicitly.
// (Avoids crashing at import time when env vars are not set, e.g. in the HTTP server.)
