"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteButton({ pedidoId, nombre }: { pedidoId: string; nombre: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`¿Eliminar el pedido de "${nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("pedidos").delete().eq("id", pedidoId);
    setIsDeleting(false);

    if (error) {
      window.alert("No se pudo eliminar el pedido: " + error.message);
      return;
    }

    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Eliminar pedido de ${nombre}`}
      className="rounded-lg p-1.5 text-vialmar-brown/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
