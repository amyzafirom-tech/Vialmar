"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SlideTabs } from "@/components/ui/navbar";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { ExpandingCards, procesoItems } from "@/components/ui/proceso";
import { ProductoCard } from "@/components/ui/producto-card";
import { PedidoForm, VideoBackground, type PedidoData } from "@/components/ui/pedido-form";
import FaqSection from "@/components/ui/faq-scroller";
import { VialmarMap } from "@/components/ui/vialmar-map";
import { createClient } from "@/lib/supabase/client";
import { Leaf } from "lucide-react";

const NAV_TABS = ["Inicio", "Nuestra Historia", "Productos", "FAQ", "Cotizar"];
const SECTION_IDS = ["inicio", "historia", "productos", "faq", "contacto"];

interface Producto {
  id: string;
  title: string;
  origen: string;
  overview: string;
  price: number;
  presentacion: string;
  image_url: string;
}

const VIALMAR_FAQ_DATA = {
  mainTitle: "Preguntas Frecuentes",
  mainSubtitle: "Todo lo que quieres saber sobre nuestro cacao, antes de pedirlo.",
  rows: [
    {
      id: "row1",
      speed: "32s",
      direction: "left" as const,
      faqItems: [
        {
          id: "q1",
          question: "¿De dónde viene el cacao de Vialmar?",
          answer:
            "Cultivamos nuestro propio cacao agroforestal en el Valle del Cauca, Antigua Vía al Mar, Colombia. Desde el árbol hasta tu taza, todo el proceso es nuestro.",
        },
        {
          id: "q2",
          question: "¿Las pastillas de cacao tienen azúcar u otros aditivos?",
          answer:
            "No. Nuestras pastillas son 100% cacao natural, sin aditivos ni azúcar añadida. El sabor y el dulzor dependen de lo que le agregues al prepararlas.",
        },
      ],
    },
    {
      id: "row2",
      speed: "26s",
      direction: "right" as const,
      faqItems: [
        {
          id: "q3",
          question: "¿Cuánto rinde una bolsa de 500g?",
          answer: "Cada bolsa trae 18 pastillas y rinde hasta 72 tazas de chocolate caliente o cacao tradicional.",
        },
        {
          id: "q4",
          question: "¿Hacen envíos a todo el país?",
          answer: "[Completar: cobertura real de envíos]. El tiempo estimado de entrega es de [X] días hábiles.",
        },
      ],
    },
    {
      id: "row3",
      speed: "38s",
      direction: "left" as const,
      faqItems: [
        {
          id: "q5",
          question: "¿Cómo debo preparar el cacao en pastilla?",
          answer:
            "Disuelve una pastilla en agua o leche caliente, revolviendo bien hasta que se deshaga por completo. Puedes endulzar a tu gusto.",
        },
        {
          id: "q6",
          question: "¿Venden al por mayor?",
          answer: "[Completar: si manejan venta mayorista/distribución, condiciones y contacto para pedidos grandes].",
        },
      ],
    },
  ],
};

