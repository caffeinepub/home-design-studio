import { Home, Layers, StickyNote } from "lucide-react";
import { motion } from "motion/react";

export function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 drafting-grid relative overflow-hidden">
      {/* Decorative room outline */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <svg
          width="600"
          height="400"
          viewBox="0 0 600 400"
          fill="none"
          role="presentation"
          aria-hidden="true"
        >
          <rect
            x="40"
            y="40"
            width="520"
            height="320"
            stroke="oklch(0.22 0.055 268)"
            strokeWidth="3"
          />
          <rect
            x="80"
            y="80"
            width="160"
            height="200"
            stroke="oklch(0.22 0.055 268)"
            strokeWidth="2"
          />
          <rect
            x="280"
            y="80"
            width="240"
            height="120"
            stroke="oklch(0.22 0.055 268)"
            strokeWidth="2"
          />
          <rect
            x="280"
            y="240"
            width="240"
            height="80"
            stroke="oklch(0.22 0.055 268)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6"
        >
          <Home className="w-8 h-8 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="font-display text-4xl font-bold text-foreground mb-3 tracking-tight"
        >
          Home Design Studio
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-muted-foreground text-lg mb-8 leading-relaxed"
        >
          Design your dream home with precision. Create rooms, arrange
          furniture, and capture your style vision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="grid grid-cols-3 gap-4 text-sm"
        >
          {[
            {
              icon: Layers,
              title: "Floor Plans",
              desc: "Drag & drop furniture",
            },
            {
              icon: Home,
              title: "Room Manager",
              desc: "Custom dimensions",
            },
            {
              icon: StickyNote,
              title: "Mood Boards",
              desc: "Style inspiration",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/80 border border-border/60 backdrop-blur-sm"
            >
              <Icon className="w-5 h-5 text-accent" />
              <span className="font-ui font-semibold text-foreground">
                {title}
              </span>
              <span className="text-muted-foreground text-xs leading-snug">
                {desc}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          ← Add a room from the sidebar to get started
        </motion.p>
      </motion.div>
    </div>
  );
}
