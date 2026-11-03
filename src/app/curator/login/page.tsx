"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to authenticate");
      }

      router.push("/curator");
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-[#1C1917] p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-xs uppercase tracking-wider text-[#78716C] hover:text-[#1C1917] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Return to Experience</span>
        </Link>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded border border-[#E0D7CB] bg-[#F4EFE7] space-y-6 shadow-sm"
        >
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-[#EAE3D6] text-[#1C1917] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-serif font-normal text-[#1C1917]">
              Administrator Terminal
            </h1>
            <p className="text-xs text-[#78716C]">
              Access restricted to configured allowlist addresses.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#57534E] mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@theunwritten.game"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#D6D3D1] rounded focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] uppercase tracking-wider text-[#57534E]">
                  Password / Passkey (Optional)
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#D6D3D1] rounded focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded bg-[#F7EFEF] border border-[#D9B8B6] text-[#7D4F4F] text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading || !email}
              className="w-full"
            >
              {isLoading ? "AUTHENTICATING..." : "VERIFY & ENTER"}
            </Button>
          </form>

          <div className="pt-2 border-t border-[#E0D7CB] text-[11px] text-[#8C827A] text-center leading-relaxed">
            Allowlist configuration is managed in <code>ADMIN_EMAILS</code>.
          </div>
        </motion.div>
      </div>
    </div>
  );
}

