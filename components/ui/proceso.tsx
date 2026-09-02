"use client";
import * as React from "react";
import { Sprout, Sun, Coffee, Package, Truck, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardItem {
  id: string | number;
  title: string;
  description: string;
  imgSrc: string;
  icon: React.ReactNode;
}

interface ExpandingCardsProps extends React.HTMLAttributes<HTMLUListElement> {
  items: CardItem[];
  defaultActiveIndex?: number;
}

export const ExpandingCards = React.forwardRef<HTMLUListElement, ExpandingCardsProps>(
  ({ className, items, defaultActiveIndex = 0, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(defaultActiveIndex);
    const [isDesktop, setIsDesktop] = React.useState(false);

    React.useEffect(() => {
      const handleResize = () => setIsDesktop(window.innerWidth >= 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const gridStyle = React.useMemo(() => {
      if (activeIndex === null) return {};
      const template = items.map((_, index) => (index === activeIndex ? "5fr" : "1fr")).join(" ");
      return isDesktop ? { gridTemplateColumns: template } : { gridTemplateRows: template };
    }, [activeIndex, items.length, isDesktop]);

    return (
      <ul
        className={cn(
          "w-full max-w-6xl gap-2 grid h-[600px] md:h-[500px] transition-[grid-template-columns,grid-template-rows] duration-500 ease-out",
          className
        )}
        style={{ ...gridStyle, ...(isDesktop ? { gridTemplateRows: "1fr" } : { gridTemplateColumns: "1fr" }) }}
        ref={ref}
        {...props}
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-vialmar-gold/30 bg-vialmar-brown-dark shadow-sm md:min-w-[80px] min-h-0 min-w-0"
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onClick={() => setActiveIndex(index)}
            tabIndex={0}
            data-active={activeIndex === index}
          >
            <img
              src={item.imgSrc}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover transition-all duration-300 ease-out group-data-[active=true]:scale-100 group-data-[active=true]:grayscale-0 scale-110 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vialmar-brown-dark/90 via-vialmar-brown-dark/40 to-transparent" />
            <article className="absolute inset-0 flex flex-col justify-end gap-2 p-4">
              <h3 className="hidden origin-left rotate-90 text-sm font-light uppercase tracking-wider text-vialmar-cream/80 opacity-100 transition-all duration-300 ease-out md:block group-data-[active=true]:opacity-0">
                {item.title}
              </h3>
              <div className="text-vialmar-gold-light opacity-0 transition-all duration-300 delay-75 ease-out group-data-[active=true]:opacity-100">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-vialmar-cream opacity-0 transition-all duration-300 delay-150 ease-out group-data-[active=true]:opacity-100">
                {item.title}
              </h3>
              <p className="w-full max-w-xs text-sm text-vialmar-cream/80 opacity-0 transition-all duration-300 delay-225 ease-out group-data-[active=true]:opacity-100">
                {item.description}
              </p>
            </article>
          </li>
        ))}
      </ul>
    );
  }
);
ExpandingCards.displayName = "ExpandingCards";

export const procesoItems: CardItem[] = [
  {
    id: "cultivo",
    title: "El Cultivo",
    description:
      "Cultivamos nuestro propio cacao agroforestal en el Valle del Cauca, con métodos sostenibles y respetuosos con la tierra.",
    imgSrc: "/images/cacao/proceso-cultivo.jpg",
    icon: <Sprout size={24} />,
  },
  {
    id: "cosecha",
    title: "La Cosecha",
    description: "Recolectamos las mazorcas en su punto justo de maduración para garantizar aroma y sabor.",
    imgSrc: "/images/cacao/proceso-cosecha.jpg",
    icon: <Sun size={24} />,
  },
  {
    id: "fermentacion",
    title: "Fermentación y Secado",
    description: "Un proceso artesanal que desarrolla nuestras notas frutales y de montaña pacífica.",
    imgSrc: "/images/cacao/proceso-fermentacion.jpg",
    icon: <Coffee size={24} />,
  },
  {
    id: "produccion",
    title: "Producción Artesanal",
    description: "Transformamos el grano en pastillas de cacao 100% natural, cuidando cada paso del proceso.",
    imgSrc: "/images/cacao/proceso-produccion.jpg",
    icon: <Package size={24} />,
  },
  {
    id: "distribucion",
    title: "Distribución",
    description: "Llevamos Vialmar desde nuestra finca hasta tu taza, en todo el país.",
    imgSrc: "/images/cacao/proceso-distribucion.jpg",
    icon: <Truck size={24} />,
  },
  {
    id: "calidad",
    title: "Más que Cacao, una Historia",
    description: "Cada pastilla refleja nuestro origen: Valle del Cauca, Antigua Vía al Mar, Colombia.",
    imgSrc: "/images/cacao/proceso-calidad.jpg",
    icon: <Award size={24} />,
  },
];
