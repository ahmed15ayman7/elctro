"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

interface Props {
  heroBadge: string;
  title: string;
  subtitle: string;
  description: string;
  ctaOrder: string;
  ctaExplore: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroAnimations({
  heroBadge,
  title,
  subtitle,
  description,
  ctaOrder,
  ctaExplore,
}: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10 flex flex-col items-center gap-6 px-4 py-20 md:py-28"
    >
      <motion.div variants={itemVariants}>
        <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
          {heroBadge}
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="max-w-3xl text-center text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl"
      >
        <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent dark:to-amber-400">
          {title}
        </span>
        <br />
        <span className="text-foreground">{subtitle}</span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="max-w-xl text-center text-base text-muted-foreground md:text-lg md:leading-relaxed"
      >
        {description}
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="flex flex-wrap justify-center gap-3 md:gap-4"
      >
        <Link href="/menu" className="pointer-events-auto">
          <Button
            size="lg"
            className="gap-2 rounded-full px-8 text-base shadow-lg shadow-primary/30"
          >
            {ctaOrder}
            <ArrowRight className="h-5 w-5 rtl-flip" />
          </Button>
        </Link>
        <Link href="/menu" className="pointer-events-auto">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-primary/30 px-8 text-base"
          >
            {ctaExplore}
          </Button>
        </Link>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-[#C9A227]/40 flex items-start justify-center pt-2">
          <div className="w-1 h-3 rounded-full bg-[#C9A227]/60" />
        </div>
      </motion.div>
    </motion.div>
  );
}
