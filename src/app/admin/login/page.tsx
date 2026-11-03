"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Shield } from "lucide-react";
import { Button } from "@/components/Button";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const nextPath = searchParams.get("next") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    reason === "forbidden"
      ? "Access denied: that account is not authorized for THE UNWRITTEN / CONTROL."
      : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid administrator credentials.");
      }

      const safeDestination =
        nextPath.startsWith("/admin") && !nextPath.startsWith("/admin/login")
          ? nextPath
          : "/admin/dashboard";

      router.replace(safeDestination);
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Authentication failed."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#1B1815] border border-[#2F2A25] rounded-sm p-7 sm:p-9 space-y-7 shadow-xl">
      <div className="space-y-2 text-center border-b border-[#2F2A25] pb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#24201C] border border-[#3A332C] mb-1">
          <Shield className="w-4 h-4 text-[#8FA184]" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#8FA184] font-mono">
          THE UNWRITTEN / CONTROL
        </p>
        <h1 className="font-serif text-2xl text-[#FAF7F2]">
          Curator Authentication
        </h1>
        <p className="text-xs text-[#A89F93] leading-relaxed">
          Restricted single-operator control centre. Authenticated via Supabase
          Auth with server-verified email allowlist.
        </p>
      </div>

      <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
        <div>
          <label
            htmlFor="admin-email"
            className="block text-[10px] uppercase tracking-[0.2em] text-[#A89F93] mb-1.5"
          >
            Authorized Administrator Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="curator@domain.com"
            className="w-full px-3.5 py-2.5 bg-[#12100E] border border-[#3A332C] rounded-sm text-sm text-[#FAF7F2] placeholder:text-[#6E665E] focus:outline-none focus:border-[#FAF7F2]"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-[10px] uppercase tracking-[0.2em] text-[#A89F93] mb-1.5"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 bg-[#12100E] border border-[#3A332C] rounded-sm text-sm text-[#FAF7F2] placeholder:text-[#6E665E] focus:outline-none focus:border-[#FAF7F2]"
          />
        </div>

        {errorMsg && (
          <p
            role="alert"
            className="text-xs text-[#E8B4B0] bg-[#9E6B68]/20 border border-[#9E6B68]/45 px-3.5 py-2.5 rounded-sm leading-relaxed"
          >
            {errorMsg}
          </p>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="ivory"
            size="md"
            disabled={isSubmitting}
            className="w-full"
          >
            <Lock className="w-3.5 h-3.5 mr-2" />
            <span>
              {isSubmitting ? "Verifying Credentials..." : "Enter Control Centre"}
            </span>
          </Button>
        </div>
      </form>

      <div className="pt-3 border-t border-[#2F2A25] flex items-center justify-between text-[11px] text-[#8A8178]">
        <span>No public registration</span>
        <Link href="/" className="hover:text-[#FAF7F2] transition-colors">
          ← Public Experience
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#12100E] text-[#FAF7F2] flex flex-col items-center justify-center px-5 py-12">
      <Suspense
        fallback={
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A8178]">
            Initializing Security Gate...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}

