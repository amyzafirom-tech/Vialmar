"use client";

import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ArrowUp, Paperclip, X, MessageCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ---------- Tipos ----------
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
}

// ---------- Tooltip helpers ----------
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-vialmar-gold/40 bg-vialmar-brown-dark px-3 py-1.5 text-xs text-vialmar-cream shadow-md",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";

// ---------- Chips de acceso rápido ----------
const QUICK_CHIPS = [
  { label: "Ver productos", prompt: "¿Qué productos tienen disponibles y cuáles son sus precios?" },
  { label: "Precios y envíos", prompt: "¿Cuánto cuesta el envío y cuánto tarda en llegar?" },
  { label: "Hacer un pedido", prompt: "Quiero hacer un pedido, ¿cómo lo hago?" },
];

// ---------- Burbuja de mensaje ----------
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-vialmar-gold text-vialmar-ink rounded-br-sm"
            : "bg-vialmar-cream border border-vialmar-gold/30 text-vialmar-ink rounded-bl-sm"
        )}
      >
        {message.imagePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={message.imagePreview} alt="Adjunto" className="mb-2 max-h-40 rounded-lg object-cover" />
        )}
        {message.content}
      </div>
    </div>
  );
}

// ---------- Componente principal ----------
export function VialmarChat() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! Soy el asistente de Vialmar. Puedo ayudarte con productos, precios o tu pedido. ¿En qué te ayudo?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const uploadRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed && !file) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      imagePreview: filePreview ?? undefined,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setFile(null);
    setFilePreview(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Lo siento, hubo un problema de conexión. Intenta de nuevo." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <TooltipProvider>
      {/* Botón flotante */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-vialmar-gold text-vialmar-ink shadow-lg hover:bg-vialmar-gold-light transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir chat de Vialmar"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel del chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-5 z-50 flex h-[70vh] max-h-[600px] w-[92vw] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-vialmar-gold/40 bg-vialmar-cream shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-vialmar-gold/30 bg-vialmar-brown-dark px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vialmar-gold text-vialmar-ink font-serif font-bold">V</div>
              <div>
                <p className="text-sm font-semibold text-vialmar-cream">Asistente Vialmar</p>
                <p className="text-xs text-vialmar-cream/70">Productos, precios y pedidos</p>
              </div>
            </div>

            {/* Mensajes */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-vialmar-gold/30 bg-vialmar-cream px-4 py-2.5 text-sm text-vialmar-ink/60">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Escribiendo...
                  </div>
                </div>
              )}
            </div>

            {/* Chips de acceso rápido — solo si la conversación acaba de empezar */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => sendMessage(chip.prompt)}
                    className="rounded-full border border-vialmar-gold/50 bg-white/40 px-3 py-1 text-xs text-vialmar-ink hover:bg-vialmar-gold/20 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Preview de imagen adjunta */}
            {filePreview && (
              <div className="px-4 pb-2">
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={filePreview} alt="Adjunto" className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    onClick={() => { setFile(null); setFilePreview(null); }}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-vialmar-brown-dark p-0.5"
                  >
                    <X className="h-3 w-3 text-vialmar-cream" />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex items-end gap-2 border-t border-vialmar-gold/30 bg-vialmar-cream p-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => uploadRef.current?.click()}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-vialmar-brown hover:bg-vialmar-gold/20 transition-colors"
                  >
                    <Paperclip className="h-4.5 w-4.5" />
                    <input
                      ref={uploadRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Adjuntar foto de producto</TooltipContent>
              </Tooltip>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                rows={1}
                className="max-h-24 flex-1 resize-none rounded-xl border border-vialmar-gold/30 bg-white/60 px-3 py-2 text-sm text-vialmar-ink placeholder:text-vialmar-brown/50 focus:outline-none focus:ring-2 focus:ring-vialmar-gold/40"
              />

              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || (!input.trim() && !file)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-vialmar-gold text-vialmar-ink transition-colors hover:bg-vialmar-gold-light disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
