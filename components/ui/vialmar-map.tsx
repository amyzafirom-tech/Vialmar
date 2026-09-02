"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DottedMap from "dotted-map";
import Image from "next/image";

// Región alejada: Centroamérica + Suramérica (no el mundo completo), para que
// se reconozca claramente el contexto geográfico de Colombia, con Dagua marcado.
const REGION = {
  lat: { min: -18, max: 20 },
  lng: { min: -92, max: -60 },
};

// Ancho fijo del lienzo interno del SVG; el alto se deriva de la proporción
// real de la región geográfica (calculada a partir del mapa generado), para
// que no haya recorte ni distorsión entre el mapa punteado de fondo y los
// elementos superpuestos (ruta, pines, contorno de Colombia).
const MAP_WIDTH = 800;

const DOT_MAP_SETTINGS = {
  height: 90,
  grid: "diagonal" as const,
  region: REGION,
  projection: { name: "equirectangular" as const },
};

interface LocationPoint {
  lat: number;
  lng: number;
  label: string;
}

interface MapProps {
  /** Ruta animada opcional: de una ciudad de referencia hasta la ubicación de Vialmar */
  from: LocationPoint;
  to: LocationPoint;
  lineColor?: string;
  showLabels?: boolean;
  animationDuration?: number;
  loop?: boolean;
}

