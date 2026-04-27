export type Region = "us" | "ca" | "aus";

const BASE_URLS: Record<Region, string> = {
  us:  "https://api.themortgageoffice.com",
  ca:  "https://api-ca.themortgageoffice.com",
  aus: "https://api-aus.themortgageoffice.com",
};

export function getBaseUrl(region: Region = "us"): string {
  return BASE_URLS[region];
}

export interface TmoConfig {
  token:     string;
  database:  string;
  region:    Region;
  pageSize?: number;
}

export interface TmoProfile {
  name:     string;
  token:    string;
  database: string;
  region:   Region;
}

/**
 * Resolves startup credentials.
 * Falls back to sandbox so the server always starts — real calls will 401
 * until you switch to a valid profile via tmo_switch_profile.
 */
export function getConfig(): TmoConfig {
  const token    = process.env.TMO_TOKEN;
  const database = process.env.TMO_DATABASE;
  const region   = (process.env.TMO_REGION as Region) ?? "us";

  if (token && database) return { token, database, region, pageSize: 100 };

  // Fall back to sandbox so startup never crashes
  return { token: "TMO", database: "API Sandbox", region: "us", pageSize: 100 };
}

/**
 * Reads named profiles from a single TMO_PROFILES env var (JSON object).
 *
 * Set this once in Railway (or your .env) — no redeploy needed to switch:
 *
 *   TMO_PROFILES={"qa":{"token":"ABSWEB","database":"ABS QA Main"},"prod":{"token":"...","database":"..."}}
 *
 * Optionally include "region": "us" | "ca" | "aus" per profile (defaults to "us").
 * The built-in "sandbox" profile is always available.
 */
export function getProfiles(): TmoProfile[] {
  const profiles: TmoProfile[] = [
    { name: "sandbox", token: "TMO", database: "API Sandbox", region: "us" },
  ];

  const raw = process.env.TMO_PROFILES;
  if (!raw) return profiles;

  let parsed: Record<string, { token: string; database: string; region?: string }>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("TMO_PROFILES is not valid JSON — ignoring.");
    return profiles;
  }

  for (const [name, cfg] of Object.entries(parsed)) {
    if (!cfg.token || !cfg.database) continue;
    profiles.push({
      name:     name.toLowerCase(),
      token:    cfg.token,
      database: cfg.database,
      region:   (cfg.region as Region) ?? "us",
    });
  }

  return profiles;
}
