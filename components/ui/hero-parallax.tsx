"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export function HeroParallax() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const triggerElement = parallaxRef.current?.querySelector("[data-parallax-layers]");

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: triggerElement, start: "0% 0%", end: "100% 0%", scrub: 0 },
      });
      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 },
      ];
      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          { yPercent: layerObj.yPercent, ease: "none" },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      if (triggerElement) gsap.killTweensOf(triggerElement);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="parallax relative" ref={parallaxRef}>
      <section className="parallax__header relative h-screen w-full overflow-hidden bg-vialmar-brown-dark">
        <div className="parallax__visuals absolute inset-0">
          <div data-parallax-layers className="parallax__layers relative h-full w-full">
            <img
              src="/images/cacao/hero-montana.jpg"
              loading="eager"
              data-parallax-layer="1"
              alt="Montañas del Valle del Cauca"
              className="parallax__layer-img absolute inset-0 h-full w-full object-cover"
            />
            <img
              src="/images/cacao/hero-plantacion.jpg"
              loading="eager"
              data-parallax-layer="2"
              alt="Plantación de cacao agroforestal"
              className="parallax__layer-img absolute inset-0 h-full w-full object-cover opacity-70"
            />
            <div
              data-parallax-layer="3"
              className="parallax__layer-title absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 text-center"
            >
              <h1 className="font-serif text-6xl font-bold tracking-wide text-vialmar-cream drop-shadow-lg md:text-8xl">
                VIALMAR
              </h1>
              <p className="max-w-md px-4 text-sm uppercase tracking-[0.3em] text-vialmar-gold-light drop-shadow md:text-base">
                Más que cacao, una Historia
              </p>
            </div>
            <img
              src="/images/cacao/hero-mazorcas.jpg"
              loading="eager"
              data-parallax-layer="4"
              alt="Mazorcas de cacao abiertas"
              className="parallax__layer-img absolute bottom-0 h-2/3 w-full object-cover object-bottom"
            />
          </div>
          <div className="parallax__fade absolute inset-0 bg-gradient-to-t from-vialmar-brown-dark via-transparent to-transparent" />
        </div>
      </section>
    </div>
  );
}
