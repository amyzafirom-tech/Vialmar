"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setIsLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-vialmar-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-vialmar-gold/30 bg-white/60 p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-vialmar-ink">Vialmar</h1>
          <p className="mt-1 text-sm text-vialmar-brown">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-vialmar-ink">
              Correo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-vialmar-gold/30 bg-white px-3 py-2.5 text-sm text-vialmar-ink focus:outline-none focus:ring-2 focus:ring-vialmar-gold/40"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-vialmar-ink">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-vialmar-gold/30 bg-white px-3 py-2.5 text-sm text-vialmar-ink focus:outline-none focus:ring-2 focus:ring-vialmar-gold/40"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-vialmar-gold py-2.5 font-semibold text-vialmar-ink transition-colors hover:bg-vialmar-gold-light disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
