"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AdminAuditLogEntry } from "@/lib/platform-types";
import { DeletionRequest } from "@/lib/types";
import { formatDateTime } from "@/components/admin/formatters";
import { InfrastructureLiveOpsPanel } from "@/components/admin/InfrastructureLiveOpsPanel";

interface SettingsPayload {
  adminEmail: string;
  adminUserId: string;
  settings: {
    storageBackend: string;
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
  auditLogs: AdminAuditLogEntry[];
}

export default function AdminSettingsPage() {
  const [data, setData] = useState<SettingsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const json = (await res.json()) as SettingsPayload;
          if (active) setData(json);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-[0.22em] text-[#8A8178]">
        Loading Security &amp; Governance Diagnostics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-[#DDD4C5] pb-5">
        <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
          Security, Governance &amp; Creator Provenance
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
          Platform Architecture &amp; Settings
        </h1>
      </header>

      {/* Creator Provenance & AI-Assisted Architecture Banner */}
      <section className="p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DEC9] pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono tracking-[0.22em] text-[#545E4E] font-bold block">
              Independent Creation Provenance
            </span>
            <h2 className="font-serif text-xl font-bold text-[#1C1917]">
              THE UNWRITTEN — Built by Anish Patil
            </h2>
          </div>
          <span className="px-3 py-1 bg-[#8FA184]/15 border border-[#8FA184]/40 text-[#545E4E] rounded text-xs font-mono font-bold">
            Human Vision × AI-Assisted Engineering
          </span>
        </div>

        <p className="text-xs text-[#57524C] leading-relaxed max-w-3xl">
          THE UNWRITTEN was conceived, designed, and developed independently by Anish Patil, utilizing artificial intelligence as an advanced creative and engineering partner for rapid visual iteration, LaTeX typesetting, and architecture verification. All game logic, curriculum mapping, and telemetry state machines are original systems.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 bg-white border border-[#DDD4C5] rounded space-y-0.5">
            <span className="text-[9px] uppercase text-[#8A8178] block">Lead Architect</span>
            <span className="font-bold text-[#1C1917]">Anish Patil</span>
          </div>
          <div className="p-3 bg-white border border-[#DDD4C5] rounded space-y-0.5">
            <span className="text-[9px] uppercase text-[#8A8178] block">Methodology</span>
            <span className="font-bold text-[#1C1917]">Independent · AI-Assisted</span>
          </div>
          <div className="p-3 bg-white border border-[#DDD4C5] rounded space-y-0.5">
            <span className="text-[9px] uppercase text-[#8A8178] block">Pillars</span>
            <span className="font-bold text-[#1C1917]">Senior Solo &amp; Junior Academy</span>
          </div>
        </div>
      </section>

      {/* Curator Access & Backend Status */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-3">
          <div className="flex items-center gap-2 text-[#545E4E] font-semibold uppercase tracking-[0.18em]">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Administrator Allowlist</span>
          </div>
          <p className="text-[#57524C]">
            Signed in as{" "}
            <strong className="font-mono text-[#1C1917]">
              {data.adminEmail}
            </strong>
          </p>
          <div className="pt-2 border-t border-[#E5DEC9]">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8178] block mb-1">
              Permitted Curator Identity
            </span>
            {data.settings.authorizedAdminEmails.map((em) => (
              <span
                key={em}
                className="inline-block px-2.5 py-1 bg-[#F3EDE2] border border-[#CFC5B4] rounded-sm font-mono"
              >
                {em}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178] block">
            Database &amp; RLS Diagnostics
          </span>
          <p>
            Active Backend:{" "}
            <strong className="font-mono">{data.settings.storageBackend}</strong>
          </p>
          <p>
            Supabase Configured:{" "}
            <strong className="font-mono">
              {data.settings.supabaseConfigured ? "Yes" : "No"}
            </strong>
          </p>
          <p>
            Service-Role Key Server-Only:{" "}
            <strong className="font-mono">
              {data.settings.serviceRoleConfigured ? "Configured" : "Pending"}
            </strong>
          </p>
        </div>
      </section>

      {/* Live Operations & Scalability Infrastructure Command */}
      <section>
        <InfrastructureLiveOpsPanel />
      </section>

      {/* Data Deletion Queue */}
      <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
        <div className="p-4 border-b border-[#DDD4C5]">
          <h2 className="font-serif text-xl text-[#1C1917]">
            Participant Data Deletion Requests (
            {data.settings.deletionRequests.length})
          </h2>
        </div>
        {data.settings.deletionRequests.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A8178]">
            No pending deletion requests.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                <th className="py-3 px-4">Identifier</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]">
              {data.settings.deletionRequests.map((req) => (
                <tr key={req.id}>
                  <td className="py-3 px-4 font-mono">{req.identifier}</td>
                  <td className="py-3 px-4">{req.reason || "—"}</td>
                  <td className="py-3 px-4 uppercase text-[10px]">
                    {req.status}
                  </td>
                  <td className="py-3 px-4">{formatDateTime(req.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Admin Audit Logs */}
      <section className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
        <div className="p-4 border-b border-[#DDD4C5]">
          <h2 className="font-serif text-xl text-[#1C1917]">
            Administrator Audit Log ({data.auditLogs.length})
          </h2>
        </div>
        {data.auditLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A8178]">
            Question edits, subject changes, and publication events are logged
            here automatically.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4">Curator</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]">
              {data.auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 px-4 font-mono text-[#545E4E]">
                    {log.action}
                  </td>
                  <td className="py-3 px-4">{log.summary}</td>
                  <td className="py-3 px-4 font-mono">{log.adminEmail}</td>
                  <td className="py-3 px-4">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
