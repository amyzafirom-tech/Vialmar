"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteProductoButton({
  productoId,
  title,
  imageUrl,
}: {
  productoId: string;
  title: string;
  imageUrl: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`¿Eliminar "${title}" del catálogo? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setIsDeleting(true);
    const supabase = createClient();

    const { error } = await supabase.from("productos").delete().eq("id", productoId);

    if (error) {
      setIsDeleting(false);
      window.alert("No se pudo eliminar el producto: " + error.message);
      return;
    }

    // Si la imagen vive en nuestro bucket de Supabase, la borramos también.
    const marker = "/storage/v1/object/public/productos/";
    const idx = imageUrl.indexOf(marker);
    if (idx !== -1) {
      const path = imageUrl.slice(idx + marker.length);
      await supabase.storage.from("productos").remove([path]);
    }

    setIsDeleting(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Eliminar ${title}`}
      className="flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
