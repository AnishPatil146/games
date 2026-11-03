import { z } from "zod";

const ServerEnvSchema = z.object({
  supabaseUrl: z.string().url().optional(),
  supabasePublicKey: z.string().min(10).optional(),
  supabaseServiceRoleKey: z.string().min(10).optional(),
  adminEmails: z.string().default("anishpatil146@gmail.com"),
});

export const AUTHORIZED_ADMIN_EMAIL = "anishpatil146@gmail.com";

export function getEnvConfig() {
  const raw = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
    supabasePublicKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      undefined,
    supabaseServiceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("your-")
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : undefined,
    adminEmails: process.env.ADMIN_EMAILS || AUTHORIZED_ADMIN_EMAIL,
  };

  const parsed = ServerEnvSchema.safeParse(raw);
  const data = parsed.success ? parsed.data : raw;

  return {
    supabaseUrl: data.supabaseUrl || "",
    supabasePublicKey: data.supabasePublicKey || "",
    supabaseServiceRoleKey: data.supabaseServiceRoleKey || "",
    isSupabaseConfigured: Boolean(data.supabaseUrl && data.supabasePublicKey),
    hasServiceRoleKey: Boolean(data.supabaseServiceRoleKey),
    allowedAdminEmails: (data.adminEmails || AUTHORIZED_ADMIN_EMAIL)
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e === AUTHORIZED_ADMIN_EMAIL),
  };
}