export function VialmarMap({
  from,
  to,
  lineColor = "#C9A227", // vialmar-gold
  showLabels = true,
  animationDuration = 2.5,
  loop = true,
}: MapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  // Mapa base (todo el continente dentro de la región) + mapa de Colombia solamente,
  // generados con los mismos parámetros para que sus grillas de puntos coincidan
  // exactamente. Del segundo extraemos solo los puntos de borde para oscurecerlos.
  const { svgMap, mapWidth, mapHeight, borderPoints } = useMemo(() => {
    const map = new DottedMap(DOT_MAP_SETTINGS);
    const colombiaMap = new DottedMap({ ...DOT_MAP_SETTINGS, countries: ["COL"] });
    const colombiaPoints = colombiaMap.getPoints();

    // Detección de borde: un punto de Colombia es "de borde" si tiene menos
    // vecinos (dentro del mismo país) que un punto totalmente interior.
    const step = 1; // separación de la grilla en unidades nativas del mapa
    const radius = step * 1.6;
    const neighborCounts = colombiaPoints.map((p) => {
      let count = 0;
      for (const q of colombiaPoints) {
        if (q === p) continue;
        if (Math.hypot(p.x - q.x, p.y - q.y) <= radius) count++;
      }
      return count;
    });
    const maxNeighbors = Math.max(...neighborCounts, 0);
    const border = colombiaPoints.filter((_, i) => neighborCounts[i] < maxNeighbors);

    const svg = map.getSVG({
      radius: 0.3,
      color: "#6B3F2350", // vialmar-brown con transparencia
      shape: "circle",
      backgroundColor: "#F5EFDD", // vialmar-cream
    });

    // El ancho/alto nativos del mapa (en unidades de grilla) se leen del propio
    // SVG generado — es la única forma pública y confiable de obtenerlos.
    const viewBoxMatch = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const nativeWidth = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 1;
    const nativeHeight = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 1;

    const width = MAP_WIDTH;
    const height = MAP_WIDTH * (nativeHeight / nativeWidth);

    // Reescala los puntos de borde (en unidades nativas del mapa punteado)
    // al mismo lienzo grande donde dibujamos la ruta y los pines.
    const scaledBorder = border.map((p) => ({
      x: (p.x / nativeWidth) * width,
      y: (p.y / nativeHeight) * height,
    }));

    return { svgMap: svg, mapWidth: width, mapHeight: height, borderPoints: scaledBorder };
  }, []);

  // Proyección lineal (equirectangular) dentro de la región — coincide exactamente
  // con la proyección usada para generar el mapa punteado de fondo.
  const projectPoint = (lat: number, lng: number) => {
    const x = ((lng - REGION.lng.min) / (REGION.lng.max - REGION.lng.min)) * mapWidth;
    const y = ((REGION.lat.max - lat) / (REGION.lat.max - REGION.lat.min)) * mapHeight;
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 40;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const totalAnimationTime = animationDuration;
  const pauseTime = 2;
  const fullCycleDuration = totalAnimationTime + pauseTime;

  const startPoint = projectPoint(from.lat, from.lng);
  const endPoint = projectPoint(to.lat, to.lng);
  const pathD = createCurvedPath(startPoint, endPoint);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${to.lat},${to.lng}`;

  return (
    <div
      className="w-full bg-vialmar-cream rounded-xl relative font-sans overflow-hidden border border-vialmar-gold/30 shadow-lg"
      style={{ aspectRatio: `${mapWidth} / ${mapHeight}` }}
    >
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_8%,white_92%,transparent)] pointer-events-none select-none object-cover"
        alt="Mapa de Colombia — ubicación de Vialmar"
        height={Math.round(mapHeight)}
        width={mapWidth}
        draggable={false}
        priority
      />
      <svg
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="w-full h-full absolute inset-0 pointer-events-auto select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="vialmar-path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F5EFDD" stopOpacity="0" />
            <stop offset="10%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="90%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="#F5EFDD" stopOpacity="0" />
          </linearGradient>
          <filter id="vialmar-glow">
            <feMorphology operator="dilate" radius="0.5" />
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Puntos de borde de Colombia — más oscuros, parte de la misma grilla del mapa */}
        {borderPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.4} fill="#4A2A17" opacity={0.55} />
        ))}

        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#vialmar-path-gradient)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={
            loop
              ? { pathLength: [0, 1, 1, 0] }
              : { pathLength: 1 }
          }
          transition={
            loop
              ? {
                  duration: fullCycleDuration,
                  times: [0, totalAnimationTime / fullCycleDuration, (totalAnimationTime + pauseTime * 0.6) / fullCycleDuration, 1],
                  ease: "easeInOut",
                  repeat: Infinity,
                }
              : { duration: animationDuration, ease: "easeInOut" }
          }
        />

        {loop && (
          <motion.circle
            r="4"
            fill={lineColor}
            initial={{ offsetDistance: "0%", opacity: 0 }}
            animate={{
              offsetDistance: ["0%", "100%", "100%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: fullCycleDuration,
              times: [0, totalAnimationTime / fullCycleDuration, 1],
              ease: "easeInOut",
              repeat: Infinity,
            }}
            style={{ offsetPath: `path('${pathD}')` }}
          />
        )}

        {/* Punto de origen (ciudad de referencia) */}
        <g>
          <motion.g
            onHoverStart={() => setHoveredLocation(from.label)}
            onHoverEnd={() => setHoveredLocation(null)}
            className="cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <circle cx={startPoint.x} cy={startPoint.y} r="3" fill={lineColor} filter="url(#vialmar-glow)" />
          </motion.g>
          {showLabels && (
            <foreignObject x={startPoint.x - 50} y={startPoint.y - 32} width="100" height="28">
              <div className="flex items-center justify-center h-full">
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-vialmar-cream/95 text-vialmar-ink border border-vialmar-gold/40 shadow-sm">
                  {from.label}
                </span>
              </div>
            </foreignObject>
          )}
        </g>

        {/* Punto de destino: Vialmar en Dagua — clic abre la ubicación en Google Maps */}
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${to.label} en Google Maps`}>
          <g>
            <motion.g
              onHoverStart={() => setHoveredLocation(to.label)}
              onHoverEnd={() => setHoveredLocation(null)}
              className="cursor-pointer"
              whileHover={{ scale: 1.2 }}
            >
              <circle cx={endPoint.x} cy={endPoint.y} r="4" fill={lineColor} filter="url(#vialmar-glow)" />
              <circle cx={endPoint.x} cy={endPoint.y} r="4" fill={lineColor} opacity="0.5">
                <animate attributeName="r" from="4" to="16" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            </motion.g>
            {showLabels && (
              <foreignObject x={endPoint.x - 70} y={endPoint.y - 40} width="140" height="34">
                <div className="flex h-full items-center justify-center">
                  <span className="cursor-pointer rounded-md border border-vialmar-gold bg-vialmar-gold px-2 py-1 text-center text-xs font-semibold text-vialmar-ink shadow-sm underline decoration-vialmar-ink/40 underline-offset-2 transition-colors hover:bg-vialmar-gold-light">
                    {to.label}
                  </span>
                </div>
              </foreignObject>
            )}
          </g>
        </a>
      </svg>

      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 bg-vialmar-brown-dark/90 text-vialmar-cream px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm sm:hidden"
          >
            {hoveredLocation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
