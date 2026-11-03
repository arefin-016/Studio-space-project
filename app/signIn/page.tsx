"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

/* ---------- Brand tokens (match the home page) ---------- */
const BRAND = "#C9A98B"; // tan used on "EXPLORE STUDIOS"

/* ---------- Password rules (same as Sign Up) ---------- */
const PASSWORD_RULES = [
  { id: "upper", label: "Uppercase letter (A-Z)", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "Lowercase letter (a-z)", test: (v: string) => /[a-z]/.test(v) },
  { id: "length", label: "At least 6 characters", test: (v: string) => v.length >= 6 },
];

/* ---------- Shared styles (light + dark) ---------- */
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] " +
  "text-[#3d3228]/75 dark:text-white/70";

const inputClass =
  "h-11 w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition " +
  "border-[#1a1410]/15 bg-[#faf8f5] text-[#1a1410] placeholder:text-[#1a1410]/40 " +
  "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35 " +
  "focus:border-[#B8926F] focus:ring-2 focus:ring-[#C9A98B]/40 " +
  "dark:focus:border-[#C9A98B] dark:focus:ring-[#C9A98B]/30";

const iconClass =
  "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 " +
  "text-[#1a1410]/40 dark:text-white/40";

// Same tan button everywhere (dark text keeps contrast on tan)
const buttonClass =
  "flex h-11 w-full items-center justify-center gap-3 rounded-full bg-[#C9A98B] px-6 " +
  "text-sm font-bold uppercase tracking-[0.18em] text-[#1a1410] transition " +
  "hover:bg-[#D8BDA2] focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[#C9A98B] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-black " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

const SignInPage = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const results = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));
  const passwordValid = results.every((r) => r.passed);
  const showPasswordFeedback = password.length > 0 || submitted;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    // Block sign in with an invalid password
    if (!passwordValid) {
      toast.error("Invalid password", {
        description: "Please meet all the password requirements.",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");

    setLoading(true);

    const { error } = await authClient.signIn.email({ email, password });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Login failed. Please try again.");
      return;
    }

    toast.success("Signed in successfully!", {
      description: "Welcome back to StudioSpace.",
    });
    router.push("/");
    router.refresh(); // refresh the navbar so the user avatar appears
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
    // On success the browser redirects to Google, so we only land here on failure
    if (error) {
      setGoogleLoading(false);
      toast.error(error.message || "Google sign in failed. Please try again.");
    }
  };

  return (
    /* pt-24 clears your fixed navbar; items-center + justify-center put the card in the middle */
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-[#faf8f5] px-4 pb-10 pt-24 text-[#1a1410] dark:bg-[#0e0b09] dark:text-white sm:px-6">
      {/* soft tan glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 0%, rgba(201,169,139,0.18), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-[#1a1410]/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none sm:p-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8" style={{ backgroundColor: BRAND }} />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6a4d] dark:text-[#C9A98B]">
            Welcome back
          </span>
        </div>

        <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[#3d3228]/70 dark:text-white/60">
          Sign in to book and manage your studio sessions.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email address
            </label>
            <div className="relative">
              <Mail className={iconClass} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <Lock className={iconClass} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                aria-invalid={submitted && !passwordValid}
                className={`${inputClass} pr-12 ${
                  showPasswordFeedback && !passwordValid
                    ? "!border-red-500/70 focus:!ring-red-500/25 dark:!border-red-400/70"
                    : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1410]/50 transition hover:text-[#1a1410] dark:text-white/50 dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password errors / requirements (compact, wraps on small screens) */}
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1" aria-live="polite">
              {results.map((r) => {
                const state = !showPasswordFeedback
                  ? "idle"
                  : r.passed
                  ? "pass"
                  : "fail";
                return (
                  <li
                    key={r.id}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      state === "pass"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : state === "fail"
                        ? "text-red-600 dark:text-red-400"
                        : "text-[#1a1410]/50 dark:text-white/45"
                    }`}
                  >
                    {state === "pass" ? (
                      <Check size={13} />
                    ) : state === "fail" ? (
                      <X size={13} />
                    ) : (
                      <span className="mx-[4.5px] h-1 w-1 rounded-full bg-[#1a1410]/40 dark:bg-white/40" />
                    )}
                    {r.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#8a6a4d] hover:underline dark:text-[#C9A98B]"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className={buttonClass}
          >
            {loading && <Loader2 className="h-[18px] w-[18px] animate-spin" />}
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <span className="h-px flex-1 bg-[#1a1410]/10 dark:bg-white/10" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#1a1410]/45 dark:text-white/40">
            or
          </span>
          <span className="h-px flex-1 bg-[#1a1410]/10 dark:bg-white/10" />
        </div>

        {/* Google (below the form) */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className={buttonClass}
        >
          {googleLoading ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <GoogleIcon />
            </span>
          )}
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-[#3d3228]/70 dark:text-white/60">
          Don&apos;t have an account?{" "}
          <Link
            href="/signUp"
            className="font-semibold text-[#8a6a4d] hover:underline dark:text-[#C9A98B]"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;