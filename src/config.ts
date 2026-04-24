export type Region = "us" | "ca" | "aus";

const BASE_URLS: Record<Region, string> = {
  us: "https://api.themortgageoffice.com",
  ca: "https://api-ca.themortgageoffice.com",
  aus: "https://api-aus.themortgageoffice.com",
};

export function getBaseUrl(region: Region = "us"): string {
  return BASE_URLS[region];
}

export interface TmoConfig {
  token: string;
  database: string;
  region: Region;
  pageSize?: number;
}

export interface TmoProfile {
  name: string;
  token: string;
  database: string;
  region: Region;
}

export function getConfig(): TmoConfig {
  const token = process.env.TMO_TOKEN;
  const database = process.env.TMO_DATABASE;
  const region = (process.env.TMO_REGION as Region) || "us";

  if (!token) throw new Error("TMO_TOKEN environment variable is required");
  if (!database) throw new Error("TMO_DATABASE environment variable is required");

  return { token, database, region, pageSize: 100 };
}

/**
 * Discovers named profiles from environment variables.
 *
 * Convention:  TMO_TOKEN_<NAME>    and  TMO_DATABASE_<NAME>
 * Optional:    TMO_REGION_<NAME>
 *
 * Example:
 *   TMO_TOKEN_SANDBOX=TMO
 *   TMO_DATABASE_SANDBOX=API Sandbox
 *   TMO_TOKEN_PROD=<your token>
 *   TMO_DATABASE_PROD=001-5533-000-AM Team
 *
 * The built-in "sandbox" profile (Token=TMO, Database=API Sandbox) is
 * always available even if not defined in env.
 */
export function getProfiles(): TmoProfile[] {
  const profiles: TmoProfile[] = [
    // Built-in sandbox shortcut
    { name: "sandbox", token: "TMO", database: "API Sandbox", region: "us" },
  ];

  // Scan env for TMO_TOKEN_<NAME> pairs
  const seen = new Set<string>(["sandbox"]);
  for (const key of Object.keys(process.env)) {
    const match = key.match(/^TMO_TOKEN_(.+)$/);
    if (!match) continue;
    const name = match[1].toLowerCase();
    if (seen.has(name)) continue;
    const token = process.env[key] ?? "";
    const database = process.env[`TMO_DATABASE_${match[1]}`] ?? "";
    const region = ((process.env[`TMO_REGION_${match[1]}`] as Region) || "us");
    if (token && database) {
      profiles.push({ name, token, database, region });
      seen.add(name);
    }
  }

  return profiles;
}
