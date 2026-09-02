import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { EstadoSelect } from "./estado-select";
import { DeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

const ESTADO_STYLES: Record<string, string> = {
  nuevo: "bg-vialmar-gold/20 text-vialmar-brown-dark border-vialmar-gold/40",
  contactado: "bg-blue-100 text-blue-800 border-blue-200",
  confirmado: "bg-vialmar-green/15 text-vialmar-green border-vialmar-green/30",
  cancelado: "bg-red-100 text-red-700 border-red-200",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-vialmar-cream px-4 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-vialmar-ink">Pedidos</h1>
            <p className="text-sm text-vialmar-brown">
              Sesión: {user.email} · {pedidos?.length ?? 0} pedido(s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/productos"
              className="rounded-lg border border-vialmar-gold/40 px-3 py-2 text-sm text-vialmar-brown-dark transition-colors hover:bg-vialmar-gold/10"
            >
              Productos
            </Link>
            <LogoutButton />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            No se pudieron cargar los pedidos: {error.message}
          </div>
        )}

        {!error && pedidos && pedidos.length === 0 && (
          <div className="rounded-2xl border border-vialmar-gold/30 bg-white/50 p-10 text-center text-vialmar-brown">
            Todavía no hay pedidos registrados.
          </div>
        )}

        {!error && pedidos && pedidos.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-vialmar-gold/30 bg-white/50 shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-vialmar-gold/30 text-xs uppercase tracking-wide text-vialmar-brown">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Cant.</th>
                  <th className="px-4 py-3">Notas</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} className="border-b border-vialmar-gold/10 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-vialmar-ink/70">
                      {new Date(p.created_at).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-vialmar-ink">{p.nombre}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/${p.telefono.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-vialmar-brown-dark underline decoration-vialmar-gold/50 hover:text-vialmar-gold-dark"
                      >
                        {p.telefono}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-vialmar-ink/80">{p.producto}</td>
                    <td className="px-4 py-3 text-vialmar-ink/80">{p.cantidad}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-vialmar-ink/60" title={p.notas ?? ""}>
                      {p.notas || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoSelect
                        pedidoId={p.id}
                        estadoActual={p.estado}
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${ESTADO_STYLES[p.estado] ?? ""}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <DeleteButton pedidoId={p.id} nombre={p.nombre} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
