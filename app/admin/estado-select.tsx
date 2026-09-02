"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ESTADOS = ["nuevo", "contactado", "confirmado", "cancelado"] as const;

export function EstadoSelect({
  pedidoId,
  estadoActual,
  className,
}: {
  pedidoId: string;
  estadoActual: string;
  className?: string;
}) {
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supabase = createClient();
    await supabase.from("pedidos").update({ estado: e.target.value }).eq("id", pedidoId);
    router.refresh();
  };

  return (
    <select
      defaultValue={estadoActual}
      onChange={handleChange}
      className={`cursor-pointer bg-transparent focus:outline-none ${className ?? ""}`}
    >
      {ESTADOS.map((estado) => (
        <option key={estado} value={estado}>
          {estado}
        </option>
      ))}
    </select>
  );
}
