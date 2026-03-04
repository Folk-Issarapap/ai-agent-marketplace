"use client"

import { useRef } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { motion, useInView } from "motion/react"

interface AnimatedSkillsProps {
  skills: string[]
}

export function AnimatedSkills({ skills }: AnimatedSkillsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div ref={ref} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {skills.map((skill, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: idx * 0.05, duration: 0.3 }}
        >
          <Badge
            variant="outline"
            className="shrink-0 text-xs px-3 py-1.5 cursor-default hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all"
          >
            {skill}
          </Badge>
        </motion.div>
      ))}
    </div>
  )
}
