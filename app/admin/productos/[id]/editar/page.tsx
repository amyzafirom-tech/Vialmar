import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ProductoForm } from "../../producto-form";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: producto } = await supabase.from("productos").select("*").eq("id", id).single();

  if (!producto) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-vialmar-cream px-4 py-10 md:px-10">
      <div className="mx-auto max-w-xl">
        <Link href="/admin/productos" className="text-sm text-vialmar-brown hover:underline">
          ← Productos
        </Link>
        <h1 className="mb-8 mt-1 font-serif text-3xl font-bold text-vialmar-ink">Editar producto</h1>

        <div className="rounded-2xl border border-vialmar-gold/30 bg-white/50 p-6 shadow-sm">
          <ProductoForm producto={producto} />
        </div>
      </div>
    </main>
  );
}
