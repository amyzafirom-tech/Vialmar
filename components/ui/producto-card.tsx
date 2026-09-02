import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ProductoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  imageAlt: string;
  logo?: React.ReactNode;
  title: string;
  origen: string;
  overview: string;
  price: number;
  presentacion: string;
  onComprar: () => void;
}

const ProductoCard = React.forwardRef<HTMLDivElement, ProductoCardProps>(
  ({ className, imageUrl, imageAlt, logo, title, origen, overview, price, presentacion, onComprar, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative w-full max-w-sm overflow-hidden rounded-xl border border-vialmar-gold/40 bg-vialmar-brown-dark shadow-lg",
          "transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2",
          "aspect-[3/4]",
          className
        )}
        {...props}
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vialmar-brown-dark/90 via-vialmar-brown-dark/50 to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-6">
          <div className="flex h-12 items-start">
            {logo && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-vialmar-gold/60 bg-black/20 backdrop-blur-sm">
                {logo}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-2xl font-serif font-bold text-vialmar-cream">{title}</h3>
              <p className="text-sm text-vialmar-gold-light">{origen}</p>
            </div>
            <p className="text-sm text-vialmar-cream/80 leading-relaxed">{overview}</p>
          </div>

          {/* Precio siempre visible en móvil, con acento en desktop al hover */}
          <div className="mt-4 flex items-end justify-between border-t border-vialmar-gold/20 pt-4">
            <div>
              <span className="text-3xl font-bold text-vialmar-cream">${price.toLocaleString("es-CO")}</span>
              <span className="text-vialmar-cream/70 text-sm"> / {presentacion}</span>
            </div>
            <Button onClick={onComprar} size="lg" className="bg-vialmar-gold text-vialmar-ink hover:bg-vialmar-gold-light">
              Comprar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
ProductoCard.displayName = "ProductoCard";

export { ProductoCard };
