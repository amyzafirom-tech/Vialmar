"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ImagePlus } from "lucide-react";

interface Producto {
  id: string;
  title: string;
  origen: string;
  overview: string;
  price: number;
  presentacion: string;
  image_url: string;
  orden: number;
}

export function ProductoForm({ producto }: { producto?: Producto }) {
  const router = useRouter();
  const isEditing = !!producto;

  const [title, setTitle] = useState(producto?.title ?? "");
  const [origen, setOrigen] = useState(producto?.origen ?? "");
  const [overview, setOverview] = useState(producto?.overview ?? "");
  const [price, setPrice] = useState(producto ? String(producto.price) : "");
  const [presentacion, setPresentacion] = useState(producto?.presentacion ?? "");
  const [orden, setOrden] = useState(producto ? String(producto.orden) : "0");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(producto?.image_url ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file && !producto) {
      setError("Selecciona una imagen para el producto.");
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    try {
      let imageUrl = producto?.image_url ?? "";

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("productos").upload(path, file);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from("productos").getPublicUrl(path);
        imageUrl = publicUrlData.publicUrl;
      }

      const payload = {
        title,
        origen,
        overview,
        price: Number(price),
        presentacion,
        image_url: imageUrl,
        orden: Number(orden) || 0,
      };

      if (isEditing) {
        const { error: updateError } = await supabase.from("productos").update(payload).eq("id", producto.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("productos").insert(payload);
        if (insertError) throw insertError;
      }

      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar el producto.");
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-vialmar-ink">Imagen del producto</label>
        <label className="flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-vialmar-gold/40 bg-white/50 transition-colors hover:bg-vialmar-gold/5">
          {preview ? (
            <div className="relative h-full w-full">
              <Image src={preview} alt="Vista previa" fill className="object-cover" unoptimized={preview.startsWith("blob:")} />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-vialmar-brown">
              <ImagePlus className="h-6 w-6" />
              <span className="text-sm">Haz clic para subir una imagen</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-vialmar-ink">
          Nombre del producto
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-vialmar-gold/30 bg-white px-3 py-2.5 text-sm text-vialmar-ink focus:outline-none focus:ring-2 focus:ring-vialmar-gold/40"
        />
      </div>

      <div>
        <label htmlFor="origen" className="mb-1 block text-sm font-medium text-vialmar-ink">
          Origen
        </label>
        <input
          id="origen"
          type="text"
          value={origen}
          onChange={(e) => setOrigen(e.target.value)}
          required
          placeholder="Valle del Cauca"
          className="w-full rounded-lg border border-vialmar-gold/30 bg-white px-3 py-2.5 text-sm text-vialmar-ink focus:outline-none focus:ring-2 focus:ring-vialmar-gold/40"
        />
      </div>

      <div>
        <label htmlFor="overview" className="mb-1 block text-sm font-medium text-vialmar-ink">
          Descripción
        </label>
        <textarea
          id="overview"
          value={overview}
          onChange={(e) => setOverview(e.target.value)}
          required
          rows={3}
          className="w-full resize-none rounded-lg border border-vialmar-gold/30 bg-white px-3 py-2.5 text-sm text-vialmar-ink focus:outline-none focus:ring-2 focus:ring-vialmar-gold/40"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium text-vialmar-ink">
            Precio (COP)
          </label>
          <input
            id="price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full rounded-lg border border-vialmar-gold/30 bg-white px-3 py-2.5 text-sm text-vialmar-ink focus:outline-none focus:ring-2 focus:ring-vialmar-gold/40"
          />
        </div>
        <div>
          <label htmlFor="presentacion" className="mb-1 block text-sm font-medium text-vialmar-ink">
            Presentación
          </label>
          <input
            id="presentacion"
            type="text"
            value={presentacion}
            onChange={(e) => setPresentacion(e.target.value)}
            required
            placeholder="250 g"
            className="w-full rounded-lg border border-vialmar-gold/30 bg-white px-3 py-2.5 text-sm text-vialmar-ink focus:outline-none focus:ring-2 focus:ring-vialmar-gold/40"
          />
        </div>
      </div>

      <div>
        <label htmlFor="orden" className="mb-1 block text-sm font-medium text-vialmar-ink">
          Orden en el sitio (menor número = aparece primero)
        </label>
        <input
          id="orden"
          type="number"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="w-full rounded-lg border border-vialmar-gold/30 bg-white px-3 py-2.5 text-sm text-vialmar-ink focus:outline-none focus:ring-2 focus:ring-vialmar-gold/40"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-vialmar-gold py-2.5 font-semibold text-vialmar-ink transition-colors hover:bg-vialmar-gold-light disabled:opacity-60"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
