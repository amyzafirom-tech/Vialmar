import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProductoForm } from "../producto-form";

export default async function NuevoProductoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-vialmar-cream px-4 py-10 md:px-10">
      <div className="mx-auto max-w-xl">
        <Link href="/admin/productos" className="text-sm text-vialmar-brown hover:underline">
          ← Productos
        </Link>
        <h1 className="mb-8 mt-1 font-serif text-3xl font-bold text-vialmar-ink">Agregar producto</h1>

        <div className="rounded-2xl border border-vialmar-gold/30 bg-white/50 p-6 shadow-sm">
          <ProductoForm />
        </div>
      </div>
    </main>
  );
}
