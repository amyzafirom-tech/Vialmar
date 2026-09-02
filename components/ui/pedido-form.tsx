"use client";
import React, { useState, useRef, useEffect } from "react";
import { User, Phone, Package, MessageSquare, CheckCircle2 } from "lucide-react";

interface PedidoFormProps {
  onSubmit: (data: PedidoData) => void | Promise<void>;
}

interface PedidoData {
  nombre: string;
  telefono: string;
  producto: string;
  cantidad: string;
  notas: string;
}

interface VideoBackgroundProps {
  videoUrl: string;
}

interface FormInputProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

// ---------- Input con ícono ----------
const FormInput: React.FC<FormInputProps> = ({ icon, type, placeholder, value, onChange, required }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-vialmar-gold/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-vialmar-gold transition-colors"
    />
  </div>
);

// ---------- Video de fondo ----------
const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch((error) => {
      console.error("No se pudo reproducir el video automáticamente:", error);
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="absolute inset-0 bg-vialmar-brown-dark/60 z-10" />
      <video
        ref={videoRef}
        className="absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Tu navegador no soporta el video.
      </video>
    </div>
  );
};

// ---------- Formulario principal ----------
const PRODUCTOS = [
  "Pastillas de Cacao 100% Natural, 500g",
  "Cacao en polvo",
  "Chocolate en barra",
  "Otro / no estoy seguro",
];

export const PedidoForm: React.FC<PedidoFormProps> = ({ onSubmit }) => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [producto, setProducto] = useState(PRODUCTOS[0]);
  const [cantidad, setCantidad] = useState("");
  const [notas, setNotas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({ nombre, telefono, producto, cantidad, notas });
      setIsSuccess(true);

      // Limpia el formulario después de mostrar el mensaje de éxito
      setTimeout(() => {
        setNombre("");
        setTelefono("");
        setCantidad("");
        setNotas("");
        setIsSuccess(false);
      }, 2500);
    } catch {
      setError("No pudimos enviar tu pedido. Intenta de nuevo en un momento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 rounded-2xl backdrop-blur-sm bg-vialmar-brown-dark/70 border border-vialmar-gold/30 flex flex-col items-center text-center gap-3 py-16">
        <CheckCircle2 className="text-vialmar-gold" size={48} />
        <h3 className="text-2xl font-serif font-bold text-white">¡Pedido enviado!</h3>
        <p className="text-white/80">Nos pondremos en contacto contigo pronto para confirmar los detalles.</p>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl backdrop-blur-sm bg-vialmar-brown-dark/70 border border-vialmar-gold/30">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif font-bold mb-2 text-white">Haz tu Pedido</h2>
        <p className="text-white/80">
          Cuéntanos qué necesitas y te contactamos para confirmar tu cotización.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          icon={<User className="text-white/60" size={18} />}
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <FormInput
          icon={<Phone className="text-white/60" size={18} />}
          type="tel"
          placeholder="Teléfono / WhatsApp"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Package className="text-white/60" size={18} />
          </div>
          <select
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-vialmar-gold/30 rounded-lg text-white focus:outline-none focus:border-vialmar-gold transition-colors appearance-none"
          >
            {PRODUCTOS.map((p) => (
              <option key={p} value={p} className="bg-vialmar-brown-dark text-white">
                {p}
              </option>
            ))}
          </select>
        </div>

        <FormInput
          icon={<Package className="text-white/60" size={18} />}
          type="number"
          placeholder="Cantidad (unidades)"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />

        <div className="relative">
          <div className="absolute left-3 top-3">
            <MessageSquare className="text-white/60" size={18} />
          </div>
          <textarea
            placeholder="Notas adicionales (opcional)"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-vialmar-gold/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-vialmar-gold transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-vialmar-gold hover:bg-vialmar-gold-light text-vialmar-ink font-semibold transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-vialmar-gold/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-black/20"
        >
          {isSubmitting ? "Enviando..." : "Solicitar Cotización"}
        </button>

        {error && <p className="text-center text-sm text-red-300">{error}</p>}
      </form>
    </div>
  );
};

export { VideoBackground };
export type { PedidoData };
