"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "motion/react"
import { Sparkles } from "lucide-react"

export function FloatingParticles() {
  const [mounted, setMounted] = useState(false)

  // Generate particles only once after mount to avoid hydration mismatch
  const particles = useMemo(() => {
    if (!mounted) return []
    
    return Array.from({ length: 20 }, (_, i) => {
      // Use deterministic seed based on index for consistent values
      const seed = i * 0.1
      return {
        id: i,
        x: (Math.sin(seed) * 0.5 + 0.5) * 100,
        y: (Math.cos(seed * 2) * 0.5 + 0.5) * 100,
        delay: (Math.sin(seed * 3) * 0.5 + 0.5) * 2,
        duration: 3 + (Math.sin(seed * 4) * 0.5 + 0.5) * 4,
        size: 4 + (Math.sin(seed * 5) * 0.5 + 0.5) * 8,
        xOffset: (Math.sin(seed * 6) * 0.5 + 0.5) * 20 - 10,
      }
    })
  }, [mounted])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" suppressHydrationWarning>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, particle.xOffset, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="h-3 w-3 text-primary" style={{ width: particle.size, height: particle.size }} />
        </motion.div>
      ))}
    </div>
  )
}
