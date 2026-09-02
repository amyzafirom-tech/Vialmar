import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { DeleteProductoButton } from "./delete-producto-button";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: productos, error } = await supabase
    .from("productos")
    .select("*")
    .order("orden", { ascending: true });

  return (
    <main className="min-h-screen bg-vialmar-cream px-4 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-vialmar-brown hover:underline">
              ← Pedidos
            </Link>
            <h1 className="mt-1 font-serif text-3xl font-bold text-vialmar-ink">Productos</h1>
            <p className="text-sm text-vialmar-brown">Catálogo visible en la página principal del sitio.</p>
          </div>
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-2 rounded-lg bg-vialmar-gold px-4 py-2.5 text-sm font-semibold text-vialmar-ink transition-colors hover:bg-vialmar-gold-light"
          >
            <Plus className="h-4 w-4" />
            Agregar producto
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            No se pudieron cargar los productos: {error.message}
          </div>
        )}

        {!error && productos && productos.length === 0 && (
          <div className="rounded-2xl border border-vialmar-gold/30 bg-white/50 p-10 text-center text-vialmar-brown">
            Todavía no hay productos. Agrega el primero.
          </div>
        )}

        {!error && productos && productos.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-vialmar-gold/30 bg-white/50 shadow-sm"
              >
                <div className="relative h-40 w-full bg-vialmar-brown-dark/10">
                  <Image src={p.image_url} alt={p.title} fill sizes="400px" className="object-cover" />
                </div>
                <div className="space-y-2 p-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-vialmar-ink">{p.title}</h3>
                    <p className="text-xs text-vialmar-brown">{p.origen}</p>
                  </div>
                  <p className="line-clamp-2 text-sm text-vialmar-ink/70">{p.overview}</p>
                  <p className="text-sm font-semibold text-vialmar-brown-dark">
                    ${p.price.toLocaleString("es-CO")} / {p.presentacion}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      href={`/admin/productos/${p.id}/editar`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-vialmar-gold/40 py-2 text-sm text-vialmar-brown-dark transition-colors hover:bg-vialmar-gold/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                    <DeleteProductoButton productoId={p.id} title={p.title} imageUrl={p.image_url} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
