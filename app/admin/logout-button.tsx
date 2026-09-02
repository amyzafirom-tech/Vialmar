"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg border border-vialmar-gold/40 px-3 py-2 text-sm text-vialmar-brown-dark transition-colors hover:bg-vialmar-gold/10"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}
