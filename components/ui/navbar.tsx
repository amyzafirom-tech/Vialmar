"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Position {
  left: number;
  width: number;
  opacity: number;
}

export const SlideTabs = ({
  tabs,
  onTabClick,
}: {
  tabs: string[];
  onTabClick?: (i: number) => void;
}) => {
  const [position, setPosition] = useState<Position>({ left: 0, width: 0, opacity: 0 });
  const [selected, setSelected] = useState(0);
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const selectedTab = tabsRef.current[selected];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({ left: selectedTab.offsetLeft, width, opacity: 1 });
    }
  }, [selected]);

  return (
    <ul
      onMouseLeave={() => {
        const selectedTab = tabsRef.current[selected];
        if (selectedTab) {
          const { width } = selectedTab.getBoundingClientRect();
          setPosition({ left: selectedTab.offsetLeft, width, opacity: 1 });
        }
      }}
      className="relative mx-auto flex w-fit rounded-full border-2 border-vialmar-gold bg-vialmar-cream/95 p-1 shadow-md backdrop-blur-sm"
    >
      {tabs.map((tab, i) => (
        <Tab
          key={tab}
          ref={(el) => {
            tabsRef.current[i] = el;
          }}
          setPosition={setPosition}
          onClick={() => {
            setSelected(i);
            onTabClick?.(i);
          }}
        >
          {tab}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  );
};

interface TabProps {
  children: React.ReactNode;
  setPosition: (pos: Position) => void;
  onClick: () => void;
}

const Tab = React.forwardRef<HTMLLIElement, TabProps>(({ children, setPosition, onClick }, ref) => {
  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        const el = ref as React.RefObject<HTMLLIElement | null>;
        if (!el?.current) return;
        const { width } = el.current.getBoundingClientRect();
        setPosition({ left: el.current.offsetLeft, width, opacity: 1 });
      }}
      className="relative z-10 block cursor-pointer px-4 py-2 text-xs uppercase tracking-wide text-vialmar-ink md:px-6 md:py-3 md:text-sm font-medium"
    >
      {children}
    </li>
  );
});
Tab.displayName = "Tab";

const Cursor = ({ position }: { position: Position }) => (
  <motion.li
    animate={{ ...position }}
    className="absolute z-0 h-8 rounded-full bg-vialmar-gold md:h-11"
  />
);
