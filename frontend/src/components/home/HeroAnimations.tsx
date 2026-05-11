"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

interface Props {
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
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HeroAnimations({
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
      className="relative z-10 flex flex-col items-center gap-6 py-24"
    >
      <motion.div variants={itemVariants}>
        <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          🍔 Fast Food Delivery
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="max-w-2xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl"
      >
        <span className="text-primary">{title}</span>
        <br />
        <span>{subtitle}</span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="max-w-lg text-lg text-muted-foreground"
      >
        {description}
      </motion.p>

      <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
        <Link href="/menu">
          <Button size="lg" className="gap-2 text-base shadow-lg shadow-primary/30">
            {ctaOrder}
            <ArrowRight className="h-5 w-5 rtl-flip" />
          </Button>
        </Link>
        <Link href="/menu">
          <Button variant="outline" size="lg" className="text-base">
            {ctaExplore}
          </Button>
        </Link>
      </motion.div>

      <motion.div
        variants={itemVariants}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mt-8"
      >
        <ChevronDown className="h-6 w-6 text-muted-foreground" />
      </motion.div>
    </motion.div>
  );
}
