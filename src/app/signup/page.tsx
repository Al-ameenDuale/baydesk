"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="flex min-h-screen min-w-0 items-center justify-center bg-zinc-50 px-4 py-8">
      <div className="w-full max-w-md min-w-0 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900">
          BayDesk – Sign up
        </h1>

        {success ? (
          <div className="space-y-4">
            <p
              className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              role="status"
            >
              Account created! Check your email to confirm your account before logging in.
            </p>
            <p className="text-center text-sm text-zinc-600">
              <a href="/login" className="font-medium text-zinc-900 underline">
                Go to log in
              </a>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-zinc-900 underline">
                Log in
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
