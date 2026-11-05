"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Lock, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const nextPath = searchParams.get("next") || "/admin/dashboard";

  const [activeTab, setActiveTab] = useState<"login" | "recover">("login");
  const [email, setEmail] = useState("anishpatil146@gmail.com");
  const [password, setPassword] = useState("");
  const [recoverySecret, setRecoverySecret] = useState("SilenceSpeaks#2026");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    reason === "forbidden"
      ? "Access denied: that account is not authorized for THE UNWRITTEN / CONTROL."
      : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
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

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("New administrator password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "anishpatil146@gmail.com",
          recoverySecret: recoverySecret.trim(),
          newPassword,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Password recovery failed.");
      }

      setSuccessMsg("Administrator credentials established! Entering Control Centre...");
      setTimeout(() => {
        router.replace("/admin/dashboard");
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Password recovery failed."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#1B1815] border border-[#2F2A25] rounded-sm p-7 sm:p-9 space-y-6 shadow-xl">
      <div className="space-y-2 text-center border-b border-[#2F2A25] pb-5">
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
          Restricted single-operator command centre. Gated strictly to verified administrator identity.
        </p>

        {/* Mode Selector Tabs */}
        <div className="flex border border-[#2F2A25] rounded-sm p-0.5 bg-[#12100E] mt-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-mono tracking-wider transition-colors rounded-sm ${
              activeTab === "login"
                ? "bg-[#2A2420] text-[#FAF7F2] font-bold shadow-sm"
                : "text-[#8A8178] hover:text-[#FAF7F2]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("recover");
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-mono tracking-wider transition-colors rounded-sm ${
              activeTab === "recover"
                ? "bg-[#2A2420] text-[#FAF7F2] font-bold shadow-sm"
                : "text-[#8A8178] hover:text-[#FAF7F2]"
            }`}
          >
            Establish Password
          </button>
        </div>
      </div>

      {activeTab === "login" ? (
        <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-[10px] uppercase tracking-[0.2em] text-[#A89F93] mb-1.5 font-mono"
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
              placeholder="anishpatil146@gmail.com"
              className="w-full px-3.5 py-2.5 bg-[#12100E] border border-[#3A332C] rounded-sm text-sm text-[#FAF7F2] placeholder:text-[#6E665E] focus:outline-none focus:border-[#FAF7F2] font-mono"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-[10px] uppercase tracking-[0.2em] text-[#A89F93] mb-1.5 font-mono"
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
            <div
              role="alert"
              className="space-y-2 text-xs text-[#E8B4B0] bg-[#9E6B68]/20 border border-[#9E6B68]/45 p-3 rounded-sm leading-relaxed"
            >
              <p>{errorMsg}</p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("recover");
                  setErrorMsg(null);
                }}
                className="text-[11px] font-mono text-[#FAF7F2] underline hover:text-[#C8B28E] flex items-center gap-1 font-bold"
              >
                Establish or reset your administrator password now <ArrowRight className="w-3 h-3" />
              </button>
            </div>
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
      ) : (
        <form onSubmit={(e) => void handleRecover(e)} className="space-y-3.5">
          <div>
            <label
              htmlFor="recovery-email"
              className="block text-[10px] uppercase tracking-[0.2em] text-[#A89F93] mb-1 font-mono"
            >
              Administrator Account (Fixed)
            </label>
            <input
              id="recovery-email"
              type="email"
              disabled
              value="anishpatil146@gmail.com"
              className="w-full px-3 py-2 bg-[#12100E]/70 border border-[#2F2A25] rounded-sm text-xs text-[#DDD4C5] font-mono opacity-80"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="recovery-key"
                className="text-[10px] uppercase tracking-[0.2em] text-[#A89F93] font-mono"
              >
                Master Recovery Key
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">Verified Vercel Secret</span>
            </div>
            <input
              id="recovery-key"
              type="text"
              required
              value={recoverySecret}
              onChange={(e) => setRecoverySecret(e.target.value)}
              placeholder="SilenceSpeaks#2026"
              className="w-full px-3 py-2 bg-[#12100E] border border-[#3A332C] rounded-sm text-xs text-[#FAF7F2] font-mono focus:outline-none focus:border-[#FAF7F2]"
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block text-[10px] uppercase tracking-[0.2em] text-[#A89F93] mb-1 font-mono"
            >
              New Administrator Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2 bg-[#12100E] border border-[#3A332C] rounded-sm text-xs text-[#FAF7F2] focus:outline-none focus:border-[#FAF7F2]"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-[10px] uppercase tracking-[0.2em] text-[#A89F93] mb-1 font-mono"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 bg-[#12100E] border border-[#3A332C] rounded-sm text-xs text-[#FAF7F2] focus:outline-none focus:border-[#FAF7F2]"
            />
          </div>

          {errorMsg && (
            <p
              role="alert"
              className="text-xs text-[#E8B4B0] bg-[#9E6B68]/20 border border-[#9E6B68]/45 px-3 py-2 rounded-sm leading-relaxed"
            >
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p
              role="status"
              className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/80 px-3 py-2 rounded-sm leading-relaxed flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
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
              <KeyRound className="w-3.5 h-3.5 mr-2" />
              <span>
                {isSubmitting ? "Establishing Credentials..." : "Set Password & Enter Control Centre"}
              </span>
            </Button>
          </div>
        </form>
      )}

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#12100E]">
      <Suspense fallback={<div className="text-xs text-[#8A8178] font-mono">Loading authentication portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}