const TESTIMONIOS = [
  {
    nombre: "María F., Cali",
    texto: "El sabor de este cacao no se compara con nada que haya probado. Se siente el cuidado en cada pastilla.",
  },
  {
    nombre: "Andrés R., Bogotá",
    texto: "Compro Vialmar hace un año. Es hermoso saber que detrás hay una finca real y una familia que cultiva con propósito.",
  },
  {
    nombre: "Lucía G., Medellín",
    texto: "Más que cacao, es una historia que se prueba. Lo recomiendo a todos mis amigos amantes del chocolate.",
  },
];

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    const loadProductos = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .order("orden", { ascending: true });

        if (error) {
          console.error(
            "Error al cargar productos:",
            error.message || error.code || JSON.stringify(error)
          );
          return;
        }
        setProductos(data ?? []);
      } catch (err) {
        console.error("Fallo de red al cargar productos:", err);
      }
    };

    loadProductos();
  }, []);

  const scrollToSection = (i: number) => {
    document.getElementById(SECTION_IDS[i])?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePedido = async (data: PedidoData) => {
    const supabase = createClient();
    const { error } = await supabase.from("pedidos").insert({
      nombre: data.nombre,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      notas: data.notas || null,
    });

    if (error) {
      console.error("Error al guardar el pedido:", error);
      throw error;
    }
  };

  return (
    <main className="flex flex-col">
      <nav className="fixed inset-x-0 top-4 z-50 px-4">
        <SlideTabs tabs={NAV_TABS} onTabClick={scrollToSection} />
      </nav>

      <section id="inicio">
        <HeroParallax />
      </section>

      {/* Nuestra Historia */}
      <section id="historia" className="bg-vialmar-cream px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-block rounded-full border border-vialmar-gold px-3 py-1 text-xs uppercase tracking-widest text-vialmar-brown-dark">
              Nuestra Historia
            </span>
            <h2 className="font-serif text-4xl font-bold text-vialmar-ink md:text-5xl">
              Del Valle del Cauca a tu mesa
            </h2>
            <p className="text-vialmar-ink/80 leading-relaxed">
              Vialmar nace en la Antigua Vía al Mar, en el corazón del Valle del Cauca, donde cultivamos
              nuestro propio cacao bajo un modelo agroforestal que protege la tierra y respeta el ritmo de
              la naturaleza. Cada mazorca es cosechada y transformada a mano, siguiendo un proceso artesanal
              que conserva el aroma y el carácter único de nuestro origen.
            </p>
            <p className="text-vialmar-ink/80 leading-relaxed">
              Creemos que el buen cacao no se produce en serie: se cultiva con paciencia, se cosecha con
              cuidado y se comparte con orgullo. Por eso decimos que somos más que cacao, somos una historia.
            </p>
            <div className="flex items-center gap-2 text-vialmar-green">
              <Leaf className="h-5 w-5" />
              <span className="text-sm font-medium">100% Natural · Cultivo Agroforestal · Artesanal</span>
            </div>
          </div>
          <div className="relative h-80 overflow-hidden rounded-2xl shadow-xl md:h-[28rem]">
            <Image
              src="/images/cacao/proceso-cultivo.jpg"
              alt="Finca de cacao Vialmar en el Valle del Cauca"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Nuestro Origen — mapa */}
      <section className="bg-vialmar-cream px-4 py-16">
        <div className="mx-auto mb-10 max-w-4xl text-center">
          <h2 className="mb-3 font-serif text-4xl font-bold text-vialmar-ink">Nuestro Origen</h2>
          <p className="mx-auto max-w-2xl text-lg text-vialmar-brown">
            Vialmar nace en Dagua, Valle del Cauca — sobre la Antigua Vía al Mar, el camino histórico
            que conecta a Cali con el Pacífico colombiano.
          </p>
        </div>
        <div className="mx-auto max-w-4xl">
          <VialmarMap
            from={{ lat: 3.4516, lng: -76.532, label: "Cali" }}
            to={{ lat: 3.6553, lng: -76.689, label: "Dagua — Aquí nace Vialmar" }}
          />
        </div>
      </section>

      {/* Del cacao a tu mesa */}
      <section className="bg-vialmar-brown-dark px-6 py-24 md:py-32">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
          <div className="max-w-2xl text-center">
            <span className="inline-block rounded-full border border-vialmar-gold px-3 py-1 text-xs uppercase tracking-widest text-vialmar-gold-light">
              Nuestro Proceso
            </span>
            <h2 className="mt-4 font-serif text-4xl font-bold text-vialmar-cream md:text-5xl">
              Del cacao a tu mesa
            </h2>
          </div>
          <ExpandingCards items={procesoItems} />
        </div>
      </section>

      {/* Productos */}
      <section id="productos" className="bg-vialmar-brown-dark px-6 py-24 md:py-32">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
          <div className="max-w-2xl text-center">
            <span className="inline-block rounded-full border border-vialmar-gold px-3 py-1 text-xs uppercase tracking-widest text-vialmar-gold-light">
              Nuestros Productos
            </span>
            <h2 className="mt-4 font-serif text-4xl font-bold text-vialmar-cream md:text-5xl">
              Cacao 100% natural
            </h2>
          </div>
          <div className="grid w-full gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <ProductoCard
                key={producto.id}
                imageUrl={producto.image_url}
                imageAlt={producto.title}
                title={producto.title}
                origen={producto.origen}
                overview={producto.overview}
                price={producto.price}
                presentacion={producto.presentacion}
                onComprar={() => scrollToSection(4)}
                className="mx-auto"
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-vialmar-cream py-16">
        <FaqSection data={VIALMAR_FAQ_DATA} />
      </section>

      {/* Testimonios */}
      <section className="bg-vialmar-cream px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-vialmar-gold px-3 py-1 text-xs uppercase tracking-widest text-vialmar-brown-dark">
              Testimonios
            </span>
            <h2 className="mt-4 font-serif text-4xl font-bold text-vialmar-ink md:text-5xl">
              Historias de quienes ya lo probaron
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIOS.map((t) => (
              <div
                key={t.nombre}
                className="rounded-xl border border-vialmar-gold/30 bg-white/60 p-6 shadow-sm"
              >
                <p className="text-vialmar-ink/80 leading-relaxed">&ldquo;{t.texto}&rdquo;</p>
                <p className="mt-4 font-serif text-sm font-semibold text-vialmar-brown-dark">{t.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pedido / Cotización */}
      <section
        id="contacto"
        className="relative min-h-[90vh] w-full flex items-center justify-center px-4 py-20 overflow-hidden"
      >
        <VideoBackground videoUrl="/videos/cacao/pedido-bg.mp4" />
        <div className="relative z-20 w-full max-w-md">
          <PedidoForm onSubmit={handlePedido} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-vialmar-ink px-6 py-16 text-vialmar-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/logo-vialmar.svg" alt="Vialmar" className="h-14 w-auto" />
            <p className="max-w-xs text-sm text-vialmar-cream/70">
              Más que cacao, una Historia. Cacao 100% natural cultivado en el Valle del Cauca, Colombia.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-vialmar-gold/50 px-3 py-1 text-xs">
              <span className="flex gap-0.5">
                <span className="h-2 w-3 rounded-[1px] bg-vialmar-flag-yellow" />
                <span className="h-2 w-3 rounded-[1px] bg-vialmar-flag-blue" />
                <span className="h-2 w-3 rounded-[1px] bg-vialmar-flag-red" />
              </span>
              Origen: Valle del Cauca, Colombia
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-lg font-semibold text-vialmar-gold-light">Contacto</h3>
            <ul className="space-y-1 text-sm text-vialmar-cream/70">
              <li>hola@vialmar.co</li>
              <li>+57 300 000 0000</li>
              <li>Antigua Vía al Mar, Valle del Cauca, Colombia</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-lg font-semibold text-vialmar-gold-light">Síguenos</h3>
            <ul className="space-y-1 text-sm text-vialmar-cream/70">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-vialmar-cream/10 pt-6 text-center text-xs text-vialmar-cream/50">
          © {new Date().getFullYear()} Vialmar. Todos los derechos reservados.
        </div>
      </footer>
    </main>
  );
}
