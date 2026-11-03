"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogOut, RefreshCw, ShieldAlert } from "lucide-react";
import { DeletionRequest } from "@/lib/types";
import { Button } from "@/components/Button";
import { formatDateTime } from "@/components/admin/formatters";

interface SettingsPayload {
  adminEmail: string;
  adminUserId?: string;
  settings: {
    storageBackend: "supabase" | "local_fallback";
    schemaReady: boolean;
    schemaNotice?: string;
    supabaseConfigured: boolean;
    serviceRoleConfigured: boolean;
    authorizedAdminEmails: string[];
    deletionRequests: DeletionRequest[];
    recordCounts: {
      players: number;
      sessions: number;
      events: number;
      preferences: number;
    };
  };
}

async function requestAdminSettings(): Promise<SettingsPayload> {
  const res = await fetch("/api/admin/settings", { cache: "no-store" });
  const data = (await res.json()) as Partial<SettingsPayload> & {
    error?: string;
  };
  if (!res.ok || !data.settings || !data.adminEmail) {
    throw new Error(data.error || "Unable to load settings.");
  }
  return {
    adminEmail: data.adminEmail,
    adminUserId: data.adminUserId,
    settings: data.settings,
  };
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<SettingsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const nextPayload = await requestAdminSettings();
      setPayload(nextPayload);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load settings."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestAdminSettings()
      .then((nextPayload) => {
        if (active) setPayload(nextPayload);
      })
      .catch((err: unknown) => {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to load settings."
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#8A8178] font-mono">
            Control Centre · Governance &amp; System Diagnostics
          </p>
          <h1 className="font-serif text-3xl text-[#1C1917] mt-1">Settings</h1>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isLoading}
          onClick={() => void loadSettings()}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {errorMsg && (
        <p className="p-4 bg-[#F5EBEA] border border-[#9E6B68]/35 rounded-sm text-xs text-[#9E6B68]">
          {errorMsg}
        </p>
      )}

      {isLoading && !payload ? (
        <div className="py-24 text-center text-xs uppercase tracking-[0.24em] text-[#8A8178]">
          Loading governance &amp; system diagnostics...
        </div>
      ) : payload ? (
        <>
          {/* 1. Authenticated Administrator Profile */}
          <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#545E4E] font-semibold">
                  Authenticated Curator Session
                </p>
                <h2 className="font-serif text-2xl text-[#1C1917]">
                  {payload.adminEmail}
                </h2>
                {payload.adminUserId && (
                  <p className="text-xs font-mono text-[#8A8178]">
                    Supabase Auth UID: {payload.adminUserId}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                {isLoggingOut ? "Signing Out..." : "Terminate Admin Session"}
              </Button>
            </div>

            <div className="pt-4 border-t border-[#EDE6DA] text-xs text-[#57524C]">
              <span className="font-medium text-[#1C1917]">
                Server Allowlist (ADMIN_EMAILS):
              </span>{" "}
              <span className="font-mono">
                {payload.settings.authorizedAdminEmails.join(", ")}
              </span>
            </div>
          </section>

          {/* 2. Non-Secret Environment & Database Diagnostics */}
          <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-5">
            <div>
              <h2 className="font-serif text-xl text-[#1C1917]">
                Environment &amp; Database Health
              </h2>
              <p className="text-xs text-[#57524C]">
                Safe boolean diagnostics only—API keys and service credentials
                are never rendered to the client.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <DiagnosticItem
                label="Supabase Public Env"
                ok={payload.settings.supabaseConfigured}
                detail={
                  payload.settings.supabaseConfigured
                    ? "URL & Publishable Key set"
                    : "Missing NEXT_PUBLIC_SUPABASE_*"
                }
              />
              <DiagnosticItem
                label="Database Schema & RLS"
                ok={payload.settings.schemaReady}
                detail={
                  payload.settings.schemaReady
                    ? "Tables & RPCs operational"
                    : "Run supabase/schema.sql"
                }
              />
              <DiagnosticItem
                label="Service Role Key"
                ok={payload.settings.serviceRoleConfigured}
                detail={
                  payload.settings.serviceRoleConfigured
                    ? "Configured on server"
                    : "Using JWT RLS policy fallback"
                }
              />
              <DiagnosticItem
                label="Active Storage Mode"
                ok={payload.settings.storageBackend === "supabase"}
                detail={
                  payload.settings.storageBackend === "supabase"
                    ? "Supabase PostgreSQL"
                    : "Local Dev Store (.data)"
                }
              />
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#EDE6DA] text-xs">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                  Players Table
                </dt>
                <dd className="font-mono text-lg text-[#1C1917] mt-0.5">
                  {payload.settings.recordCounts.players}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                  Sessions Table
                </dt>
                <dd className="font-mono text-lg text-[#1C1917] mt-0.5">
                  {payload.settings.recordCounts.sessions}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                  Gameplay Events
                </dt>
                <dd className="font-mono text-lg text-[#1C1917] mt-0.5">
                  {payload.settings.recordCounts.events}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                  Preferences Rows
                </dt>
                <dd className="font-mono text-lg text-[#1C1917] mt-0.5">
                  {payload.settings.recordCounts.preferences}
                </dd>
              </div>
            </dl>
          </section>

          {/* 3. Privacy, Data Retention & Deletion Requests Queue */}
          <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm p-6 space-y-5">
            <div>
              <h2 className="font-serif text-xl text-[#1C1917]">
                Privacy &amp; Data Deletion Requests (
                {payload.settings.deletionRequests.length})
              </h2>
              <p className="text-xs text-[#57524C]">
                Submitted via the public <code>/privacy</code> erasure form.
              </p>
            </div>

            {payload.settings.deletionRequests.length === 0 ? (
              <p className="text-xs text-[#8A8178] py-6 text-center border border-dashed border-[#DDD4C5] rounded-sm">
                No personal-data deletion requests currently queued.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                      <th className="py-2.5 pr-4">Identifier</th>
                      <th className="py-2.5 px-4">Context Note</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 pl-4 text-right">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE6DA]">
                    {payload.settings.deletionRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="py-3 pr-4 font-mono font-medium text-[#1C1917]">
                          {req.identifier}
                        </td>
                        <td className="py-3 px-4 text-[#57524C]">
                          {req.reason || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 text-[10px] uppercase bg-[#EFE4CE] text-[#7E6747] rounded-sm">
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right text-[#57524C]">
                          {formatDateTime(req.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function DiagnosticItem({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <div className="p-4 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
          {label}
        </span>
        {ok ? (
          <CheckCircle2 className="w-4 h-4 text-[#545E4E]" />
        ) : (
          <ShieldAlert className="w-4 h-4 text-[#9E6B68]" />
        )}
      </div>
      <p className="text-xs font-medium text-[#1C1917]">{detail}</p>
    </div>
  );
}
