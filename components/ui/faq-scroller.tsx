import React from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqRow {
  id: string;
  speed: string;
  direction: "left" | "right";
  faqItems: FaqItem[];
}

interface FaqData {
  mainTitle: string;
  mainSubtitle: string;
  rows: FaqRow[];
}

/**
 * FaqCard — tarjeta individual con estilo de etiqueta de marca
 */
export const FaqCard = ({ question, answer }: { question: string; answer: string }) => {
  return (
    <div className="flex flex-col items-start gap-3 p-6 bg-vialmar-cream border border-vialmar-gold/30 rounded-lg shadow-lg w-96 flex-shrink-0">
      <h3 className="text-xl font-serif font-bold text-vialmar-ink">{question}</h3>
      <p className="text-base text-vialmar-brown leading-relaxed">{answer}</p>
    </div>
  );
};

/**
 * HorizontalScroller — loop infinito de scroll horizontal
 */
export const HorizontalScroller = ({
  children,
  speed = "40s",
  direction = "left",
}: {
  children: React.ReactNode;
  speed?: string;
  direction?: "left" | "right";
}) => {
  const animationClass =
    direction === "right" ? "animate-scroll-horizontal-reverse" : "animate-scroll-horizontal";

  const style = { "--scroll-duration": speed } as React.CSSProperties;

  return (
    <div className="w-full overflow-hidden group relative scroller-mask">
      <div className={`flex ${animationClass}`} style={style}>
        <div className="flex items-stretch justify-center flex-shrink-0 gap-6 px-4">
          {children}
        </div>
        <div className="flex items-stretch justify-center flex-shrink-0 gap-6 px-4" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * FaqSection — título + filas de scroll
 */
const FaqSection = ({ data }: { data: FaqData }) => {
  return (
    <div className="relative flex flex-col items-center gap-12 p-10 w-full max-w-6xl mx-auto">
      <div className="flex flex-col items-center gap-4 text-center z-10 max-w-2xl">
        <h2
          className="text-4xl md:text-5xl font-serif font-bold text-vialmar-ink leading-tight"
          style={{ opacity: 0, animation: "fadeInUp 0.7s ease-out 0.2s forwards" }}
        >
          {data.mainTitle}
        </h2>
        <p
          className="text-lg text-vialmar-brown"
          style={{ opacity: 0, animation: "fadeInUp 0.7s ease-out 0.4s forwards" }}
        >
          {data.mainSubtitle}
        </p>
      </div>

      <div className="flex flex-col gap-8 z-10 w-full">
        {data.rows.map((row) => (
          <HorizontalScroller key={row.id} speed={row.speed} direction={row.direction}>
            {row.faqItems.map((item) => (
              <FaqCard key={item.id} question={item.question} answer={item.answer} />
            ))}
          </HorizontalScroller>
        ))}
      </div>
    </div>
  );
};

export default FaqSection;
