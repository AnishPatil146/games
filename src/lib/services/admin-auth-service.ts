import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AUTHORIZED_ADMIN_EMAIL } from "../env";

const CREDENTIALS_FILE = path.join(process.cwd(), ".data", "admin-credentials.json");
const RECOVERY_TOKEN_FILE = path.join(process.cwd(), ".data", "admin-recovery-token.json");
export const ADMIN_SESSION_COOKIE_NAME = "the_unwritten_admin_session";

interface AdminCredentialsRecord {
  email: string;
  role: "SUPER_ADMIN";
  salt: string;
  hash: string;
  iterations: number;
  updatedAt: string;
}

interface AdminRecoveryTokenRecord {
  email: string;
  tokenHash: string;
  expiresAt: string;
  used: boolean;
}

/**
 * Derives a cryptographic HMAC signing secret for admin session tokens.
 */
function getSigningSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "the-unwritten-core-admin-hmac-secret-salt-2026"
  );
}

/**
 * Hashes a plaintext password using PBKDF2-SHA512 with 100,000 iterations.
 */
export function hashPassword(
  password: string,
  providedSalt?: string
): { salt: string; hash: string; iterations: number } {
  const salt = providedSalt || crypto.randomBytes(32).toString("hex");
  const iterations = 100_000;
  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, 64, "sha512")
    .toString("hex");
  return { salt, hash, iterations };
}

/**
 * Constant-time verification of password against salt and expected hash.
 */
export function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
  iterations = 100_000
): boolean {
  try {
    const computed = crypto
      .pbkdf2Sync(password, salt, iterations, 64, "sha512")
      .toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(expectedHash, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Reads local administrator credentials record.
 */
export function getStoredAdminCredentials(): AdminCredentialsRecord | null {
  try {
    if (!fs.existsSync(CREDENTIALS_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(CREDENTIALS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AdminCredentialsRecord;
    if (parsed.email === AUTHORIZED_ADMIN_EMAIL && parsed.salt && parsed.hash) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves or updates established administrator credentials.
 */
export function setAdminCredentials(password: string): { success: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters in length." };
  }

  const { salt, hash, iterations } = hashPassword(password);
  const record: AdminCredentialsRecord = {
    email: AUTHORIZED_ADMIN_EMAIL,
    role: "SUPER_ADMIN",
    salt,
    hash,
    iterations,
    updatedAt: new Date().toISOString(),
  };

  try {
    const dir = path.dirname(CREDENTIALS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(record, null, 2), "utf-8");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to persist administrator credentials.",
    };
  }
}

/**
 * Creates a signed, time-limited admin session token.
 */
export function createAdminSessionToken(
  email: string,
  role = "SUPER_ADMIN",
  expiresInSeconds = 86400
): string {
  const payload = {
    email: email.trim().toLowerCase(),
    role,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    iat: Math.floor(Date.now() / 1000),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Validates and decodes an admin session token.
 */
export function verifyAdminSessionToken(
  token?: string | null
): { valid: boolean; email?: string; role?: string; error?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing session token." };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed session token." };
  }

  const [encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return { valid: false, error: "Invalid cryptographic signature." };
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8")) as {
      email: string;
      role: string;
      exp: number;
    };

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: "Admin session has expired." };
    }

    if (payload.email !== AUTHORIZED_ADMIN_EMAIL) {
      return { valid: false, error: "Unauthorized administrator identity." };
    }

    return {
      valid: true,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return { valid: false, error: "Invalid token payload encoding." };
  }
}

/**
 * Generates a single-use administrator recovery token for disaster recovery.
 */
export function generateAdminRecoveryToken(): string {
  const rawSecret = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawSecret).digest("hex");
  const expiresAt = new Date(Date.now() + 3600_000 * 2).toISOString(); // 2 hours

  const record: AdminRecoveryTokenRecord = {
    email: AUTHORIZED_ADMIN_EMAIL,
    tokenHash,
    expiresAt,
    used: false,
  };

  const dir = path.dirname(RECOVERY_TOKEN_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(RECOVERY_TOKEN_FILE, JSON.stringify(record, null, 2), "utf-8");

  return rawSecret;
}

/**
 * Validates and consumes a single-use administrator recovery token.
 */
export function consumeAdminRecoveryToken(candidateSecret: string): boolean {
  try {
    if (!fs.existsSync(RECOVERY_TOKEN_FILE)) return false;
    const raw = fs.readFileSync(RECOVERY_TOKEN_FILE, "utf-8");
    const record = JSON.parse(raw) as AdminRecoveryTokenRecord;

    if (record.used || new Date(record.expiresAt) < new Date()) {
      return false;
    }

    const candidateHash = crypto.createHash("sha256").update(candidateSecret.trim()).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(candidateHash), Buffer.from(record.tokenHash))) {
      return false;
    }

    // Mark as consumed
    record.used = true;
    fs.writeFileSync(RECOVERY_TOKEN_FILE, JSON.stringify(record, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

