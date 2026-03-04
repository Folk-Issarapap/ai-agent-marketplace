"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

interface AnimatedStatProps {
  value: string
  label: string
  delay?: number
}

export function AnimatedStat({ value, label, delay = 0 }: AnimatedStatProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Always render the same structure to avoid hydration mismatch
  // Start with visible state, then animate after mount
  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={mounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      suppressHydrationWarning
    >
      <motion.div
        className="text-3xl font-bold text-foreground mb-1"
        initial={{ scale: 1 }}
        animate={mounted ? { scale: 1 } : { scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        {value}
      </motion.div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
  )
}
